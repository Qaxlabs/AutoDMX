import os
from dotenv import load_dotenv
from pydantic import BaseSettings

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    META_ACCESS_TOKEN: str
    META_APP_ID: str
    META_APP_SECRET: str
    INSTAGRAM_ACCOUNT_ID: str
    WEBHOOK_VERIFY_TOKEN: str
    SUPABASE_URL: str
    SUPABASE_KEY: str
    GROQ_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()