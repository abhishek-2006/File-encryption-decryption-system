from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from app.crypto import encrypt_data, decrypt_data

router = APIRouter()

@router.post("/encrypt")
async def encrypt_file(
    file: UploadFile = File(...),
    password: str = Form(...)
):
    content = await file.read()
    encrypted = encrypt_data(content, password)

    return Response(
        content=encrypted,
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f"attachment; filename=encrypted_{file.filename}.enc"
        }
    )

    @router.post("/decrypt")
    async def decrypt_file(
        file: UploadFile = File(...),
        password: str = Form(...)
    ):
        try:
            content = await file.read()
            decrypted = decrypt_data(content, password)

            return Response(
                content=decrypted,
                media_type="application/octet-stream",
                headers={
                    "Content-Disposition": f"attachment; filename=decrypted_{file.filename.rsplit('.', 1)[0]}"
                }
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail="Incorrect password or corrupted file")