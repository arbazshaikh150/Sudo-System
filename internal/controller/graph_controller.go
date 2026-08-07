package controller

import (
	"context"

	"github.com/arbazshaikh150/Sudo-System/internal/dto"
)

type GraphService interface {
	CreateNode(context.Context, dto.CreateNodeRequest) (map[string]any, error)
	DeleteNode(context.Context, dto.DeleteNodeRequest) error
	UpdateNode(context.Context, dto.UpdateNodeRequest) (map[string]any, error)
	FetchNode(context.Context, dto.FetchNodeRequest) (map[string]any, error)
	CreateRelationship(context.Context, dto.CreateRelationshipRequest) (map[string]any, error)
	SendMessage(context.Context, dto.MessageRequest) (map[string]any, error)
}

type GraphController struct {
	service GraphService
}

func NewGraphController(service GraphService) *GraphController {
	return &GraphController{service: service}
}

func (c *GraphController) CreateNode(ctx context.Context, input dto.CreateNodeRequest) (map[string]any, error) {
	return c.service.CreateNode(ctx, input)
}

func (c *GraphController) DeleteNode(ctx context.Context, input dto.DeleteNodeRequest) error {
	return c.service.DeleteNode(ctx, input)
}

func (c *GraphController) UpdateNode(ctx context.Context, input dto.UpdateNodeRequest) (map[string]any, error) {
	return c.service.UpdateNode(ctx, input)
}

func (c *GraphController) FetchNode(ctx context.Context, input dto.FetchNodeRequest) (map[string]any, error) {
	return c.service.FetchNode(ctx, input)
}

func (c *GraphController) CreateRelationship(ctx context.Context, input dto.CreateRelationshipRequest) (map[string]any, error) {
	return c.service.CreateRelationship(ctx, input)
}

func (c *GraphController) SendMessage(ctx context.Context, input dto.MessageRequest) (map[string]any, error) {
	return c.service.SendMessage(ctx, input)
}
