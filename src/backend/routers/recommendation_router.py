from fastapi import APIRouter, File, HTTPException, Request, UploadFile

from limiter import limiter
from models.recommendation import RecommendationResponse
from services.pdf_service import PdfService
from services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommend", tags=["recommendations"])


@router.post("/", response_model=list[RecommendationResponse])
@limiter.limit("20/minute;100/hour")
async def recommend(request: Request, file: UploadFile = File(...)):
    """Upload a PDF and receive the top 5 most thematically similar songs."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    text = await PdfService.extract_text(file)
    if not text:
        raise HTTPException(status_code=422, detail="Could not extract text from the PDF")

    results = RecommendationService.recommend_from_text(text)
    return results
