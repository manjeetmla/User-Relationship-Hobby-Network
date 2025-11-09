from sqlalchemy import Column, String, Integer, DateTime, Table, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from backend.database import Base

friendship_table = Table(
    'friendships',
    Base.metadata,
    Column('user_id_1', String, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    Column('user_id_2', String, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, nullable=False, index=True)
    age = Column(Integer, nullable=False)
    hobbies = Column(ARRAY(String), nullable=False, default=list)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    friends_1 = relationship(
        'User',
        secondary=friendship_table,
        primaryjoin=id == friendship_table.c.user_id_1,
        secondaryjoin=id == friendship_table.c.user_id_2,
        backref='friends_2'
    )
    
    def get_all_friends(self):
        return list(set(self.friends_1 + self.friends_2))
    
    def get_friend_ids(self):
        return [friend.id for friend in self.get_all_friends()]
    
    def calculate_popularity_score(self):
        friends = self.get_all_friends()
        unique_friends_count = len(friends)
        
        shared_hobbies_count = 0
        user_hobbies = set(self.hobbies or [])
        
        for friend in friends:
            friend_hobbies = set(friend.hobbies or [])
            shared_hobbies_count += len(user_hobbies.intersection(friend_hobbies))
        
        popularity_score = unique_friends_count + (shared_hobbies_count * 0.5)
        return round(popularity_score, 2)
