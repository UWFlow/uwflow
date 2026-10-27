package format

import (
	"strings"
	"testing"
)

// Guards the fragile bit of the verification email: the template must render
// the recipient's code and carry the verification subject. Fails if a template
// field is renamed or the subject drifts.
func TestVerifyItemMessage(t *testing.T) {
	item := &VerifyItem{
		ID:        1,
		Email:     "feridun@uwflow.com",
		UserName:  "Feridun",
		SecretKey: "ABC123",
	}

	msg, err := item.Message()
	if err != nil {
		t.Fatalf("rendering verify message: %v", err)
	}

	if msg.To != item.Email {
		t.Errorf("To = %q, want %q", msg.To, item.Email)
	}
	if !strings.Contains(msg.Subject, "Verify") {
		t.Errorf("Subject = %q, want it to mention verification", msg.Subject)
	}
	body := string(msg.Body)
	if !strings.Contains(body, item.SecretKey) {
		t.Errorf("body missing verification code %q", item.SecretKey)
	}
	if !strings.Contains(body, item.UserName) {
		t.Errorf("body missing user name %q", item.UserName)
	}
}
