from sqlalchemy import Column
from sqlalchemy import Integer, String
from sqlalchemy.orm import relationship

from .base import Base


class Prof(Base):
    id = Column(Integer, nullable=False, primary_key=True)
    name = Column(String, nullable=False)

    course_reviews = relationship("CourseReview", back_populates="prof")
    prof_reviews = relationship("ProfReview", back_populates="prof")
