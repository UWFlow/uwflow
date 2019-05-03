from functools import partial

from sqlalchemy import Column, DateTime, func
from sqlalchemy.ext.declarative import declarative_base, declared_attr

from flow.util.text import camel_to_snake_case

class AutorefBase:
    created = Column(DateTime, nullable=False, default=func.now())
    modified = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())

    @declared_attr
    def __tablename__(cls):
        return camel_to_snake_case(cls.__name__)

    def __repr__(self):
        return f"<{self.__class__.__name__}:{self.id}>"


Base = declarative_base(cls=AutorefBase)
