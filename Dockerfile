# Build the Go API as a small, non-root production image.
FROM golang:1.26.4-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags='-s -w' -o /sudo-system ./cmd/sudo-system

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /sudo-system /sudo-system
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/sudo-system"]
