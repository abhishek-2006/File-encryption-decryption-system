import hashlib


def generate_sha256(data: bytes):
    return hashlib.sha256(data).digest()

def verify_sha256(data: bytes, stored_hash: bytes):
    return hashlib.sha256(data).digest() == stored_hash