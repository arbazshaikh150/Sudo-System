package enums

import "fmt"

type NodeLabel string

const (
	Client   NodeLabel = "CLIENT"
	Redis    NodeLabel = "REDIS"
	Database NodeLabel = "DATABASE"
	RabbitMq NodeLabel = "RABBITMQ"
	Server   NodeLabel = "SERVER"
	Gateway  NodeLabel = "GATEWAY"
	Request  NodeLabel = "REQUEST"
)

var validLabels = map[NodeLabel]struct{}{
	Client:   {},
	Redis:    {},
	Database: {},
	Server:   {},
	Gateway:  {},
	Request:  {},
	RabbitMq: {},
}

func (l NodeLabel) Validate() error {
	if _, ok := validLabels[l]; !ok {
		return fmt.Errorf("invalid node label: %s", l)
	}
	return nil
}
