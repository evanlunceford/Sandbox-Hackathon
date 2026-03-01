import os

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

MODEL = "gemini-embedding-001"

def _configure() -> None:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


class EmbeddingService:
    @staticmethod
    def build_song_text(song: dict) -> str:
        parts = [f"{song['title']} by {song['artist']}"]
        if song.get("release"):
            parts.append(f"Album: {song['release']}")
        if song.get("genre"):
            parts.append(f"Genre: {song['genre']}")
        if song.get("artist_terms"):
            parts.append(f"Tags: {', '.join(song['artist_terms'])}")
        if song.get("year") and song["year"] > 0:
            parts.append(f"Year: {song['year']}")
        return "\n".join(parts)

    @staticmethod
    def embed_batch(texts: list[str]) -> list[list[float]]:
        _configure()
        return [
            genai.embed_content(model=MODEL, content=text, task_type="RETRIEVAL_DOCUMENT")[
                "embedding"
            ]
            for text in texts
        ]

    @staticmethod
    def embed_query(text: str) -> list[float]:
        _configure()
        result = genai.embed_content(model=MODEL, content=text, task_type="RETRIEVAL_QUERY")
        return result["embedding"]
