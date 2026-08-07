package dto

import (
	"github.com/arbazshaikh150/Sudo-System/internal/enums"
)

type CreateNodeRequest struct {
	NodeLabel enums.NodeLabel `json:"nodeLabel"`
	NodeKey   string          `json:"nodeKey"`
}

type DeleteNodeRequest struct {
	NodeLabel enums.NodeLabel `json:"nodeLabel"`
	NodeKey   string          `json:"nodeKey"`
}

type UpdateNodeRequest struct {
	NodeLabel  enums.NodeLabel `json:"nodeLabel"`
	NodeKey    string          `json:"nodeKey"`
	UpdateData map[string]any  `json:"updateData"`
}

type FetchNodeRequest struct {
	NodeLabel enums.NodeLabel `json:"nodeLabel"`
	NodeKey   string          `json:"nodeKey"`
}

type CreateRelationshipRequest struct {
	FromLabel         enums.NodeLabel `json:"fromLabel"`
	FromIdentifier    string          `json:"fromIdentifier"`
	ToLabel           enums.NodeLabel `json:"toLabel"`
	ToIdentifier      string          `json:"toIdentifier"`
	RelationshipLabel enums.NodeLabel `json:"relationshipLabel"`
	RelationshipKey   string          `json:"relationshipKey"`
	Relationship      string          `json:"relationship"`
	Attribute         map[string]any  `json:"attribute"`
}

type MessageRequest struct {
	MessageID        string          `json:"messageId"`
	ClientLabel      enums.NodeLabel `json:"clientLabel"`
	ClientKey        string          `json:"clientKey"`
	DestinationLabel enums.NodeLabel `json:"destinationLabel"`
	DestinationKey   string          `json:"destinationKey"`
}
