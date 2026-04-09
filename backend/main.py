import os
import io
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding, hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend

app = FastAPI()

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def derive_key(password: str, salt: bytes):
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    return kdf.derive(password.encode())

@app.post("/encrypt")
async def encrypt_file(file: UploadFile = File(...), password: str = Form(...)):
    content = await file.read()
    salt = os.urandom(16)
    iv = os.urandom(16)
    key = derive_key(password, salt)

    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(content) + padder.finalize()

    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(padded_data) + encryptor.finalize()

    # Structure: salt + iv + ciphertext
    return StreamingResponse(io.BytesIO(salt + iv + ciphertext), media_type="application/octet-stream")

@app.post("/decrypt")
async def decrypt_file(file: UploadFile = File(...), password: str = Form(...)):
    try:
        data = await file.read()
        salt, iv, ciphertext = data[:16], data[16:32], data[32:]
        key = derive_key(password, salt)

        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
        decryptor = cipher.decryptor()
        padded_plaintext = decryptor.update(ciphertext) + decryptor.finalize()

        unpadder = padding.PKCS7(128).unpadder()
        plaintext = unpadder.update(padded_plaintext) + unpadder.finalize()

        return StreamingResponse(io.BytesIO(plaintext), media_type="application/octet-stream")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid key or corrupted file")