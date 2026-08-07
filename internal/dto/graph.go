package dto

type CreateNodeRequest struct {
	NodeLabel string `json:"nodeLabel"`
	NodeKey   string `json:"nodeKey"`
}

type DeleteNodeRequest struct {
	NodeLabel string `json:"nodeLabel"`
	NodeKey   string `json:"nodeKey"`
}

type UpdateNodeRequest struct {
	NodeLabel  string         `json:"nodeLabel"`
	NodeKey    string         `json:"nodeKey"`
	UpdateData map[string]any `json:"updateData"`
}

type FetchNodeRequest struct {
	NodeLabel string `json:"nodeLabel"`
	NodeKey   string `json:"nodeKey"`
}

type CreateRelationshipRequest struct {
	FromLabel         string         `json:"fromLabel"`
	FromIdentifier    string         `json:"fromIdentifier"`
	ToLabel           string         `json:"toLabel"`
	ToIdentifier      string         `json:"toIdentifier"`
	RelationshipLabel string         `json:"relationshipLabel"`
	RelationshipKey   string         `json:"relationshipKey"`
	Relationship      string         `json:"relationship"`
	Attribute         map[string]any `json:"attribute"`
}

type MessageRequest struct {
	MessageID   string `json:"messageId"`
	Destination string `json:"destination"`
}
