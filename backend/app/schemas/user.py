from datetime import datetime

from pydantic import BaseModel


class UserProfile(BaseModel):
    id: str
    email: str
    username: str
    avatar_url: str | None
    level: int
    streak_days: int
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    username: str | None = None
