from sqlalchemy import Column, ForeignKey
from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import relationship

from .base import Base


class ProfReview(Base):
    id = Column(Integer, nullable=False, primary_key=True)
    
    course_id = Column(Integer, ForeignKey("course.id"), nullable=True)
    prof_id = Column(Integer, ForeignKey("prof.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=True)

    course = relationship("Course", back_populates="prof_reviews")
    prof = relationship("Prof", back_populates="prof_reviews")
    user = relationship("User", back_populates="prof_reviews")

    text = Column(String, nullable=True)
    clear = Column(Boolean, nullable=True)
    engaging = Column(Boolean, nullable=True)

    votes = relationship("ProfReviewVote", back_populates="review", cascade="all, delete-orphan")
