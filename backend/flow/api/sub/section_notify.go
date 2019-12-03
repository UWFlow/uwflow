package sub

import (
	"encoding/json"
	"fmt"
	"net/http"

	"flow/api/serde"
	"flow/common/state"
)

const htmlTemplate = `
<html>
<head>
	<title></title>
	<link href="https://svc.webspellchecker.net/spellcheck31/lf/scayt3/ckscayt/css/wsc.css" rel="stylesheet" type="text/css" />
</head>
<body aria-readonly="false" style="cursor: auto;">
<table align="center" border="0" cellpadding="1" cellspacing="1" style="width:75px">
	<tbody>
		<tr>
			<td><img src="https://drive.google.com/thumbnail?id=1YDOe56_8mQDFLGmDwXYl8IYq2MsicWO8"/></td>
		</tr>
	</tbody>
</table>
<table align="center" border="0" cellpadding="1" cellspacing="1" style="width:600px">
	<tbody>
		<tr>
			<td><span style="font-size:14px;font-family:arial,helvetica,sans-serif;">
				Hi {{.Name}},<br /><br />
				You subscribed to one (or more) sections in {{.CourseCode}}.<br /><br />
				We’ll notify you when enrolment drops so that at least one seat is open in a section you subscribed to.<br /><br />
				If you’d like to unsubscribe, navigate to {{.CourseURL}}, sign in, and click the blue bell icon on sections you don’t want to hear about.<br /><br />
				Cheers,<br />
				UW Flow
			</span></td>
		</tr>
	</tbody>
</table>

</body>
</html>`

type subscriptionData struct {
	Name       string
	CourseCode string
	CourseURL  string
}

type sectionNotifyRequest struct {
	SectionID *int `json:"section_id"`
}

func SubscribeToSection(state *state.State, w http.ResponseWriter, r *http.Request) {
	// parse section id from request body
	body := sectionNotifyRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		serde.Error(w, "Expected non-empty body", http.StatusBadRequest)
		return
	}
	if body.SectionID == nil {
		serde.Error(w, "Expected {section_id}", http.StatusBadRequest)
		return
	}

	userID, err := serde.UserIdFromRequest(state, r)
	if err != nil {
		serde.Error(w, "Authorization failed", http.StatusUnauthorized)
		return
	}

	// Check section id is valid and fetch course id
	var courseID int
	err = state.Db.QueryRow(
		`SELECT course_id FROM course_section WHERE id = $1`,
		*body.SectionID,
	).Scan(&courseID)
	if err != nil {
		serde.Error(w, "Provided section id is invalid", http.StatusBadRequest)
		return
	}

	// Check if already subscribed to course
	var alreadySubscribedToCourse bool
	err = state.Db.QueryRow(
		`SELECT EXISTS(
			SELECT
			FROM section_subscription ss
			  LEFT JOIN course_section cs
				ON ss.section_id = cs.id
			WHERE cs.course_id = $1
		)`, courseID,
	).Scan(&alreadySubscribedToCourse)
	if err != nil {
		serde.Error(w, "Failed fetch", http.StatusInternalServerError)
		return
	}

	if !alreadySubscribedToCourse {
		var email string
		var data subscriptionData
		err = state.Db.QueryRow(
			`SELECT email, full_name FROM public.user WHERE id = $1`, userID,
		).Scan(&email, &data.Name)
		if err != nil {
			serde.Error(w, "Failed fetch", http.StatusInternalServerError)
			return
		}

		err = state.Db.QueryRow(
			`SELECT code FROM course WHERE id = $1`, courseID,
		).Scan(&data.CourseCode)
		if err != nil {
			serde.Error(w, "Failed fetch", http.StatusInternalServerError)
			return
		}
		data.CourseURL = fmt.Sprintf("https://uwflow.com/course/%s", data.CourseCode)

		err = SendAutomatedEmail(
			state, []string{email},
			fmt.Sprintf("You’re all set to receive notifications for %s", data.CourseCode),
			htmlTemplate, data)
		if err != nil {
			serde.Error(w, "Failed to send subscription notification", http.StatusInternalServerError)
		}
	}

	// insert into section_subscription table
	_, err = state.Db.Exec(
		"INSERT INTO section_subscription(user_id, section_id) VALUES ($1, $2)",
		userID, *body.SectionID,
	)
	if err != nil {
		serde.Error(w, "Error inserting for user_id", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func UnsubscribeToSection(state *state.State, w http.ResponseWriter, r *http.Request) {
	// parse section id from request body
	body := sectionNotifyRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		serde.Error(w, "Expected non-empty body", http.StatusBadRequest)
		return
	}
	if body.SectionID == nil {
		serde.Error(w, "Expected {section_id}", http.StatusBadRequest)
		return
	}

	userID, err := serde.UserIdFromRequest(state, r)
	if err != nil {
		serde.Error(w, "Authorization failed", http.StatusUnauthorized)
		return
	}

	// delete from section_subscription table
	tag, err := state.Db.Exec(
		"DELETE FROM section_subscription WHERE user_id = $1 AND section_id = $2",
		userID, *body.SectionID,
	)
	if err != nil {
		serde.Error(w, "Error unsubscribing", http.StatusInternalServerError)
		return
	}
	if tag.RowsAffected() == 0 {
		serde.Error(w, "Invalid user_id, section_id pair", http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
}
