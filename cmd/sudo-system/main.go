package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

func main() {
	godotenv.Load()
	uri := os.Getenv("NEO4J_URI")
	username := os.Getenv("NEO4J_USERNAME")
	password := os.Getenv("NEO4J_PASSWORD")

	driver, err := neo4j.NewDriverWithContext(
		uri,
		neo4j.BasicAuth(username, password, ""),
	)
	if err != nil {
		log.Fatal(err)
	}

	defer driver.Close(context.Background())

	err = driver.VerifyConnectivity(context.Background())
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connected to the CongoDb database")
}
