from fastapi import FastAPI

from app.api import v1

api = FastAPI()
api.include_router(v1.router, prefix="/api/v1")
