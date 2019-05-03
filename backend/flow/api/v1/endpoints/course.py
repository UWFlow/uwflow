import typing as t

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import contains_eager

from flow.db import db_session
from flow.model import Course, CourseReview

router = APIRouter()

class CourseResponse(BaseModel):
    id: int
    code: str
    name: str
    description: t.Union[str, None]

class CourseReviewResponse(BaseModel):
    id: int
    text: str
    easy: t.Union[bool, None]
    liked: t.Union[bool, None]
    useful: t.Union[bool, None]

@router.get("/courses", tags=["courses"], response_model=t.List[CourseResponse])
def list_courses(limit: int = 100, offset: int = 0):
    """List all known courses"""
    return db_session.query(Course).limit(limit).offset(offset).all()

@router.get("/courses/byids", tags=["courses"], response_model=t.List[CourseResponse])
def courses_by_ids(ids: str):
    """Get multiple courses by list of comma-separated ids"""
    try:
        ids = [int(i) for i in ids.split(",")]
    except:
        raise HTTPException(status_code=422, detail="ids must be a comma-separated list of integers")
    res = db_session.query(Course).filter(Course.id.in_(ids)).all()
    if len(res) != len(ids):
        found_ids = set(c.id for c in res)
        missing_ids = [i for i in ids if i not in found_ids]
        raise HTTPException(status_code=404, detail=f"ids not found: {missing_ids}")
    return res

@router.get("/course/{code}", tags=["courses"], response_model=CourseResponse)
def course_by_code(code: str):
    """Get course by course code"""
    res = db_session.query(Course).filter(Course.code == code).one_or_none()
    if res is None:
        raise HTTPException(status_code=404)
    return res

@router.get("/course/{code}/reviews", tags=["course_reviews"], response_model=t.List[CourseReviewResponse])
def course_reviews_by_code(code: str, limit: int = 100, offset: int = 0):
    """Get course reviews by course code"""
    res = db_session.query(CourseReview).join(CourseReview.course).filter(Course.code == code).options(contains_eager(CourseReview.course)).limit(limit).offset(offset).all()
    return res
