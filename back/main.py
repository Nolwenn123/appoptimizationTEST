import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

app = FastAPI()

# 👉 CORS : autoriser ton front React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # URL de ton front Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ⚙️ Config Supabase (variables d'environnement à définir)
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def get_mean_users_for_project_apps():
    # à adapter si tu filtres sur "gestion de projet" via type_fonctionnel
    res = supabase.table("usage_application").select("nombre_utilisateurs").execute()
    values = [row["nombre_utilisateurs"] for row in res.data if row["nombre_utilisateurs"]]
    if not values:
        return 0
    return sum(values) / len(values)


def compute_usage_score_for_app(app_name: str):
    # 1) récupère les usages de CETTE app (on prend la dernière mesure par ex.)
    res_app = (
        supabase.table("application")
        .select("id, nom")
        .eq("nom", app_name)
        .single()
        .execute()
    )
    app_id = res_app.data["id"]

    res_usage = (
        supabase.table("usage_application")
        .select("nombre_utilisateurs, date_mesure")
        .eq("application_id", app_id)
        .order("date_mesure", desc=True)
        .limit(1)
        .execute()
    )

    if not res_usage.data:
        return {"usage_score": -2, "level": "low"}  # aucune donnée = quasi nul

    app_users = res_usage.data[0]["nombre_utilisateurs"] or 0
    mean_users = get_mean_users_for_project_apps() or 1  # éviter /0

    ratio = app_users / mean_users

    # 👉 barème très simple pour commencer
    if app_users == 0 or ratio < 0.1:
        score = -2
        level = "low"
    elif ratio < 0.5:
        score = -1
        level = "low"
    elif ratio < 1:
        score = 0
        level = "medium"
    elif ratio < 1.5:
        score = 1
        level = "good"
    else:
        score = 2
        level = "good"

    return {
        "usage_score": score,
        "level": level,
        "app_users": app_users,
        "mean_users": mean_users,
        "ratio": ratio,
    }

@app.get("/")
async def root():
    return {"message": "Bienvenue sur mon API FastAPI 😊"}

@app.get("/hello")
async def hello():
    return {"message": "Hello from FastAPI backend!"}

@app.get("/applications")
async def list_applications():
    response = supabase.table("application").select("id, nom").execute()
    return response.data

@app.get("/applications/{app_name}/usage-score")
async def usage_score(app_name: str):
    try:
        result = compute_usage_score_for_app(app_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))