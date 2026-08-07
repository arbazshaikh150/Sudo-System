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
	handler := server.New(graphController)

	log.Printf("sudo-system API listening on %s", cfg.HTTPAddress)
	if err := http.ListenAndServe(cfg.HTTPAddress, handler); err != nil {
		log.Fatal(err)
	}
}
