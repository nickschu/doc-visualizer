# [WIP] Doc Visualizer

**Doc Visualizer** is a full-stack application that takes a **10-K financial document** and produces **dynamic visualizations** for the **most important insights** in the document.  

## Table of Contents

1. [Overview](#overview)  
2. [Architecture & Workflow](#architecture--workflow)  
3. [Tech Stack](#tech-stack)  
4. [Project Structure](#project-structure)  
5. [Setup & Usage](#setup--usage)  
---

## Overview

**Doc Visualizer** is designed to help users quickly analyze large financial documents (like SEC 10-K filings). It does the following:

1. **Parses** the document into text chunks.  
2. **Embeds** the chunks using OpenAI’s embeddings API.  
3. **Stores** embeddings in Pinecone for quick retrieval.  
4. **Uses GPT** to identify **key insights** from the document.  
5. **Generates** chart or module specifications that can be rendered dynamically in the front-end.

The end goal is to turn dense text content into **meaningful data visualizations** so users can spot important trends, performance metrics, and risk factors more quickly.

---

## Architecture & Workflow

Below is a simplified flow diagram of how the system works:

1. **User Uploads PDF**  
   - The Next.js front-end (via `/upload`) sends a PDF to the FastAPI backend.  
   - The backend saves the PDF and spawns a **background task** to parse and embed.

2. **Background Task**  
   - **Parse** PDF pages into text chunks (`pdfplumber`).  
   - **Generate embeddings** (OpenAI’s Embeddings API).  
   - **Upsert** embeddings into Pinecone with metadata (doc ID, chunk text, etc.).  

3. **Generate Insights**  
   - A **summary** endpoint (e.g. `/analysis`) calls GPT to find **key insights** in the document.  
   - GPT returns structured data (`InsightsResponse`), including sections and individual insights.

4. **Visualization Specs**  
   - A **visualization** endpoint (e.g. `/generate-visuals`) takes those insights and prompts GPT again to decide **chart types** and data mappings.  
   - GPT produces a **Pydantic** chart spec (`ChartSpec`) for each insight.

5. **Front-End Rendering**  
   - The Next.js app fetches the final chart specs (from `/generate-visuals`) and renders them.
   - The user sees a dashboard with main insights and side insights visually represented.

---

## Tech Stack

**Backend**  
- **[FastAPI](https://fastapi.tiangolo.com/)**: For the REST API, background tasks, and overall application logic.  
- **[Python](https://www.python.org/)**: Core language for the backend.  
- **[OpenAI API](https://platform.openai.com/docs/guides/)**: For text embeddings using embeddings API and for summarizing documents, generating insights, and chart specs using GPT API.  
- **[Pinecone](https://www.pinecone.io/)**: Vector database to store embeddings for RAG.   
- **[Pydantic](https://docs.pydantic.dev/)**: For data validation and modeling (e.g., chart specs, insights).

**Frontend**  
- **[Next.js](https://nextjs.org/docs/app)**: Main React framework.  
- **[TypeScript](https://www.typescriptlang.org/)**

---

## Project Structure
[WIP]
A simplified view:

```
├── backend
│   └── app
│       ├── routers
│       ├── services
│       └── main.py
└── frontend
    ├── app
    │   ├── api
    │   │   ├── generate-visualization
    │   │   └── upload
    │   ├── upload
    │   └── visualize
    └── components
        ├── charts
        └── visualization
```
---

## Setup & Usage

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/doc-visualizer.git
   cd doc-visualizer
   ```

2. **Set Up Backend**
   1. Create a virtual environment:
      ```bash
      cd backend
      python -m venv venv
      source venv/bin/activate
      ```
   2. Install dependencies:
      ```bash
      pip install -r requirements.txt
      ```
   3. Configure environment variables (see `.env.example`)
   4. Start the FastAPI server:
      ```bash
      uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
      ```

3. **Set Up Frontend**
   1. Navigate to `frontend` directory:
      ```bash
      cd frontend
      ```
   2. Install dependencies:
      ```bash
      npm install
      ```
   3. Configure environment variables (see `.env.example`)
   4. Run dev server:
      ```bash
      npm run dev
      ```
   5. Visit [http://localhost:3000](http://localhost:3000).

4. **Upload a PDF**  
   - Go to `[frontend_base_url]/upload` (e.g., `http://localhost:3000/upload`).  
   - Select a PDF (10-K).  
   - The system will parse, embed, and store it in Pinecone in the background then generate the visualization at [frontend_base_url]/visualize/[filename]`.

---

**Thank you for checking out Doc Visualizer!**  
For questions, issues, or contributions, please open an issue or a pull request on GitHub. Happy visualizing!
