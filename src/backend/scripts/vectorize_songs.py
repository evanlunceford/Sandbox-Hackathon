"""
Vectorize songs from the Million Song Subset HDF5 files into Qdrant.

Usage examples:
    # First batch of 100 songs (good for a sanity check)
    python scripts/vectorize_songs.py --batch-size 100 --limit 100

    # Next 500, starting after the first 100
    python scripts/vectorize_songs.py --batch-size 100 --start 100 --limit 500

    # All 10,000 songs in batches of 200
    python scripts/vectorize_songs.py --batch-size 200
"""

import argparse
import os
import sys
from pathlib import Path

# Allow imports from the backend root
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv

load_dotenv()

from repositories.h5_repo import H5Repo
from repositories.vector_repo import VectorRepo
from services.embedding_service import EmbeddingService

def vectorize(batch_size: int = 100, start: int = 0, limit: int | None = None) -> None:
    songs_dir = os.getenv("SONGS_DIR", "./data/MillionSongSubset")
    all_paths = H5Repo.get_all_paths(songs_dir)

    subset = all_paths[start : (start + limit) if limit is not None else None]
    total = len(subset)

    print(f"Songs directory : {songs_dir}")
    print(f"Total files     : {len(all_paths)}")
    print(f"Processing      : {total} files (start={start}, limit={limit})")
    print(f"Batch size      : {batch_size}")
    print()

    VectorRepo.ensure_collection()

    processed = 0
    skipped = 0

    for batch_num, batch_start in enumerate(range(0, total, batch_size)):
        batch_paths = subset[batch_start : batch_start + batch_size]
        batch_label = f"Batch {batch_num + 1}"
        print(f"{batch_label}: reading files {batch_start + 1}–{min(batch_start + batch_size, total)} of {total}...")

        songs = []
        for path in batch_paths:
            song = H5Repo.read_song(path)
            if song:
                songs.append(song)
            else:
                skipped += 1

        if not songs:
            print(f"  No valid songs found — skipping batch.\n")
            continue

        print(f"  Embedding {len(songs)} songs...")
        texts = [EmbeddingService.build_song_text(song) for song in songs]
        vectors = EmbeddingService.embed_batch(texts)

        print(f"  Upserting to Qdrant...")
        VectorRepo.upsert_songs(songs, vectors)

        processed += len(songs)
        print(f"  Done. Running total: {processed} upserted, {skipped} skipped.\n")

    print(f"Vectorization complete.")
    print(f"  Upserted : {processed}")
    print(f"  Skipped  : {skipped}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Vectorize Million Song Subset into Qdrant")
    parser.add_argument(
        "--batch-size",
        type=int,
        default=100,
        help="Number of songs per embedding + upsert batch (default: 100)",
    )
    parser.add_argument(
        "--start",
        type=int,
        default=0,
        help="File index to start from, useful for resuming (default: 0)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Max number of files to process; omit to process all remaining",
    )
    args = parser.parse_args()
    vectorize(batch_size=args.batch_size, start=args.start, limit=args.limit)
