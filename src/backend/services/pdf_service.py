import io

import pypdf
from fastapi import HTTPException, UploadFile

MAX_CHARS = 8_000
MAX_FILE_SIZE = 10 * 1024 * 1024


class PdfService:
    @staticmethod
    async def extract_text(file: UploadFile) -> str:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="PDF must be under 10 MB")
        reader = pypdf.PdfReader(io.BytesIO(content))
        pages = [page.extract_text() or "" for page in reader.pages]
        text = "\n".join(pages).strip()
        return text[:MAX_CHARS]
