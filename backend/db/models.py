from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()
Base = declarative_base()

class Application(Base):
    __tablename__ = 'applications'

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Input features
    applicant_name = Column(String(200))
    income = Column(Float)
    loan_amount = Column(Float)
    loan_annuity = Column(Float)
    age_years = Column(Float)
    employment_years = Column(Float)
    ext_source_1 = Column(Float, nullable=True)
    ext_source_2 = Column(Float, nullable=True)
    ext_source_3 = Column(Float, nullable=True)

    # Prediction results
    risk_score = Column(Float)
    default_probability = Column(Float)
    risk_band = Column(String(10))
    decision = Column(String(20))

    # Loan officer override
    overridden = Column(Boolean, default=False)
    override_reason = Column(Text, nullable=True)
    reviewed_by = Column(String(200), nullable=True)

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    full_name = Column(String(150))
    hashed_password = Column(String(200))
    role = Column(String(20), default='officer')
    created_at = Column(DateTime, default=datetime.utcnow)

DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()