"""
Unit Tests for Authentication System

This module contains comprehensive tests for the authentication module,
verifying JWT token creation, password hashing, and auth endpoints.
"""

import pytest
import tempfile
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
from jose import jwt

from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    verify_token,
    get_current_user,
    validate_password,
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from app.models import Base, User
from app.database import get_db, SessionLocal


# =============================================================================
# Test Fixtures
# =============================================================================

@pytest.fixture
def db_session():
    """
    Create a file-based SQLite database session for testing.
    Uses a temp file to avoid threading issues with in-memory SQLite.
    """
    # Create temp file for database
    fd, db_path = tempfile.mkstemp(suffix='.db')
    os.close(fd)
    
    try:
        engine = create_engine(f'sqlite:///{db_path}', echo=False, connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=engine)
        Session = sessionmaker(bind=engine)
        session = Session()
        yield session
        session.close()
    finally:
        # Cleanup temp file
        if os.path.exists(db_path):
            os.unlink(db_path)


@pytest.fixture
def test_user(db_session):
    """
    Create a test user in the database.
    """
    user = User(
        username='test_user',
        email='test@example.com',
        hashed_password=hash_password('password123')
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


# =============================================================================
# Test: Password Hashing
# =============================================================================

class TestPasswordHashing:
    """Tests for password hashing functionality."""

    def test_hash_password_returns_string(self):
        """hash_password should return a string."""
        hashed = hash_password("testpassword123")
        assert isinstance(hashed, str)
        assert len(hashed) > 0

    def test_hash_password_different_hashes(self):
        """Same password should produce different hashes (due to salt)."""
        password = "testpassword123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        assert hash1 != hash2  # Different salts

    def test_verify_password_correct(self):
        """verify_password should return True for correct password."""
        password = "testpassword123"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """verify_password should return False for incorrect password."""
        password = "testpassword123"
        wrong_password = "wrongpassword456"
        hashed = hash_password(password)
        assert verify_password(wrong_password, hashed) is False

    def test_verify_password_empty(self):
        """verify_password should return False for empty password."""
        password = "testpassword123"
        hashed = hash_password(password)
        assert verify_password("", hashed) is False


# =============================================================================
# Test: Password Validation
# =============================================================================

class TestPasswordValidation:
    """Tests for password validation functionality."""

    def test_valid_password(self):
        """Valid password should pass all checks."""
        is_valid, message = validate_password("password123")
        assert is_valid is True
        assert message == ""

    def test_password_too_short(self):
        """Password shorter than 8 chars should fail."""
        is_valid, message = validate_password("pass1")
        assert is_valid is False
        assert "8 characters" in message

    def test_password_no_letter(self):
        """Password without letters should fail."""
        is_valid, message = validate_password("12345678")
        assert is_valid is False
        assert "letter" in message

    def test_password_no_number(self):
        """Password without numbers should fail."""
        is_valid, message = validate_password("abcdefgh")
        assert is_valid is False
        assert "number" in message

    def test_password_edge_case_8_chars(self):
        """Password with exactly 8 chars should pass if valid."""
        is_valid, message = validate_password("pass1234")
        assert is_valid is True

    def test_password_edge_case_7_chars(self):
        """Password with 7 chars should fail."""
        is_valid, message = validate_password("pas1234")
        assert is_valid is False


# =============================================================================
# Test: JWT Token Creation
# =============================================================================

class TestTokenCreation:
    """Tests for JWT token creation."""

    def test_create_access_token_returns_string(self):
        """create_access_token should return a string."""
        token = create_access_token(data={"sub": "1"})
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_access_token_contains_user_id(self):
        """Token should contain the user ID in payload."""
        user_id = "123"
        token = create_access_token(data={"sub": user_id})
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == user_id

    def test_create_access_token_has_expiration(self):
        """Token should have an expiration time."""
        token = create_access_token(data={"sub": "1"})
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert "exp" in payload

    def test_create_access_token_custom_expiry(self):
        """Token should respect custom expiration delta."""
        custom_delta = timedelta(hours=2)
        token = create_access_token(data={"sub": "1"}, expires_delta=custom_delta)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Check expiration is approximately 2 hours from now
        exp_time = datetime.utcfromtimestamp(payload["exp"])
        expected_time = datetime.utcnow() + custom_delta
        time_diff = abs((exp_time - expected_time).total_seconds())
        assert time_diff < 5  # Within 5 seconds


# =============================================================================
# Test: JWT Token Verification
# =============================================================================

class TestTokenVerification:
    """Tests for JWT token verification."""

    def test_verify_valid_token(self, test_user):
        """verify_token should return payload for valid token."""
        token = create_access_token(data={"sub": str(test_user.id)})
        payload = verify_token(token)
        assert payload["sub"] == str(test_user.id)

    def test_verify_invalid_token(self):
        """verify_token should raise HTTPException for invalid token."""
        from fastapi import HTTPException
        
        with pytest.raises(HTTPException) as exc_info:
            verify_token("invalid_token_here")
        
        assert exc_info.value.status_code == 401

    def test_verify_expired_token(self):
        """verify_token should raise HTTPException for expired token."""
        from fastapi import HTTPException
        
        # Create token that expired 1 hour ago
        expired_delta = timedelta(hours=-1)
        token = create_access_token(data={"sub": "1"}, expires_delta=expired_delta)
        
        with pytest.raises(HTTPException) as exc_info:
            verify_token(token)
        
        assert exc_info.value.status_code == 401


# =============================================================================
# Test: Get Current User
# =============================================================================

class TestGetCurrentUser:
    """Tests for get_current_user function."""

    def test_get_current_user_valid_token(self, db_session, test_user):
        """get_current_user should return user for valid token."""
        token = create_access_token(data={"sub": str(test_user.id)})
        user = get_current_user(token, db_session)
        
        assert user.id == test_user.id
        assert user.username == test_user.username
        assert user.email == test_user.email

    def test_get_current_user_invalid_token(self, db_session):
        """get_current_user should raise HTTPException for invalid token."""
        from fastapi import HTTPException
        
        with pytest.raises(HTTPException) as exc_info:
            get_current_user("invalid_token", db_session)
        
        assert exc_info.value.status_code == 401

    def test_get_current_user_nonexistent_user(self, db_session):
        """get_current_user should raise HTTPException for non-existent user."""
        from fastapi import HTTPException
        
        # Create token with non-existent user ID
        token = create_access_token(data={"sub": "99999"})
        
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(token, db_session)
        
        assert exc_info.value.status_code == 401


# =============================================================================
# Test: Auth Endpoints (Integration Tests)
# =============================================================================

class TestAuthEndpoints:
    """Integration tests for authentication endpoints."""

    @pytest.fixture
    def db_path(self):
        """Create temp database file and return path."""
        fd, path = tempfile.mkstemp(suffix='.db')
        os.close(fd)
        yield path
        if os.path.exists(path):
            os.unlink(path)

    @pytest.fixture
    def client(self, db_path):
        """Create test client with database override."""
        from fastapi.testclient import TestClient
        from app.main import app
        
        # Create engine and tables
        engine = create_engine(f'sqlite:///{db_path}', connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=engine)
        
        # Override dependency
        def override_get_db():
            Session = sessionmaker(bind=engine)
            session = Session()
            try:
                yield session
            finally:
                session.close()

        app.dependency_overrides[get_db] = override_get_db
        
        client = TestClient(app)
        yield client
        
        # Clean up overrides
        app.dependency_overrides.clear()

    def test_register_user_success(self, client):
        """POST /auth/register should create new user."""
        response = client.post(
            "/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "password123"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "newuser@example.com"
        assert "id" in data
        assert "hashed_password" not in data  # Password not exposed

    def test_register_user_duplicate_email(self, client, db_path):
        """POST /auth/register should reject duplicate email."""
        # First create a user
        engine = create_engine(f'sqlite:///{db_path}', connect_args={"check_same_thread": False})
        Session = sessionmaker(bind=engine)
        session = Session()
        
        user = User(
            username='existing_user',
            email='existing@example.com',
            hashed_password=hash_password('password123')
        )
        session.add(user)
        session.commit()
        session.close()
        
        # Try to register with same email
        response = client.post(
            "/auth/register",
            json={
                "username": "anotheruser",
                "email": "existing@example.com",
                "password": "password123"
            }
        )
        
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

    def test_register_user_duplicate_username(self, client, db_path):
        """POST /auth/register should reject duplicate username."""
        # First create a user
        engine = create_engine(f'sqlite:///{db_path}', connect_args={"check_same_thread": False})
        Session = sessionmaker(bind=engine)
        session = Session()
        
        user = User(
            username='existing_user',
            email='different@example.com',
            hashed_password=hash_password('password123')
        )
        session.add(user)
        session.commit()
        session.close()
        
        # Try to register with same username
        response = client.post(
            "/auth/register",
            json={
                "username": "existing_user",
                "email": "new@example.com",
                "password": "password123"
            }
        )
        
        assert response.status_code == 400
        assert "Username already taken" in response.json()["detail"]

    def test_register_user_weak_password_short(self, client):
        """POST /auth/register should reject weak password (too short)."""
        response = client.post(
            "/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "short1"
            }
        )
        
        # Pydantic validation catches min_length first (422)
        assert response.status_code in [400, 422]

    def test_register_user_weak_password_no_letter(self, client):
        """POST /auth/register should reject password without letters."""
        response = client.post(
            "/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "12345678"
            }
        )
        
        assert response.status_code == 400
        assert "letter" in response.json()["detail"]

    def test_register_user_weak_password_no_number(self, client):
        """POST /auth/register should reject password without numbers."""
        response = client.post(
            "/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "abcdefgh"
            }
        )
        
        assert response.status_code == 400
        assert "number" in response.json()["detail"]

    def test_login_success(self, client, db_path):
        """POST /auth/login should return token for valid credentials."""
        # First create a user
        engine = create_engine(f'sqlite:///{db_path}', connect_args={"check_same_thread": False})
        Session = sessionmaker(bind=engine)
        session = Session()
        
        user = User(
            username='test_user',
            email='test@example.com',
            hashed_password=hash_password('password123')
        )
        session.add(user)
        session.commit()
        user_id = user.id
        session.close()
        
        # Login
        response = client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "password123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        
        # Verify token is valid
        payload = jwt.decode(data["access_token"], SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == str(user_id)

    def test_login_invalid_email(self, client):
        """POST /auth/login should reject invalid email."""
        response = client.post(
            "/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "password123"
            }
        )
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]

    def test_login_wrong_password(self, client, db_path):
        """POST /auth/login should reject wrong password."""
        # First create a user
        engine = create_engine(f'sqlite:///{db_path}', connect_args={"check_same_thread": False})
        Session = sessionmaker(bind=engine)
        session = Session()
        
        user = User(
            username='test_user',
            email='test@example.com',
            hashed_password=hash_password('password123')
        )
        session.add(user)
        session.commit()
        session.close()
        
        # Try wrong password
        response = client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]

    def test_get_current_user_success(self, client, db_path):
        """GET /auth/me should return current user profile."""
        # First create a user
        engine = create_engine(f'sqlite:///{db_path}', connect_args={"check_same_thread": False})
        Session = sessionmaker(bind=engine)
        session = Session()
        
        user = User(
            username='test_user',
            email='test@example.com',
            hashed_password=hash_password('password123')
        )
        session.add(user)
        session.commit()
        user_id = user.id
        username = user.username
        email = user.email
        session.close()
        
        # Login to get token
        login_response = client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "password123"
            }
        )
        token = login_response.json()["access_token"]
        
        # Then get current user
        response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id
        assert data["username"] == username
        assert data["email"] == email

    def test_get_current_user_no_token(self, client):
        """GET /auth/me should reject request without token."""
        response = client.get("/auth/me")
        
        assert response.status_code == 401

    def test_get_current_user_invalid_token(self, client):
        """GET /auth/me should reject request with invalid token."""
        response = client.get(
            "/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        
        assert response.status_code == 401
