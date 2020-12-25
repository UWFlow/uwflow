package terms

import (
	"context"

	"github.com/jackc/pgx/v4/pgxpool"

	"flow/importer/uwapiv3/api"
	"flow/importer/uwapiv3/common"
)

type termImporter struct {
	ctx    context.Context
	client *api.Client
	db     *pgxpool.Pool

	terms  []Term
	result common.DBResult
}

func NewImporter(ctx context.Context, client *api.Client, db *pgxpool.Pool) common.Importer {
	return &termImporter{ctx: ctx, client: client, db: db}
}

func (t *termImporter) Import() error {
	events, err := t.client.Events()
	if err != nil {
		return err
	}

	if err := t.convert(events); err != nil {
		return err
	}

	if err := t.save(); err != nil {
		return err
	}

	return nil
}
