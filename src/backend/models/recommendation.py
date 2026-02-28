from pydantic import BaseModel
from typing import Optional


class RecommendationResponse(BaseModel):
    song_id: str
    title: str
    artist: str
    release: Optional[str] = None
    genre: Optional[str] = None
    artist_terms: list[str] = []
    year: Optional[int] = None
    score: float
