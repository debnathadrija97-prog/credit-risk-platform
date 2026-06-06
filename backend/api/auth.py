from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

# Import the database session and the User model from your db folder
from db.models import get_db, User

router = APIRouter()

SECRET_KEY = "creditrisk-secret-key-2024-secure"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8

# Step 2: Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# Pydantic Input Schemas
class LoginInput(BaseModel):
    username: str
    password: str

class RegisterInput(BaseModel):
    email: str 
    username: str
    password: str
    full_name: str

class Token(BaseModel):
    access_token: str
    token_type: str
    full_name: str
    role: str


# Step 3: Registration API
@router.post("/auth/register")
def register(payload: RegisterInput, db: Session = Depends(get_db)):
    # Check if the username or email already exists in the database
    existing_user = db.query(User).filter(
        (User.username == payload.username) | (User.email == payload.email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username or email already registered"
        )
    
    # Hash the password and create the new user
    hashed_password = get_password_hash(payload.password)
    new_user = User(
        username=payload.username,
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hashed_password,
        role="officer" # Default role for new sign-ups
    )
    
    # Save to the database
    db.add(new_user)
    db.commit()
    
    return {"message": "User successfully created!"}


# Step 4: Real Login API
@router.post("/auth/login", response_model=Token)
def login(payload: LoginInput, db: Session = Depends(get_db)):
    # Look up the user in the database
    user = db.query(User).filter(User.username == payload.username).first()
    
    # Check if user exists AND the password matches the hashed version
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    # Generate token
    access_token = create_access_token(data={"sub": user.username})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "full_name": user.full_name,
        "role": user.role
    }

@router.get("/auth/me")
def get_me():
    return {"status": "ok"}