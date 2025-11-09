from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os

from backend.database import engine, get_db, Base
from backend.models import User, friendship_table
from backend.schemas import (
    UserCreate, UserUpdate, UserResponse, LinkRequest,
    GraphResponse, GraphNode, GraphEdge
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="User Relationship & Hobby Network API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        username=user.username,
        age=user.age,
        hobbies=user.hobbies or [],
        friends=user.get_friend_ids(),
        created_at=user.created_at,
        popularity_score=user.calculate_popularity_score()
    )

@app.get("/")
def read_root():
    return {"message": "User Relationship & Hobby Network API", "status": "running"}

@app.get("/api/users", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [user_to_response(user) for user in users]

@app.post("/api/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{user_data.username}' already exists"
        )
    
    new_user = User(
        username=user_data.username,
        age=user_data.age,
        hobbies=user_data.hobbies or []
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return user_to_response(new_user)

@app.get("/api/users/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id '{user_id}' not found"
        )
    return user_to_response(user)

@app.put("/api/users/{user_id}", response_model=UserResponse)
def update_user(user_id: str, user_data: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id '{user_id}' not found"
        )
    
    if user_data.username is not None:
        existing = db.query(User).filter(
            User.username == user_data.username,
            User.id != user_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Username '{user_data.username}' already exists"
            )
        user.username = user_data.username
    
    if user_data.age is not None:
        user.age = user_data.age
    
    if user_data.hobbies is not None:
        user.hobbies = user_data.hobbies
    
    db.commit()
    db.refresh(user)
    
    return user_to_response(user)

@app.delete("/api/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id '{user_id}' not found"
        )
    
    friends = user.get_all_friends()
    if friends:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete user with existing friendships. Please remove all friendships first."
        )
    
    db.delete(user)
    db.commit()
    return None

@app.post("/api/users/{user_id}/link", response_model=UserResponse)
def create_friendship(user_id: str, link_data: LinkRequest, db: Session = Depends(get_db)):
    if user_id == link_data.friend_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create friendship with yourself"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id '{user_id}' not found"
        )
    
    friend = db.query(User).filter(User.id == link_data.friend_id).first()
    if not friend:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Friend with id '{link_data.friend_id}' not found"
        )
    
    existing_friends = user.get_friend_ids()
    if link_data.friend_id in existing_friends:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Friendship already exists"
        )
    
    user_id_1, user_id_2 = sorted([user_id, link_data.friend_id])
    
    insert_stmt = friendship_table.insert().values(
        user_id_1=user_id_1,
        user_id_2=user_id_2
    )
    db.execute(insert_stmt)
    db.commit()
    db.refresh(user)
    
    return user_to_response(user)

@app.delete("/api/users/{user_id}/unlink", response_model=UserResponse)
def remove_friendship(user_id: str, link_data: LinkRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id '{user_id}' not found"
        )
    
    friend = db.query(User).filter(User.id == link_data.friend_id).first()
    if not friend:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Friend with id '{link_data.friend_id}' not found"
        )
    
    existing_friends = user.get_friend_ids()
    if link_data.friend_id not in existing_friends:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friendship does not exist"
        )
    
    user_id_1, user_id_2 = sorted([user_id, link_data.friend_id])
    
    delete_stmt = friendship_table.delete().where(
        (friendship_table.c.user_id_1 == user_id_1) &
        (friendship_table.c.user_id_2 == user_id_2)
    )
    db.execute(delete_stmt)
    db.commit()
    db.refresh(user)
    
    return user_to_response(user)

@app.get("/api/graph", response_model=GraphResponse)
def get_graph_data(db: Session = Depends(get_db)):
    users = db.query(User).all()
    
    nodes = [
        GraphNode(
            id=user.id,
            username=user.username,
            age=user.age,
            hobbies=user.hobbies or [],
            popularity_score=user.calculate_popularity_score()
        )
        for user in users
    ]
    
    edges = []
    processed_pairs = set()
    
    for user in users:
        for friend in user.friends_1:
            pair = tuple(sorted([user.id, friend.id]))
            if pair not in processed_pairs:
                edges.append(GraphEdge(source=user.id, target=friend.id))
                processed_pairs.add(pair)
    
    return GraphResponse(nodes=nodes, edges=edges)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
