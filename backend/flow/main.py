from fastapi import FastAPI

from flow.db import init_session
from flow.api import v1

init_session()

api = FastAPI()
api.include_router(v1.router, prefix="/api/v1")
