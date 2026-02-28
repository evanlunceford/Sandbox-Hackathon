import os
import uuid

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, ScoredPoint, VectorParams

load_dotenv()

COLLECTION_NAME = "songs"
VECTOR_SIZE = 3072


def _client() -> QdrantClient:
    return QdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY"),
    )


class VectorRepo:
    @staticmethod
    def ensure_collection() -> None:
        """Create the Qdrant collection if it does not already exist."""
        client = _client()
        existing = [c.name for c in client.get_collections().collections]
        if COLLECTION_NAME not in existing:
            client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
            )
            print(f"Created Qdrant collection '{COLLECTION_NAME}'")
        else:
            print(f"Collection '{COLLECTION_NAME}' already exists")

    @staticmethod
    def upsert_songs(songs: list[dict], vectors: list[list[float]]) -> None:
        """Upsert song vectors and metadata into Qdrant."""
        client = _client()
        points = [
            PointStruct(
                id=str(uuid.uuid5(uuid.NAMESPACE_DNS, song["song_id"])),
                vector=vector,
                payload={
                    "song_id": song["song_id"],
                    "title": song["title"],
                    "artist": song["artist"],
                    "release": song["release"],
                    "genre": song["genre"],
                    "artist_terms": song["artist_terms"],
                    "year": song["year"],
                },
            )
            for song, vector in zip(songs, vectors)
        ]
        client.upsert(collection_name=COLLECTION_NAME, points=points)

    @staticmethod
    def search(vector: list[float], top_k: int = 5) -> list[ScoredPoint]:
        """Return the top_k most similar songs by cosine similarity."""
        client = _client()
        return client.search(
            collection_name=COLLECTION_NAME,
            query_vector=vector,
            limit=top_k,
        )
