from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import pagamentos
import uvicorn

app = FastAPI(
    title="AERP",
    description="API para análise de emendas parlamentares e pagamentos",
    version="1.0.0"
)

# Configuração de CORS para permitir acesso do seu Dashboard (Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, substitua pelo domínio do seu front
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluindo as rotas
app.include_router(pagamentos.router)

@app.get("/")
def health_check():
    return {"status": "online", "database": "conectado"}

if __name__ == "__main__":
    # Roda o servidor na porta 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)