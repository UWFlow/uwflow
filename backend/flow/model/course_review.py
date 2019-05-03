from sqlalchemy import Column, ForeignKey
from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import relationship

from .base import Base


class CourseReview(Base):
    id = Column(Integer, nullable=False, primary_key=True)
    
    course_id = Column(Integer, ForeignKey("course.id"), nullable=True)
    prof_id = Column(Integer, ForeignKey("prof.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=True)

    course = relationship("Course", back_populates="course_reviews")
    prof = relationship("Prof", back_populates="course_reviews")
    user = relationship("User", back_populates="course_reviews")

    text = Column(String, nullable=True)
    easy = Column(Boolean, nullable=True)
    liked = Column(Boolean, nullable=True)
    useful = Column(Boolean, nullable=True)

    votes = relationship("CourseReviewVote", back_populates="review", cascade="all, delete-orphan")
