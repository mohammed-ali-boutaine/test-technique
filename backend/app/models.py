from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

# each client has one key and many docs

class Client(Base):
    __tablename__ = "client"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)

    # one to one relationship with keys
    key = relationship("Key", back_populates="client", uselist=False)

    # one to many relationship with docs
    docs = relationship("Doc", back_populates="client")


class Key(Base):
    __tablename__ = "keys"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, index=True)

    client_id = Column(Integer, ForeignKey("client.id"), unique=True)
    client = relationship("Client", back_populates="key")


class Doc(Base):
    __tablename__ = "docs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(String, index=True)

    client_id = Column(Integer, ForeignKey("client.id"))
    client = relationship("Client", back_populates="docs")