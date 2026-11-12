# 🌌 Nexus.AI — Seated Spatial Thought Processor for WebXR

**Built for the Meta VR Start Developer Competition 2026**

Nexus.AI is a hands-first, seated WebXR spatial productivity workspace that transforms high-level system ideas and architectural prompts into interactive 3D glassmorphic concept topologies directly inside Meta Quest passthrough and VR environments.

---

## 🎯 The Problem & Spatial Design Philosophy
Complex system architectures and multi-layered workflows are inherently spatial, yet developers remain constrained to flat 2D monitors. Meanwhile, many early XR productivity tools cause arm fatigue by forcing users to stand or reach across wide room-scale spaces.

Nexus.AI solves both problems by adhering strictly to the **"Airplane Seat Test"**:
- **Zero-Strain Seated Ergonomics:** All interactive spatial nodes are dynamically clamped within a comfortable forward semi-circular reach envelope ($X \in [-0.75, 0.75]$, $Y \in [0.88, 1.52]$, $Z \in [-0.98, -0.72]$) at natural chest and eye level.
- **Hands-First Micro-Interactions:** Built on `@react-three/xr` v6+, supporting natural hand-pinch raycasting alongside controller fallback.

---

## ✨ Key Features
- **🧠 Generative Spatial Synthesis:** Deconstructs natural language system prompts into 3D glassmorphic node graphs connected by neural synapse threads using Google Gemini AI (with resilient client-side procedural fallback).
- **🔍 3D Deep-Dive Sub-Node Expansion:** Pinch or click any primary node to inspect its frosted-glass detail card, and toggle `[ + DEEP-DIVE SUB-NODES ]` to spawn 3 satellite micro-modules around it in real time.
- **🎤 Hands-Free Voice Dictation:** Integrated Web Speech API allows headset users to speak a prompt and automatically synthesize 3D nodes without typing.
- **📋 One-Click Production Export:** Export your spatial architecture directly to a **Mermaid.js** flowchart (clipboard) or download a structured **JSON** specification for immediate engineering documentation.

---

## 🛠️ Tech Stack
- **Frontend & 3D Engine:** React, Vite, Three.js, React Three Fiber (`@react-three/fiber`), `@react-three/drei`
- **WebXR Runtime:** `@react-three/xr` (v6+ `createXRStore` with concurrent Hand & Controller tracking)
- **Spatial Intelligence:** Google Gemini REST API (`gemini-flash-latest`) + Dynamic Procedural Architecture Engine

---

## 🚀 Local Setup & Running

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Golu543/nexus-ai-xr.git](https://github.com/Golu543/nexus-ai-xr.git)
   cd nexus-ai-xr