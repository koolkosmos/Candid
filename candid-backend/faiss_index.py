import faiss
import numpy as np
import pickle
import os
# =========================
# GLOBAL STORAGE (PER EVENT)
# =========================
event_indexes = {}        # {event_id: faiss_index}
event_image_maps = {}     # {event_id: [image_names]}

DIMENSION = 512
BASE_DIR = "faiss_data"
os.makedirs(BASE_DIR, exist_ok=True)

# =========================
# UTIL
# =========================
def normalize(embedding):
    norm = np.linalg.norm(embedding)
    if norm == 0:
        return embedding
    return embedding / norm


# =========================
# INIT EVENT (SAFE)
# =========================
def init_event(event_id):
    print(f"Initializing event: {event_id}")

    # If already in memory → do nothing
    if event_id in event_indexes:
        return

    # Try loading from disk
    loaded = load_event(event_id)

    if loaded:
        print(f"[INIT] Loaded existing event {event_id}")
        return

    # If not found → create new
    print(f"[INIT] Creating new event {event_id}")

    event_indexes[event_id] = faiss.IndexFlatL2(DIMENSION)
    event_image_maps[event_id] = []


# =========================
# ADD EMBEDDINGS
# =========================
def add_embeddings(event_id, embeddings, metadata):
    init_event(event_id)

    index = event_indexes[event_id]
    image_map = event_image_maps[event_id]

    for emb in embeddings:
        emb = normalize(emb)
        emb = emb.reshape(1, -1).astype('float32')


        index.add(emb)
        image_map.append(metadata)   # ✅ store FULL metadata dict

    save_event(event_id)


# =========================
# SEARCH
# =========================
def search_embeddings(event_id, query_embedding, k=5):
    """
    Returns distances and indices
    """
    if event_id not in event_indexes:
        raise ValueError(f"Event '{event_id}' not found")

    index = event_indexes[event_id]

    query_embedding = normalize(query_embedding)
    query_embedding = query_embedding.reshape(1, -1).astype('float32')

    D, I = index.search(query_embedding, k)
    return D, I


# =========================
# MAP RESULTS → IMAGES
# =========================
def get_matched_images(event_id, D, I, threshold=0.8):
    image_map = event_image_maps[event_id]
    matched_images = set()


    for dist, idx in zip(D[0], I[0]):
        if idx >= len(image_map):
            continue

        entry = image_map[idx]

        # PRIVATE → only if match
        if dist < threshold:
            matched_images.add(entry["image_url"])

        # PUBLIC → always include
        elif entry["visibility"] == "public":
            matched_images.add(entry["image_url"])   # ✅


    return list(matched_images)


# =========================
# OPTIONAL: GET IMAGE BY INDEX
# =========================
def get_image_from_index(event_id, idx):
    return event_image_maps[event_id][idx]["image_url"]


def save_event(event_id):
    if event_id not in event_indexes:
        return

    event_path = os.path.join(BASE_DIR, event_id)
    os.makedirs(event_path, exist_ok=True)

    # Save FAISS index
    index_path = os.path.join(event_path, "index.faiss")
    faiss.write_index(event_indexes[event_id], index_path)

    # Save image map
    map_path = os.path.join(event_path, "image_map.pkl")
    with open(map_path, "wb") as f:
        pickle.dump(event_image_maps[event_id], f)

    print(f"[SAVED] Event {event_id}")


def load_event(event_id):
    event_path = os.path.join(BASE_DIR, event_id)

    index_path = os.path.join(event_path, "index.faiss")
    map_path = os.path.join(event_path, "image_map.pkl")

    if not os.path.exists(index_path) or not os.path.exists(map_path):
        return False

    # Load index
    event_indexes[event_id] = faiss.read_index(index_path)

    # Load image map
    with open(map_path, "rb") as f:
        event_image_maps[event_id] = pickle.load(f)

    print(f"[LOADED] Event {event_id}")
    return True

def set_image_public(event_id, image_id):
    if event_id not in event_image_maps:
        print("❌ Event not found in memory")
        return False

    print("🔍 ALL ENTRIES:")
    for entry in event_image_maps[event_id]:
        print(entry)

    print("🎯 LOOKING FOR ID:", image_id)

    for entry in event_image_maps[event_id]:
        if entry.get("id") == image_id:
            print("✅ FOUND MATCH")
            entry["visibility"] = "public"
            return True

    print("❌ NO MATCH FOUND")
    return False
