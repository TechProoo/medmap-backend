# 🗺️ Med-Map: Real-time Medication Finder & AI Assistant

> “Saving time, saving lives ”

Med-Map is a web-based AI-powered application that helps users locate nearby pharmacies with specific medications in stock, while also providing smart health advice via an AI assistant. Designed with scalability in mind, it aims to bridge the gap between patients and accessible, reliable healthcare in Nigeria and beyond.

---

## 🔍 Problem Statement

Many patients face serious challenges locating prescribed medications. This lack of real-time drug availability leads to delays in treatment, avoidable complications, and in some cases, loss of lives.

---

## 🎯 Solution Overview

Med-Map solves this problem by combining:
- **A real-time medication search system** using location-based sorting.
- **An AI chatbot** trained on medication data to provide drug insights.
- **A clean map interface** showing directions to available pharmacies.

---

## 🧪 Key Features (MVP)

- 🔎 **Search for a specific drug** and get a list of nearby pharmacies that stock it.
- 🗺️ **Map integration** (Google Maps) showing distance and directions to each pharmacy.
- 🤖 **AI Chatbot** that explains side effects, usage, and warnings for common medications.
- 🧾 **Static yet realistic database** of pharmacy drug inventories for demo purposes.

---

## 🚀 Stretch Goals (Post-Hackathon)

- 📦 Build a **pharmacy management system** for real-time inventory syncing.
- 💬 Enable **real-time AI updates** on newly prescribed drugs.
- 📍 Live **GPS tracking** to improve proximity-based recommendations.
- ⭐ **Pharmacy rating & review** system to build user trust.

---

## 🧠 AI Strategy

### AI Layer
- **LangChain + OpenAI**: Used to power the AI chatbot.
- Static **JSON Dataset** of top medications will be used to simulate real queries.
- Goal is to embed medication data for Q&A responses during demo.
- Optionally explore DeepSeek or Hugging Face endpoints later.

---

## 🧱 System Architecture

### 🔧 Backend
- **Node.js + Express** (Fast and scalable API)
- **PostgreSQL** (Storing pharmacy & drug inventory data)
- **Drizzle ORM** (Type-safe SQL & schema migration)
- **Google Maps API** (Distance matrix & pharmacy lookup)

### 💬 AI
- **LangChain** + **OpenAI API** (or DeepSeek/HuggingFace as fallback)
- AI is embedded with drug info from the static JSON dataset.

### 🌐 Frontend
- **React 18** + **Vite** (for performance)
- **TailwindCSS** + **Shadcn UI** (modern component styling)
- **Framer Motion** (for smooth animations)
- **Axios** (for API communication)

---

## 🧑‍💻 Team Roles

| Name (Nickname)    | Role                    |
|--------------------|-------------------------|
| Techpro            | AI + Backend Dev        |
| Prospercoded (You) | Backend + DB Engineer   |
| Willy Wonka        | Frontend Dev            |
| Baluba King (John) | Pitch & Presentation    |

---

## 📦 Folder Structure

```bash
med-map/
├── backend/
│   ├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── utils/
├── ai/
│   ├── dataset/
│   └── langchain/
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── hooks/
├── public/
└── README.md
