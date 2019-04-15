import typing as t

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from flow.db import db_session
from flow.model import Course

router = APIRouter()

class CourseResponse(BaseModel):
    code: str
    name: str
    description: str

@router.get("/courses", tags=["courses"], response_model=t.List[CourseResponse])
def list_courses(limit: int = 100):
    """List all known courses"""
    return db_session.query(Course).limit(limit).all()

@router.get("/courses/{code}", tags=["courses"], response_model=CourseResponse)
def course_by_code(code: str):
    """Get course by course code"""
    res = db_session.query(Course).filter(Course.code == code).one_or_none()
    if res is None:
        raise HTTPException(status_code=404)
    return res
