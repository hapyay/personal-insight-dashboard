from sqlalchemy import Column, Integer, String, Text, Float, Date, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class EmotionEntry(Base):
    __tablename__ = "emotion_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    date = Column(Date, nullable=False)
    tags = Column(JSON, default=[])
    sentiment = Column(String(20))  # positive, negative, neutral
    sentiment_score = Column(Float)  # -1到1
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    analysis_results = relationship("AnalysisResult", back_populates="emotion_entry")


class FinanceEntry(Base):
    __tablename__ = "finance_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String(50), nullable=False)  # income, expense
    subcategory = Column(String(50), nullable=False)  # food, transportation, salary
    description = Column(Text)
    date = Column(Date, nullable=False)
    tags = Column(JSON, default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    analysis_results = relationship("AnalysisResult", back_populates="finance_entry")


class SkillEntry(Base):
    __tablename__ = "skill_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    level = Column(Integer, default=1)  # 1-5
    progress = Column(Integer, default=0)  # 0-100
    description = Column(Text)
    learning_paths = Column(JSON, default={})
    future_directions = Column(JSON, default=[])
    related_skills = Column(JSON, default=[])
    skill_tree_id = Column(Integer, ForeignKey("skill_trees.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    skill_tree = relationship("SkillTree", back_populates="skills")
    analysis_results = relationship("AnalysisResult", back_populates="skill_entry")


class LearningEntry(Base):
    __tablename__ = "learning_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String(100), nullable=False)
    duration = Column(Integer, nullable=False)  # 学习时长，分钟
    content = Column(Text)
    date = Column(Date, nullable=False)
    tags = Column(JSON, default=[])
    skill_id = Column(Integer, ForeignKey("skill_entries.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    skill = relationship("SkillEntry", back_populates="learning_entries")
    analysis_results = relationship("AnalysisResult", back_populates="learning_entry")


# 添加SkillEntry和LearningEntry之间的反向关系
SkillEntry.learning_entries = relationship("LearningEntry", back_populates="skill")
