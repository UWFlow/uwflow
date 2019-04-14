from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

from app.model import Base
from app import config


engine = create_engine(config.SQLALCHEMY_URI)
db_session = scoped_session(sessionmaker(autocommit=False, bind=engine))


def init_session():
    Base.metadata.create_all(engine)
