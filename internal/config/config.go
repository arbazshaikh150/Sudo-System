package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Neo4jConfig struct {
	URI      string
	Username string
	Password string
}

type Config struct {
	HTTPAddress string
	Neo4j       Neo4jConfig
}

// Loading the neo4j and also initialzing the server endpoint

func Load() (Config, error) {
	_ = godotenv.Load()

	cfg := Config{
		HTTPAddress: envOrDefault("HTTP_ADDR", ":8080"),
		Neo4j: Neo4jConfig{
			URI:      os.Getenv("NEO4J_URI"),
			Username: os.Getenv("NEO4J_USERNAME"),
			Password: os.Getenv("NEO4J_PASSWORD"),
		},
	}

	if cfg.Neo4j.URI == "" || cfg.Neo4j.Username == "" || cfg.Neo4j.Password == "" {
		return Config{}, fmt.Errorf("NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD must be set")
	}

	return cfg, nil
}

func envOrDefault(name, fallback string) string {
	if value := os.Getenv(name); value != "" {
		return value
	}
	return fallback
}
