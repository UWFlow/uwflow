from functools import partial

from sqlalchemy import Column as _Column
from sqlalchemy import DateTime, func
from sqlalchemy.ext.declarative import declarative_base, declared_attr

from app.util.text import camel_to_snake_case

# Make columns non-nullable by default
Column = partial(_Column, nullable=False)
NullColumn = partial(_Column, nullable=True)


class AutorefBase:
    created = Column(DateTime, default=func.now())
    modified = Column(DateTime, default=func.now(), onupdate=func.now())

    @declared_attr
    def __tablename__(cls):
        return camel_to_snake_case(cls.__name__)

    def __repr__(self):
        return f"<{self.__class__.__name__}:{self.id}>"


Base = declarative_base(cls=AutorefBase)
