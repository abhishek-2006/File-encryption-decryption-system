import os
import hashlib
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding, hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend

backend = default_backend()

# ---------- KEY DERIVATION (PBKDF2) ----------
def derive_key(password: str, salt: bytes):
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,  # AES-256
        salt=salt,
        iterations=100000,
        backend=backend
    )
    return kdf.derive(password.encode())


# ---------- ENCRYPT ----------
def encrypt_data(data: bytes, password: str):
    salt = os.urandom(16)
    key = derive_key(password, salt)
    iv = os.urandom(16)

    # padding
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(data) + padder.finalize()

    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=backend)
    encryptor = cipher.encryptor()

    ciphertext = encryptor.update(padded_data) + encryptor.finalize()

    # integrity hash
    sha256 = hashlib.sha256(ciphertext).digest()

    # final structure: salt + iv + hash + ciphertext
    return salt + iv + sha256 + ciphertext


# ---------- DECRYPT ----------
def decrypt_data(data: bytes, password: str):
    salt = data[:16]
    iv = data[16:32]
    stored_hash = data[32:64]
    ciphertext = data[64:]

    # verify integrity
    calculated_hash = hashlib.sha256(ciphertext).digest()
    if stored_hash != calculated_hash:
        raise ValueError("Integrity check failed")

    key = derive_key(password, salt)

    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=backend)
    decryptor = cipher.decryptor()

    padded_plaintext = decryptor.update(ciphertext) + decryptor.finalize()

    # unpad
    unpadder = padding.PKCS7(128).unpadder()
    plaintext = unpadder.update(padded_plaintext) + unpadder.finalize()

    return plaintext