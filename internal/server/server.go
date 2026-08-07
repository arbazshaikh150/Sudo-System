package server

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/arbazshaikh150/Sudo-System/internal/controller"
	"github.com/arbazshaikh150/Sudo-System/internal/dto"
	"github.com/arbazshaikh150/Sudo-System/internal/enums"
)

func New(graph *controller.GraphController, workers ...*AsyncWorker) http.Handler {
	var worker *AsyncWorker
	if len(workers) > 0 {
		worker = workers[0]
	}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /create/node", createNode(graph))
	mux.HandleFunc("DELETE /delete/node", deleteNode(graph))
	mux.HandleFunc("POST /create/relationship", createRelationship(graph))
	mux.HandleFunc("PUT /update/node", updateNode(graph))
	mux.HandleFunc("GET /fetch/node/{label}/{nodeKey}", fetchNode(graph))
	mux.HandleFunc("POST /message", sendMessage(graph, worker))
	return mux
}

func createNode(graph *controller.GraphController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var input dto.CreateNodeRequest
		if !decode(w, r, &input) {
			return
		}
		result, err := graph.CreateNode(r.Context(), input)
		respondResult(w, http.StatusCreated, "node created", result, err)
	}
}

func deleteNode(graph *controller.GraphController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var input dto.DeleteNodeRequest
		if !decode(w, r, &input) {
			return
		}
		if err := graph.DeleteNode(r.Context(), input); err != nil {
			respondError(w, http.StatusBadRequest, err)
			return
		}
		respond(w, http.StatusOK, map[string]string{"message": "node deleted"})
	}
}

func createRelationship(graph *controller.GraphController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var input dto.CreateRelationshipRequest
		if !decode(w, r, &input) {
			return
		}
		result, err := graph.CreateRelationship(r.Context(), input)
		respondResult(w, http.StatusCreated, "relationship created", result, err)
	}
}

func updateNode(graph *controller.GraphController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var input dto.UpdateNodeRequest
		if !decode(w, r, &input) {
			return
		}
		result, err := graph.UpdateNode(r.Context(), input)
		respondResult(w, http.StatusOK, "node updated", result, err)
	}
}

func fetchNode(graph *controller.GraphController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Fetching from the path variables
		nodeLabel := r.PathValue("label")
		nodeKey := r.PathValue("nodeKey")
		input := dto.FetchNodeRequest{NodeLabel: enums.NodeLabel(nodeLabel), NodeKey: nodeKey}

		if input.NodeLabel == "" || input.NodeKey == "" {
			if !decode(w, r, &input) {
				return
			}
		}
		result, err := graph.FetchNode(r.Context(), input)
		respondResult(w, http.StatusOK, "node fetched", result, err)
	}
}

func sendMessage(graph *controller.GraphController, worker *AsyncWorker) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var input dto.MessageRequest
		if !decode(w, r, &input) {
			return
		}
		result, err := graph.SendMessage(r.Context(), input)
		if err == nil && worker != nil {
			worker.RecordMessageOnPath(input.MessageID, pathKeys(result["keys"]))
		}
		respondResult(w, http.StatusCreated, "message delivered", result, err)
	}
}

func pathKeys(value any) []string {
	values, ok := value.([]any)
	if !ok {
		return nil
	}

	keys := make([]string, 0, len(values))
	for _, value := range values {
		if key, ok := value.(string); ok {
			keys = append(keys, key)
		}
	}
	return keys
}

func decode(w http.ResponseWriter, r *http.Request, target any) bool {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(target); err != nil {
		respondError(w, http.StatusBadRequest, fmt.Errorf("invalid JSON request: %w", err))
		return false
	}
	return true
}

func respondResult(w http.ResponseWriter, status int, message string, result map[string]any, err error) {
	if err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}
	respond(w, status, map[string]any{"message": message, "data": result})
}

func respondError(w http.ResponseWriter, status int, err error) {
	respond(w, status, map[string]string{"error": err.Error()})
}

func respond(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}
