from fastapi import APIRouter

from .endpoints import course

router = APIRouter()
router.include_router(course.router)
