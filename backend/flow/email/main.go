package main

import (
	"context"
	"flow/api/env"
	"flow/common/db"
	"flow/common/util"
	"flow/email/work"
	"log"
)

func main() {
	var conn *db.Conn
	var err error

	conn, err = db.ConnectPool(context.Background(), env.Global)
	if err != nil {
		log.Fatal(err)
	}

	var mch = make(chan util.MailItem)
	var ech = make(chan error)

	work.Produce(conn, mch, ech)
	work.Consume(mch, ech)
	for {
		err = <-ech
		log.Print(err)
	}
}
