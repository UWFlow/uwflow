package main

import (
	"context"
	"database/sql/driver"
	"fmt"
	"strings"
	"time"

	"flow/common/db"

	"github.com/jackc/pgx/v5"
)

const (
	// Postgres cancels any statement that runs longer than this.
	statementTimeout = 15 * time.Second
	// Rows beyond this are dropped from a result; the model is told so.
	maxRows = 200
	// Results are cut at this many bytes so one query cannot flood the context.
	maxResultBytes = 30_000
)

const listTablesQuery = `
SELECT n.nspname AS schema, c.relname AS name,
  CASE c.relkind WHEN 'r' THEN 'table' WHEN 'v' THEN 'view' ELSE 'materialized view' END AS kind,
  obj_description(c.oid, 'pg_class') AS comment
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind IN ('r', 'v', 'm')
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND has_any_column_privilege(c.oid, 'SELECT')
ORDER BY 1, 2`

const describeTableQuery = `
SELECT a.attname AS column, format_type(a.atttypid, a.atttypmod) AS type,
  NOT a.attnotnull AS nullable, col_description(c.oid, a.attnum) AS comment
FROM pg_attribute a
JOIN pg_class c ON c.oid = a.attrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = $1 AND c.relname = $2
  AND a.attnum > 0 AND NOT a.attisdropped
  AND has_column_privilege(c.oid, a.attnum, 'SELECT')
ORDER BY a.attnum`

// readOnlyQuery runs one statement in a read-only transaction with a statement
// timeout and returns the result as tab-separated text. The bot's database role
// is the real boundary; the transaction mode is a second guard. pgx's extended
// protocol rejects input containing more than one statement.
func readOnlyQuery(ctx context.Context, conn *db.Conn, query string, args ...interface{}) (string, error) {
	tx, err := conn.BeginWithContext(ctx)
	if err != nil {
		return "", err
	}
	// Nothing is ever committed.
	defer tx.Rollback()

	if _, err := tx.Exec("SET TRANSACTION READ ONLY"); err != nil {
		return "", err
	}
	timeout := fmt.Sprintf("SET LOCAL statement_timeout = %d", statementTimeout.Milliseconds())
	if _, err := tx.Exec(timeout); err != nil {
		return "", err
	}

	rows, err := tx.Query(query, args...)
	if err != nil {
		return "", err
	}
	defer rows.Close()
	return formatRows(rows)
}

func formatRows(rows pgx.Rows) (string, error) {
	var out strings.Builder
	var header []string
	for _, field := range rows.FieldDescriptions() {
		header = append(header, field.Name)
	}
	out.WriteString(strings.Join(header, "\t"))
	out.WriteByte('\n')

	count, truncated := 0, false
	for rows.Next() {
		if count == maxRows || out.Len() > maxResultBytes {
			truncated = true
			break
		}
		values, err := rows.Values()
		if err != nil {
			return "", err
		}
		cells := make([]string, len(values))
		for i, value := range values {
			cells[i] = formatValue(value)
		}
		out.WriteString(strings.Join(cells, "\t"))
		out.WriteByte('\n')
		count++
	}
	if err := rows.Err(); err != nil {
		return "", err
	}

	if truncated {
		fmt.Fprintf(&out, "(truncated after %d rows; add a LIMIT or aggregate)\n", count)
	} else {
		fmt.Fprintf(&out, "(%d rows)\n", count)
	}
	return out.String(), nil
}

var cellEscaper = strings.NewReplacer("\t", `\t`, "\n", `\n`, "\r", `\r`)

func formatValue(value interface{}) string {
	// pgtype values such as Numeric and Interval render through driver.Valuer.
	if valuer, ok := value.(driver.Valuer); ok {
		v, err := valuer.Value()
		if err != nil {
			return fmt.Sprintf("<%v>", err)
		}
		value = v
	}
	switch v := value.(type) {
	case nil:
		return "NULL"
	case time.Time:
		return v.Format(time.RFC3339)
	case []byte:
		return fmt.Sprintf("<%d bytes>", len(v))
	case string:
		return cellEscaper.Replace(v)
	default:
		return cellEscaper.Replace(fmt.Sprint(v))
	}
}

// splitTableName accepts "schema.name" or a bare name in the public schema.
func splitTableName(qualified string) (schema, name string) {
	qualified = strings.ReplaceAll(strings.TrimSpace(qualified), `"`, "")
	if schema, name, ok := strings.Cut(qualified, "."); ok {
		return schema, name
	}
	return "public", qualified
}
