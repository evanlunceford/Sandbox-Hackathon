import io

import pypdf
from fastapi import UploadFile

MAX_CHARS = 8_000


class PdfService:
    @staticmethod
    async def extract_text(file: UploadFile) -> str:
        """Read an uploaded PDF and return its full text, capped at MAX_CHARS."""
        content = await file.read()
        reader = pypdf.PdfReader(io.BytesIO(content))
        pages = [page.extract_text() or "" for page in reader.pages]
        text = "\n".join(pages).strip()
        return text[:MAX_CHARS]
