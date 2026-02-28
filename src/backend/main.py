from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.recommendation_router import router as recommendation_router

app = FastAPI(title="Song Recommender API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommendation_router)


@app.get("/")
def read_root():
    return {"message": "Song Recommender API is running"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
