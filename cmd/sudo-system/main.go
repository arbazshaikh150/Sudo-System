package main

import (
	"context"
	"log"
	"net/http"

	"github.com/arbazshaikh150/Sudo-System/internal/config"
	"github.com/arbazshaikh150/Sudo-System/internal/controller"
	"github.com/arbazshaikh150/Sudo-System/internal/repository"
	"github.com/arbazshaikh150/Sudo-System/internal/server"
)

// TODO : 1) Updating the redis / Queue ( with the durable / ttl capacity)
// TODO : 2) Adding a goRoutine which can do my background task for the retrievel based on label and then do the necessary operations
// TODO: 3) Goroutine for finding the notConnected nodes and then making there status as notConnnected ( user is going to be notified)
// TODO : 4) Making the system as weighted network and then performing Dijkstra algorithm for finding the shortest path

func main() {
	ctx := context.Background()
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	driver, err := repository.NewNeo4jDriver(ctx, cfg.Neo4j)
	if err != nil {
		log.Fatal(err)
	}
	defer driver.Close(ctx)

	graphController := controller.NewGraphController(repository.NewGraphRepository(driver))
	handler := server.New(graphController, server.NewAsyncWorker(driver))

	log.Printf("sudo-system API listening on %s", cfg.HTTPAddress)
	if err := http.ListenAndServe(cfg.HTTPAddress, handler); err != nil {
		log.Fatal(err)
	}
}
