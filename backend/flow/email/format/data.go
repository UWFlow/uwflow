package format

// Message describes a marshaled message ready for sending.
type Message struct {
	// Body is the full message body, including SMTP headers.
	Body []byte
	// Subject is the SMTP message subject.
	Subject string
	// To is the SMTP message recipient.
	To string
}

// QueueItem is a row of an unspecified queue table.
type QueueItem interface {
	// RowID returns an identifier unique to this item's row.
	// This value is consumed by writeQuery in the associated queueInfo.
	RowID() int
	// Message formats the item as a sendable message.
	Message() (Message, error)
}

// ResetItem is a row of queue.password_reset.
type ResetItem struct {
	ID        int
	Email     string
	UserName  string
	SecretKey string
}

// RowID implements QueueItem.
func (it *ResetItem) RowID() int { return it.ID }

// SubscribedItem is a row of queue.section_subscribed.
type SubscribedItem struct {
	ID         int
	Email      string
	UserName   string
	CourseCode string
	CourseURL  string
}

// RowID implements QueueItem.
func (it *SubscribedItem) RowID() int { return it.ID }

// VacatedItem is a row of queue.section_vacated.
type VacatedItem struct {
	ID           int
	Email        string
	UserName     string
	CourseCode   string
	CourseURL    string
	SectionNames []string
}

// RowID implements QueueItem.
func (it *VacatedItem) RowID() int { return it.ID }
