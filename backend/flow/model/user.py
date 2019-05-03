from sqlalchemy import Column
from sqlalchemy import Integer, String
from sqlalchemy.orm import relationship

from .base import Base


class User(Base):
    id = Column(Integer, nullable=False, primary_key=True)
    name = Column(String, nullable=False)
    program = Column(String, nullable=True)

    course_reviews = relationship("CourseReview", back_populates="user")
    prof_reviews = relationship("ProfReview", back_populates="user")

    course_review_votes = relationship("CourseReviewVote", back_populates="user", cascade="all, delete-orphan")
    prof_review_votes = relationship("ProfReviewVote", back_populates="user", cascade="all, delete-orphan")
