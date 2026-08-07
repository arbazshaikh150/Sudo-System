package repository

import (
	"context"
	"fmt"

	"github.com/arbazshaikh150/Sudo-System/internal/config"
	"github.com/arbazshaikh150/Sudo-System/internal/dto"
	"github.com/arbazshaikh150/Sudo-System/internal/enums"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

type GraphRepository struct {
	driver neo4j.DriverWithContext
}

// Making the connection with the Congodb
func NewNeo4jDriver(ctx context.Context, cfg config.Neo4jConfig) (neo4j.DriverWithContext, error) {
	driver, err := neo4j.NewDriverWithContext(cfg.URI, neo4j.BasicAuth(cfg.Username, cfg.Password, ""))
	if err != nil {
		return nil, fmt.Errorf("create neo4j driver: %w", err)
	}
	if err := driver.VerifyConnectivity(ctx); err != nil {
		driver.Close(ctx)
		return nil, fmt.Errorf("verify neo4j connectivity: %w", err)
	}
	fmt.Println("Successfully Connected to congodb")
	return driver, nil
}

// Giving the same reference of the graphRepository driver ( which is being connected to the neo4j)
func NewGraphRepository(driver neo4j.DriverWithContext) *GraphRepository {
	return &GraphRepository{driver: driver}
}

// Creating a node and it should be of predefined only
func (r *GraphRepository) CreateNode(ctx context.Context, input dto.CreateNodeRequest) (map[string]any, error) {
	if err := validName(input.NodeLabel); err != nil {
		return nil, err
	}
	return r.single(ctx, fmt.Sprintf("MERGE (n:%s {nodeKey: $nodeKey}) RETURN properties(n) AS node", input.NodeLabel), map[string]any{"nodeKey": input.NodeKey})
}

// Deleting the node
func (r *GraphRepository) DeleteNode(ctx context.Context, input dto.DeleteNodeRequest) error {
	if err := validName(input.NodeLabel); err != nil {
		return err
	}
	result, err := r.write(ctx, fmt.Sprintf("MATCH (n:%s {nodeKey: $nodeKey}) DETACH DELETE n", input.NodeLabel), map[string]any{"nodeKey": input.NodeKey})
	if err != nil {
		return err
	}
	_, err = result.Consume(ctx)
	return err
}

// Updating the content inside the node
func (r *GraphRepository) UpdateNode(ctx context.Context, input dto.UpdateNodeRequest) (map[string]any, error) {
	if err := validName(input.NodeLabel); err != nil {
		return nil, err
	}
	return r.single(ctx, fmt.Sprintf("MATCH (n:%s {nodeKey: $nodeKey}) SET n += $updateData RETURN properties(n) AS node", input.NodeLabel), map[string]any{"nodeKey": input.NodeKey, "updateData": input.UpdateData})
}

func (r *GraphRepository) FetchNode(ctx context.Context, input dto.FetchNodeRequest) (map[string]any, error) {
	if err := validName(input.NodeLabel); err != nil {
		return nil, err
	}
	return r.single(ctx, fmt.Sprintf("MATCH (n:%s {nodeKey: $nodeKey}) RETURN properties(n) AS node", input.NodeLabel), map[string]any{"nodeKey": input.NodeKey})
}

func (r *GraphRepository) CreateRelationship(ctx context.Context, input dto.CreateRelationshipRequest) (map[string]any, error) {
	// validating the necessary labels should be there
	for _, name := range []enums.NodeLabel{input.FromLabel, input.ToLabel, input.RelationshipLabel} {
		if err := validName(name); err != nil {
			return nil, err
		}
	}

	// Extra attributed per edge (example the throughput the latency delay , etc etc)
	attributes := input.Attribute
	if attributes == nil {
		attributes = map[string]any{}
	}
	attributes["relationship"] = input.Relationship
	// Creating a complex query
	query := fmt.Sprintf("MATCH (from:%s {nodeKey: $fromIdentifier}) MATCH (to:%s {nodeKey: $toIdentifier}) MERGE (from)-[rel:%s {relationshipKey: $relationshipKey}]->(to) SET rel += $attributes RETURN properties(rel) AS relationship", input.FromLabel, input.ToLabel, input.RelationshipLabel)
	// Inserting inside the database
	return r.single(ctx, query, map[string]any{"fromIdentifier": input.FromIdentifier, "toIdentifier": input.ToIdentifier, "relationshipKey": input.RelationshipKey, "attributes": attributes})
}

// SendMessage finds the shortest directed route from the client to the destination.
// Neo4j's shortestPath traversal uses breadth-first search for this query.
func (r *GraphRepository) SendMessage(ctx context.Context, input dto.MessageRequest) (map[string]any, error) {
	// Important because fmt.sprintf is using and user can add some malicious information as well
	
	for _, label := range []enums.NodeLabel{input.ClientLabel, input.DestinationLabel} {
		if err := validName(label); err != nil {
			return nil, err
		}
	}

	// bounding to at max 20 intermediate traversal
	query := fmt.Sprintf(`
		MATCH (client:%s {nodeKey: $clientKey}),
		      (destination:%s {nodeKey: $destinationKey})
		MATCH path = shortestPath((client)-[*..20]->(destination))
		RETURN $messageId AS messageId,
		       [node IN nodes(path) | node.nodeKey] AS keys,
		       [relationship IN relationships(path) | {
			fromKey: startNode(relationship).nodeKey,
			toKey: endNode(relationship).nodeKey,
			relationshipLabel: type(relationship),
			relationshipKey: relationship.relationshipKey,
			relationship: relationship.relationship
		       }] AS transitions
	`, input.ClientLabel, input.DestinationLabel)

	result, err := r.write(ctx, query, map[string]any{
		"messageId":      input.MessageID,
		"clientKey":      input.ClientKey,
		"destinationKey": input.DestinationKey,
	})
	if err != nil {
		return nil, err
	}

	record, err := result.Single(ctx)
	if err != nil {
		return nil, fmt.Errorf("no route from client to destination: %w", err)
	}
	return record.AsMap(), nil
}

func (r *GraphRepository) single(ctx context.Context, query string, params map[string]any) (map[string]any, error) {
	result, err := r.write(ctx, query, params)
	if err != nil {
		return nil, err
	}
	record, err := result.Single(ctx)
	if err != nil {
		return nil, fmt.Errorf("record not found: %w", err)
	}
	value, ok := record.Get("node")
	if !ok {
		value, ok = record.Get("relationship")
	}
	if !ok {
		value, ok = record.Get("message")
	}
	if !ok {
		return nil, fmt.Errorf("query returned no entity")
	}
	entity, ok := value.(map[string]any)
	if !ok {
		return nil, fmt.Errorf("unexpected entity response")
	}
	return entity, nil
}

func (r *GraphRepository) write(ctx context.Context, query string, params map[string]any) (neo4j.ResultWithContext, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)
	result, err := session.Run(ctx, query, params)
	if err != nil {
		return nil, fmt.Errorf("neo4j query: %w", err)
	}
	return result, nil
}

func validName(input enums.NodeLabel) error {
	if err := input.Validate(); err != nil {
		return err
	}
	return nil
}
