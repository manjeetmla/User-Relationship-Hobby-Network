from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    age: int = Field(..., gt=0, lt=150)
    hobbies: List[str] = Field(default_factory=list)

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=1, max_length=50)
    age: Optional[int] = Field(None, gt=0, lt=150)
    hobbies: Optional[List[str]] = None

class UserResponse(UserBase):
    id: str
    friends: List[str]
    created_at: datetime
    popularity_score: float
    
    class Config:
        from_attributes = True

class LinkRequest(BaseModel):
    friend_id: str

class GraphNode(BaseModel):
    id: str
    username: str
    age: int
    hobbies: List[str]
    popularity_score: float

class GraphEdge(BaseModel):
    source: str
    target: str

class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
