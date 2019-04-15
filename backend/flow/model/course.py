from sqlalchemy import Integer, String

from .base import Base, Column


class Course(Base):
    id = Column(Integer, primary_key=True)
    code = Column(String, unique=True, index=True)
    name = Column(String)
    description = Column(String)
