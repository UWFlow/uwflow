from sqlalchemy import Column, ForeignKey
from sqlalchemy import Integer
from sqlalchemy.orm import relationship

from .base import Base


class ProfReviewVote(Base):
    review_id = Column(Integer, ForeignKey("prof_review.id"), nullable=False, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False, primary_key=True)

    review = relationship("ProfReview", back_populates="votes")
    user = relationship("User", back_populates="prof_review_votes")

    vote = Column(Integer, nullable=False)
