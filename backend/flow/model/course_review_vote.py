from sqlalchemy import Column, ForeignKey
from sqlalchemy import Integer
from sqlalchemy.orm import relationship

from .base import Base


class CourseReviewVote(Base):
    review_id = Column(Integer, ForeignKey("course_review.id"), nullable=False, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False, primary_key=True)

    review = relationship("CourseReview", back_populates="votes")
    user = relationship("User", back_populates="course_review_votes")

    vote = Column(Integer, nullable=False)
