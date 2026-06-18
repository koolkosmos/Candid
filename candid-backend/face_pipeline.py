from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
import torch
import numpy as np

# Device (GPU if available)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Load models
mtcnn = MTCNN(keep_all=True, device=device)
model = InceptionResnetV1(pretrained='vggface2').eval().to(device)

print("Models loaded successfully")

def detect_faces(image_path):
    img = Image.open(image_path).convert('RGB')
    
    boxes, probs = mtcnn.detect([img])
    boxes = boxes[0] if boxes is not None else None
    
    print(f"Detected {0 if boxes is None else len(boxes)} faces")
    return img, boxes

from PIL import Image

def get_embeddings(image_path):
    img = Image.open(image_path).convert('RGB')

    face_tensors = mtcnn([img])

    if face_tensors is None:
        print("No faces found for embeddings")
        return []
    face_tensors = face_tensors[0]
    if len(face_tensors.shape) == 3:
        face_tensors = face_tensors.unsqueeze(0)

    face_tensors = face_tensors.to(device)

    embeddings = model(face_tensors).detach().cpu().numpy()

    print(f"Generated {len(embeddings)} embeddings")
    return embeddings

if __name__ == "__main__":
    image_path = r"C:\VS backup\VS code\pyth\grabpic\test.jpeg"  # put any group photo here
    
    img, boxes = detect_faces(image_path)
    embeddings = get_embeddings(image_path)
    
    for i, emb in enumerate(embeddings):
        print(f"Face {i+1} embedding shape:", emb.shape)
