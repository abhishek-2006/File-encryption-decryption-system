# CryptVault

CryptVault is a secure, high-performance file encryption and decryption web application featuring an immersive cyberpunk-themed UI. Built with a React frontend and a FastAPI backend, it uses military-grade AES encryption to ensure your files stay completely secure.

## Features

- **AES-CBC Encryption:** Industry-standard encryption using the Python `cryptography` library.
- **PBKDF2 Key Derivation:** Securely derives AES keys from your provided password with 100,000 iterations to prevent brute-force attacks.
- **Cyberpunk "Neural" UI:** An immersive, terminal-style interface complete with dynamic animations, glowing elements, and real-time telemetry logs.
- **Vercel Optimized:** Ready for full-stack deployment on Vercel with a pre-configured `vercel.json` for routing serverless functions and static assets.
- **Format Agnostic:** Safely encrypt and decrypt any file format or size.

## Tech Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS v4
- Vercel Web Analytics

**Backend:**
- Python 3
- FastAPI
- Cryptography (Hazmat primitives)

## Running Locally

### 1. Clone the repository
```bash
git clone https://github.com/abhishek-2006/File-Encryption-Decryption-System.git
cd File-Encryption-Decryption-System
```

### 2. Start the Backend
Navigate to the backend directory, install the dependencies, and run the FastAPI server:
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
The backend will run on `http://localhost:8000`.

### 3. Start the Frontend
In a new terminal window, navigate to the frontend directory, install the dependencies, and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
The frontend will typically run on `http://localhost:5173`.

## How It Works

1. **Ingestion:** Upload the file you wish to secure (or decrypt). The system automatically detects `.enc` extensions to switch modes.
2. **Identity:** Enter your secret password (private key).
3. **Release:** The system streams the file to the backend, encrypts/decrypts the bitstream in memory, and instantly returns the processed file to your local machine.

## Security Warning

This tool encrypts files entirely based on the password you provide. **If you lose or forget your password, there is absolutely no way to recover your encrypted files.** Always keep your passwords stored safely in a password manager.

---
*Made with ❤️ by [Abhishek Shah](https://abhishekshah-portfolio.vercel.app/)*
