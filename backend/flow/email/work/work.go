package work

import (
	"flow/common/db"
	"flow/email/common"
)

// Arbitrarily chosen high value
const NumWorkers = 20

func Consume(mch chan *common.MailItem, ech chan error) {
	for i := 0; i < NumWorkers; i++ {
		go consumeEmailItems(mch, ech)
	}
}

func Produce(conn *db.Conn, mch chan *common.MailItem, ech chan error) {
	go produceEmailItems(conn, mch, ech)
}
