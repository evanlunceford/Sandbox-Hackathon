from repositories.vector_repo import VectorRepo
from services.embedding_service import EmbeddingService


class RecommendationService:
    @staticmethod
    def recommend_from_text(text: str, top_k: int = 5) -> list[dict]:
        """Embed text and return the top_k most similar songs from Qdrant."""
        vector = EmbeddingService.embed_query(text)
        results = VectorRepo.search(vector, top_k=top_k)
        return [
            {**result.payload, "score": round(result.score, 4)}
            for result in results
        ]
