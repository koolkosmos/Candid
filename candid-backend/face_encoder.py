# face_encoder.py
# ----------------------------------------------
# Encapsulates InsightFace based face detection
# + ArcFace embedding extraction.
# ----------------------------------------------
import os
import numpy as np
from insightface.app import FaceAnalysis
from PIL import Image
from typing import List

# -------------- Setup --------------------
# Using antelopev2 for better accuracy (ResNet100 backbone)
# Load at import so we stay fast for repeated calls
FACE_MODEL = os.getenv("FACE_MODEL", "antelopev2").lower()

face_app = FaceAnalysis(
    name=FACE_MODEL,
    providers=['CUDAExecutionProvider', 'CPUExecutionProvider']
)
face_app.prepare(ctx_id=0)  # 0 = GPU, -1 = CPU

# -------------- API --------------------

def get_embeddings(image_path: str) -> np.ndarray:
    """Detect all faces in `image_path` and return a (N, 512) numpy array
    of L2‑normalized ArcFace embeddings.

    Parameters
    ----------
    image_path : str
        Path to the input image. Any format supported by Pillow.

    Returns
    -------
    np.ndarray
        2‑D array of embeddings, shape (N, 512). Empty array if no faces were found.
    """
    img = Image.open(image_path).convert("RGB")
    faces = face_app.get(img)
    if not faces:
        return np.empty((0, 512), dtype=np.float32)

    # `normed_embedding` is already l2‑normalized (ArcFace)
    embeddings = np.stack([face.normed_embedding for face in faces], axis=0)
    return embeddings


def get_single_embedding(image_path: str) -> np.ndarray:
    """Extract the most prominent face embedding from an image.

    Returns a single (512,) embedding or None if no face found.
    """
    embeddings = get_embeddings(image_path)
    if len(embeddings) == 0:
        return None
    # Return the first (most prominent) face
    return embeddings[0]


def average_embeddings(embeddings_list: List[np.ndarray]) -> np.ndarray:
    """Average multiple embeddings into a single template.

    This improves recognition robustness by reducing noise from
    individual photo variations (angle, lighting, expression).

    Parameters
    ----------
    embeddings_list : List[np.ndarray]
        List of (512,) embeddings to average

    Returns
    -------
    np.ndarray
        Averaged (512,) embedding, L2 normalized
    """
    if not embeddings_list:
        return None

    # Stack and compute mean
    stacked = np.stack(embeddings_list, axis=0)
    avg = np.mean(stacked, axis=0)

    # Re-normalize
    norm = np.linalg.norm(avg)
    if norm > 0:
        avg = avg / norm

    return avg.astype(np.float32)