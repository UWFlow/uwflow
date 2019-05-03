from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

from flow.model import Base
from flow import config


engine = create_engine(config.SQLALCHEMY_URI)
db_session = scoped_session(sessionmaker(autocommit=False, bind=engine))
