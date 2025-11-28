import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi import HTTPException
from typing import Any, Dict, List, Optional, Tuple

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


def get_application_details(app_name: str) -> Dict[str, Any]:
    """Collect all details needed for the data card of a given application."""
    # 1) fetch main application row
    res_app = (
        supabase.table("application")
        .select("id, nom, saas, statut_id, source_id")
        .eq("nom", app_name)
        .single()
        .execute()
    )
    app = res_app.data
    app_id = app["id"]

    # 2) statut
    statut_name: Optional[str] = None
    if app.get("statut_id"):
        res_statut = (
            supabase.table("statut")
            .select("nom")
            .eq("id", app["statut_id"])
            .single()
            .execute()
        )
        statut_name = res_statut.data["nom"] if res_statut.data else None

    # 3) source
    source_name: Optional[str] = None
    if app.get("source_id"):
        res_source = (
            supabase.table("source")
            .select("nom")
            .eq("id", app["source_id"])
            .single()
            .execute()
        )
        source_name = res_source.data["nom"] if res_source.data else None

    # 4) type fonctionnel (catégorie) - on prend le premier si plusieurs
    category_name: Optional[str] = None
    res_type_fct = (
        supabase.table("application_type_fonctionnel")
        .select("type_fonctionnel_id")
        .eq("application_id", app_id)
        .limit(1)
        .execute()
    )
    if res_type_fct.data:
        tf_id = res_type_fct.data[0]["type_fonctionnel_id"]
        res_tf = (
            supabase.table("type_fonctionnel")
            .select("nom")
            .eq("id", tf_id)
            .single()
            .execute()
        )
        category_name = res_tf.data["nom"] if res_tf.data else None

    # 5) techno(s) - liste éventuellement multiple
    techno_names: List[str] = []
    res_app_tech = (
        supabase.table("application_techno")
        .select("techno_id")
        .eq("application_id", app_id)
        .execute()
    )
    techno_ids = [row["techno_id"] for row in res_app_tech.data or []]
    if techno_ids:
        res_techno = (
            supabase.table("techno")
            .select("nom")
            .in_("id", techno_ids)
            .execute()
        )
        techno_names = [row["nom"] for row in res_techno.data or []]

    # 6) usage - dernière mesure
    usage_value: Optional[int] = None
    active_90: Optional[int] = None
    res_usage = (
        supabase.table("usage_application")
        .select("nombre_utilisateurs, utilisateurs_actifs_90j, date_mesure")
        .eq("application_id", app_id)
        .order("date_mesure", desc=True)
        .limit(1)
        .execute()
    )
    if res_usage.data:
        usage_value = res_usage.data[0]["nombre_utilisateurs"]
        active_90 = res_usage.data[0].get("utilisateurs_actifs_90j")

    # 7) groupe via contrat (premier contrat trouvé)
    group_name: Optional[str] = None
    contract_end: Optional[str] = None
    unit_price: Optional[float] = None
    res_contract = (
        supabase.table("contrat")
        .select("groupe_id, date_fin_contrat, prix_licence_unitaire")
        .eq("application_id", app_id)
        .order("date_fin_contrat", desc=True)
        .limit(1)
        .execute()
    )
    if res_contract.data:
        group_id = res_contract.data[0]["groupe_id"]
        contract_end = res_contract.data[0]["date_fin_contrat"]
        unit_price = res_contract.data[0].get("prix_licence_unitaire")
        if group_id:
            res_group = (
                supabase.table("groupe")
                .select("nom")
                .eq("id", group_id)
                .single()
                .execute()
            )
            group_name = res_group.data["nom"] if res_group.data else None

    # 8) contact (premier contact associé)
    contact_name: Optional[str] = None
    res_contact_link = (
        supabase.table("application_contact")
        .select("contact_id, ordre")
        .eq("application_id", app_id)
        .order("ordre", desc=False)
        .limit(1)
        .execute()
    )
    if res_contact_link.data:
        contact_id = res_contact_link.data[0]["contact_id"]
        res_contact = (
            supabase.table("contact")
            .select("nom")
            .eq("id", contact_id)
            .single()
            .execute()
        )
        contact_name = res_contact.data["nom"] if res_contact.data else None

    details = {
        "nom": app["nom"],
        "categorie": category_name,
        "technologies": techno_names,
        "nombre_utilisateurs": usage_value,
        "utilisateurs_actifs_90j": active_90,
        "groupe": group_name,
        "contact": contact_name,
        "statut": statut_name,
        "saas": app.get("saas"),
        "source": source_name,
        "date_fin_contrat": contract_end,
        "prix_licence_unitaire": unit_price,
    }

    # 9) fiabilité des données : basé sur la complétude des champs clés
    def is_missing(value: Any) -> bool:
        if value is None:
            return True
        if isinstance(value, str) and not value.strip():
            return True
        if isinstance(value, list) and len(value) == 0:
            return True
        return False

    fields_to_check = [
        details["categorie"],
        details["technologies"],
        details["nombre_utilisateurs"],
        details["utilisateurs_actifs_90j"],
        details["groupe"],
        details["contact"],
        details["statut"],
        details["saas"],
        details["source"],
        details["date_fin_contrat"],
        details["prix_licence_unitaire"],
    ]

    missing_count = sum(1 for value in fields_to_check if is_missing(value))
    completeness_ratio = max(0.0, 1 - missing_count / len(fields_to_check))
    details["reliability"] = round(completeness_ratio * 100, 1)

    return details


def get_app_costs() -> List[Dict[str, Any]]:
    """Return list of applications with their latest unit price if available."""
    # Fetch all applications (id, name)
    res_apps = supabase.table("application").select("id, nom").execute()
    apps = res_apps.data or []
    app_index = {row["id"]: row["nom"] for row in apps}

    # Fetch contracts ordered by date to keep latest per app
    res_contracts = (
        supabase.table("contrat")
        .select("application_id, prix_licence_unitaire, date_fin_contrat")
        .order("date_fin_contrat", desc=True)
        .execute()
    )
    latest_by_app: Dict[int, Tuple[Optional[str], Optional[float]]] = {}
    for row in res_contracts.data or []:
        app_id = row["application_id"]
        if app_id not in latest_by_app:
            latest_by_app[app_id] = (row.get("date_fin_contrat"), row.get("prix_licence_unitaire"))

    costs: List[Dict[str, Any]] = []
    for app_id, app_name in app_index.items():
        price = latest_by_app.get(app_id, (None, None))[1]
        costs.append({"nom": app_name, "prix_licence_unitaire": price})

    return costs

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


@app.get("/applications/{app_name}/details")
async def application_details(app_name: str):
    try:
        return get_application_details(app_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/applications/costs")
async def applications_costs():
    try:
        return get_app_costs()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
