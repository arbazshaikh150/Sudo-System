package server

import (
	"context"
	"log"
	"time"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

// AsyncWorker performs non-blocking updates after a message route is returned.
type AsyncWorker struct {
	driver neo4j.DriverWithContext
}

func NewAsyncWorker(driver neo4j.DriverWithContext) *AsyncWorker {
	return &AsyncWorker{driver: driver}
}

// TODO : Here i can use Worker Poll , now i am creating a go routine for
// each api call
// RecordMessageOnPath stores the message ID as a property and its send time as
// the value on Redis, Database, and RabbitMQ nodes included in the route.
func (w *AsyncWorker) RecordMessageOnPath(messageID string, keys []string) {
	if w == nil || messageID == "" || len(keys) == 0 {
		return
	}

	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		session := w.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
		defer session.Close(ctx)

		// query := `
		// 	MATCH (node)
		// 	WHERE node.nodeKey IN $keys
		// 	AND (node:REDIS OR node:DATABASE OR node:RABBITMQ)
		// 	CALL apoc.create.setProperty(node, $messageID, datetime()) YIELD node
		// 	RETURN count(node) AS updated
		// `

		// Another approach would be
		query := `
		MATCH (node)
		WHERE node.nodeKey IN $keys
		AND (node:REDIS OR node:DATABASE OR node:RABBITMQ)
		SET node += $updateData
		`

		updateData := map[string]any{
			messageID: time.Now(),
		}

		result, err := session.Run(ctx, query, map[string]any{
			"keys":       keys,
			"updateData": updateData,
		})
		if err == nil {
			_, err = result.Consume(ctx)
		}
		if err != nil {
			log.Printf("async message update failed for %q: %v", messageID, err)
		}

		log.Println("Async Update Successful")
	}()
}
