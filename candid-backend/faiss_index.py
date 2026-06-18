# faiss_index.py
# ----------------------------------------------
# Updated for cosine similarity (IndexFlatIP).
# ----------------------------------------------
import faiss
import numpy as np
import pickle
import os

# =========================
# GLOBAL STORAGE (PER EVENT)
# =========================
event_indexes = {}        # {event_id: faiss_index}
event_image_maps = {}     # {event_id: [image_metadata]}

DIMENSION = 512
BASE_DIR = "faiss_data"
os.makedirs(BASE_DIR, exist_ok=True)

# =========================
# UTIL
# =========================

def normalize(embedding: np.ndarray) -> np.ndarray:
    """Return l2‑normalized embedding in place."""
    norm = np.linalg.norm(embedding)
    return embedding if norm == 0 else embedding / norm

# =========================
# Index init (IP for cosine)
# =========================

def init_event(event_id: str):
    """Ensure event index exists in memory (lazy load)."""
    if event_id in event_indexes:
        return

    # try load from disk
    if load_event(event_id):
        return

    # create fresh
    event_indexes[event_id] = faiss.IndexFlatIP(DIMENSION)
    event_image_maps[event_id] = []

# =========================
# Adding embeddings
# =========================

def add_embeddings(event_id: str, embeddings: np.ndarray, metadata: dict):
    """Add (1‑D) embeddings to the event index."""
    init_event(event_id)
    index = event_indexes[event_id]
    image_map = event_image_maps[event_id]

    # normalize each embedding once
    for emb in embeddings:
        emb_norm = normalize(emb).astype("float32").reshape(1, -1)
        index.add(emb_norm)
        image_map.append(metadata)   # retain full metadata

    save_event(event_id)

# =========================
# Search (returns cosine similarity and indices)
# =========================

def search_embeddings(event_id: str, query_embedding: np.ndarray, k: int = 5):
    """Return top‑k similarity scores and indices for `query_embedding`.
    Similarity is :dot_product(embedding, index_embedding) (since we use IP).
    """
    if event_id not in event_indexes:
        raise ValueError(f"Event '{event_id}' not found")

    index = event_indexes[event_id]
    q = normalize(query_embedding).astype("float32").reshape(1, -1)
    sims, inds = index.search(q, k)  # sims shape (1,k)
    return sims[0], inds[0]          # return 1‑D arrays

# =========================
# Image map helpers
# =========================

def get_matched_images(event_id, sims, inds, threshold=0.5):
    """Convert similarity array to a list of matching image URLs.
    One match per distinct URL; public photos are included if similarity ≥ threshold.
    """
    image_map = event_image_maps[event_id]
    matched = set()
    for sim, idx in zip(sims, inds):
        if idx < 0 or idx >= len(image_map):
            continue
        entry = image_map[idx]
        url = entry.get("image_url")
        if not url:
            continue
        # Only add if similarity exceeds threshold (or it's public)
        if sim >= threshold or entry.get("visibility") == "public":
            matched.add(url)
    return list(matched)

# =========================
# Persistence (unchanged)
# =========================

def save_event(event_id: str):
    if event_id not in event_indexes:
        return
    path = os.path.join(BASE_DIR, event_id)
    os.makedirs(path, exist_ok=True)
    faiss.write_index(event_indexes[event_id], os.path.join(path, "index.faiss"))
    with open(os.path.join(path, "image_map.pkl"), "wb") as f:
        pickle.dump(event_image_maps[event_id], f)


def load_event(event_id: str):
    path = os.path.join(BASE_DIR, event_id)
    idx_path = os.path.join(path, "index.faiss")
    map_path = os.path.join(path, "image_map.pkl")
    if not os.path.exists(idx_path) or not os.path.exists(map_path):
        return False
    event_indexes[event_id] = faiss.read_index(idx_path)
    with open(map_path, "rb") as f:
        event_image_maps[event_id] = pickle.load(f)
    return True


def set_image_public(event_id: str, image_id: str) -> bool:
    """Set an image's visibility to public."""
    if event_id not in event_image_maps:
        return False

    for entry in event_image_maps[event_id]:
        if entry.get("id") == image_id:
            entry["visibility"] = "public"
            return True

    return False
