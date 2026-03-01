# Mr. Cassette

A semantic music recommendation engine. Upload any PDF and it returns the five songs from the Million Song Dataset whose embedded meaning most closely matches your document.

---

## How It Works

1. **Upload** — the user drops a PDF onto the frontend.
2. **Extract** — the backend pulls raw text from the PDF (capped at 8,000 characters).
3. **Embed** — the text is embedded using the Google Gemini `gemini-embedding-001` model with a `RETRIEVAL_QUERY` task type.
4. **Search** — the resulting vector is compared against pre-indexed song vectors stored in Qdrant using cosine similarity.
5. **Return** — the top 5 matching songs are sent back and displayed.

Songs are indexed offline: each song's title, artist, album, genre, tags, and year are combined into a text description and embedded with a `RETRIEVAL_DOCUMENT` task type, then stored in Qdrant.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite |
| Backend | Python, FastAPI |
| Embeddings | Google Gemini API (`gemini-embedding-001`) |
| Vector DB | Qdrant |
| Song Data | Million Song Subset (HDF5 files) |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Python](https://www.python.org/) v3.10+
- A [Qdrant](https://qdrant.tech/) instance (cloud or self-hosted)
- A [Google AI Studio](https://aistudio.google.com/) API key with Gemini access
- The [Million Song Subset](http://millionsongdataset.com/pages/getting-dataset/#subset) HDF5 files

---

## Environment Variables

Create a `.env` file in `src/backend/` with the following:

```
GEMINI_API_KEY=your_google_ai_studio_key
QDRANT_URL=https://your-qdrant-instance-url
QDRANT_API_KEY=your_qdrant_api_key
SONGS_DIR=/path/to/MillionSongSubset
```

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | API key from [Google AI Studio](https://aistudio.google.com/) |
| `QDRANT_URL` | URL of your Qdrant instance |
| `QDRANT_API_KEY` | API key for your Qdrant instance |
| `SONGS_DIR` | Path to the root of your Million Song Subset directory |

---

## Installing Dependencies

**Frontend:**
```bash
cd src/frontend
npm install
```

**Backend:**
```bash
pip install fastapi uvicorn pypdf google-generativeai qdrant-client h5py python-dotenv
```

---

## Indexing Songs

Before the app can make recommendations, songs need to be embedded and stored in Qdrant. Run the vectorization script from `src/backend/`:

```bash
# Index the first 100 songs (sanity check)
python scripts/vectorize_songs.py --batch-size 100 --limit 100

# Index 500 more, starting after the first 100
python scripts/vectorize_songs.py --batch-size 100 --start 100 --limit 500

# Index all songs in batches of 200
python scripts/vectorize_songs.py --batch-size 200
```

The script reads each `.h5` file, builds a text description of the song, embeds it via Gemini, and upserts it into Qdrant. It can be stopped and resumed using `--start`.

---

## Running the App

Start both servers in separate terminals.

**Backend** (from `src/backend/`):
```bash
python main.py
```
Runs at `http://localhost:8000`.

**Frontend** (from `src/frontend/`):
```bash
npm run dev
```
Runs at `http://localhost:5173`.

---

## Project Structure

```
src/
├── backend/
│   ├── main.py                        # FastAPI app and CORS config
│   ├── routers/
│   │   └── recommendation_router.py   # POST /recommend/ endpoint
│   ├── services/
│   │   ├── pdf_service.py             # PDF text extraction
│   │   ├── embedding_service.py       # Gemini embedding calls
│   │   └── recommendation_service.py  # Orchestrates embed + search
│   ├── repositories/
│   │   ├── vector_repo.py             # Qdrant read/write
│   │   └── h5_repo.py                 # HDF5 song file reading
│   └── scripts/
│       └── vectorize_songs.py         # Offline indexing script
└── frontend/
    └── src/
        ├── App.jsx                    # Main component and app logic
        └── components/
            ├── CassettePlayer.jsx     # Retro cassette UI
            ├── TitleEffect.jsx        # Title reveal animation
            └── TypingEffect.jsx       # Typing animation
```
