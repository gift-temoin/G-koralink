import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "G KORALINK"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "g-koralink-super-secret-key-rwanda-2026-secure-jwt-token-key-987654321")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days token
    
    # Database URL defaults to SQLite for zero-config run, or reads environment variable for PostgreSQL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./g_koralink.db")
    
    # Default Admin Credentials
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "ENOCK IRADUKUNDA")
    ADMIN_PHONE: str = os.getenv("ADMIN_PHONE", "0784772228")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "Enock@KoralinK")
    
    # MTN MoMo Configuration
    MOMO_USSD_CODE: str = "*182*8*1*412512#"
    MOMO_RECEIVER_NAME: str = "ENOCK"
    MOMO_CODE_NUMBER: str = "412512"

    class Config:
        case_sensitive = True

settings = Settings()
