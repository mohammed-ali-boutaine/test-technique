from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session
from . import models, database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup code
    models.Base.metadata.create_all(bind=database.engine)

    try:
        db = next(database.get_db())
        for client_data in default_data:
            client = db.query(models.Client).filter_by(name=client_data["client_name"]).first()
            if not client:
                client = models.Client(name=client_data["client_name"])
                db.add(client)
                db.commit()
                db.refresh(client)
                key = models.Key(key=client_data["key_value"], client_id=client.id)
                db.add(key)
                db.commit()
                for doc_data in client_data["docs"]:
                    doc = models.Doc(title=doc_data["title"], content=doc_data["content"], client_id=client.id)
                    db.add(doc)
        db.commit()
    except Exception as e:
        print(f"Error during database initialization: {e}")
        db.rollback()
    finally:
        db.close()
    yield



app = FastAPI(lifespan=lifespan)


# cors middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


default_data = [
    {
        "client_name": "Client A",
        "key_value": "tenantA_key",
        "docs": [
            {"title": "docA1_procedure_resiliation", "content": """
Procédure résiliation
La résiliation doit être enregistrée dans le CRM.
Un accusé de réception est envoyé sous 48h.
Le responsable conformité valide les dossiers sensibles.
        """},
            {"title": "docA2_produit_rc_pro_a",
            "content": """   Produit RC Pro A
La RC Pro couvre les dommages causés aux tiers dans le cadre de l'activité déclarée.
Exclusion : travaux en hauteur au-delà de 3 mètres.
Déclaration de sinistre : service sinistres@assureur-a.fr.
        """}
        ]
    },
    {
        "client_name": "Client B",
        "key_value": "tenantB_key",
        "docs": [
            {"title": "docB1_garantie_vol",
            "content": """
                Procédure sinistre
                Tout sinistre doit être déclaré dans les 5 jours ouvrés.
                L'équipe gestion transmet le dossier au gestionnaire assureur.
                Le suivi du sinistre est effectué de manière hebdomadaire.

         """
            },
            {"title": "docB2_produit_rc_pro_b",
            "content": """   
                Produit RC Pro B
                La RC Pro couvre l'activité déclarée.
                Exclusion : sous-traitance non déclarée.
                Déclaration de sinistre : claims@assureur-b.com.

         """}
        ]
    }
]


@app.get("/")
async def health_check():
    return {"status": "healthy", "message": "Server is running"}


@app.get("/client-docs")
async def get_doc(api_key: str = Security(api_key_header), db: Session = Depends(database.get_db)):

    if not api_key:
        raise HTTPException(status_code=403, detail="X-API-Key header missing")
   
    try:
        # get api key from header
        key = db.query(models.Key).filter(models.Key.key == api_key).first()
        
        
        if not key:
            raise HTTPException(status_code=403, detail="Invalid API Key")


        client = key.client
        if client is None:
            raise HTTPException(status_code=404, detail="Client not found")
        
        if client.docs is None or len(client.docs) == 0:
            raise HTTPException(status_code=404, detail="No documents found for this client")

        return client.docs

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
