import glob
import os
from typing import Optional

import h5py

class H5Repo:
    @staticmethod
    def read_song(file_path: str) -> Optional[dict]:
        """Extract song metadata from a single HDF5 file."""
        try:
            with h5py.File(file_path, "r") as f:
                meta = f["metadata/songs"][0]
                mb = f["musicbrainz/songs"][0]
                analysis = f["analysis/songs"][0]
                terms = [
                    t.decode("utf-8", errors="ignore")
                    for t in f["metadata/artist_terms"][:]
                ]

                title = meta["title"].decode("utf-8", errors="ignore").strip()
                artist = meta["artist_name"].decode("utf-8", errors="ignore").strip()

                if not title or not artist:
                    return None

                return {
                    "song_id": meta["song_id"].decode("utf-8", errors="ignore"),
                    "track_id": analysis["track_id"].decode("utf-8", errors="ignore"),
                    "title": title,
                    "artist": artist,
                    "release": meta["release"].decode("utf-8", errors="ignore").strip(),
                    "genre": meta["genre"].decode("utf-8", errors="ignore").strip(),
                    "artist_terms": terms[:10],
                    "year": int(mb["year"]),
                }
        except Exception as e:
            print(f"  Warning: failed to read {file_path}: {e}")
            return None

    @staticmethod
    def get_all_paths(songs_dir: str) -> list[str]:
        """Return sorted list of all .h5 file paths under songs_dir."""
        return sorted(glob.glob(os.path.join(songs_dir, "**", "*.h5"), recursive=True))
