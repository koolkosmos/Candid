# face_pipeline.py
# ----------------------------------------------
# Backwards‑compatible wrapper around the new InsightFace encoder.
# ----------------------------------------------
# Import the get_embeddings function from the new encoder.
# The rest of the code can continue importing this module as before.
from .face_encoder import get_embeddings, get_single_embedding, average_embeddings