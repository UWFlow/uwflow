from sqlalchemy import Column
from sqlalchemy import Integer, String
from sqlalchemy.orm import relationship

from .base import Base


class Course(Base):
    id = Column(Integer, nullable=False, primary_key=True)
    code = Column(String, nullable=False, unique=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)

    course_reviews = relationship("CourseReview", back_populates="course")
    prof_reviews = relationship("ProfReview", back_populates="course")
