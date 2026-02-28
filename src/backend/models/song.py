from pydantic import BaseModel
from typing import Optional


class Song(BaseModel):
    song_id: str
    title: str
    artist: str
    release: Optional[str] = None
    genre: Optional[str] = None
    artist_terms: list[str] = []
    year: Optional[int] = None
