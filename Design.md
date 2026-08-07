# 🕸️ SUDO System

A distributed system simulation platform that enables users to design infrastructure architectures, simulate request routing, visualize execution paths, and analyze failures through deterministic graph-based execution.

---
![Sudo System](/assest/image.png)

## ⚙️ Supported Infrastructure Components

The simulator models common distributed system components as graph nodes, each implementing behavior similar to its real-world counterpart.

---
![Infrastructure](/assest/image2.png)

---
## 🌐 REST API

The platform exposes a set of RESTful APIs for managing infrastructure components, defining relationships, executing routing simulations, and querying the current state of the distributed system.

---

![Rest Api](/assest/image3.png)

---
## 🏗️ High-Level Architecture

The SUDO System follows a lightweight service-oriented architecture where a backend service manages the infrastructure graph, executes routing simulations, and persists the topology inside a graph database.

---

![HLD](/assest/image4.png)

---
## 🚀 Request Routing Workflow

The routing engine processes every incoming request by computing the optimal execution path through the infrastructure graph while keeping the graph metadata synchronized asynchronously.

---
![Async Process](/assest/image7.png)