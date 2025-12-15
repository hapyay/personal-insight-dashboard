from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), nullable=False)  # sentiment, topic, habit, goal, comprehensive
    result = Column(JSON, nullable=False)  # 存储结构化分析结果
    model_used = Column(String(50), nullable=False)  # 记录使用的模型
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 外键关系
    emotion_entry_id = Column(Integer, ForeignKey("emotion_entries.id"), nullable=True)
    finance_entry_id = Column(Integer, ForeignKey("finance_entries.id"), nullable=True)
    skill_entry_id = Column(Integer, ForeignKey("skill_entries.id"), nullable=True)
    learning_entry_id = Column(Integer, ForeignKey("learning_entries.id"), nullable=True)
    
    # 关系
    emotion_entry = relationship("EmotionEntry", back_populates="analysis_results")
    finance_entry = relationship("FinanceEntry", back_populates="analysis_results")
    skill_entry = relationship("SkillEntry", back_populates="analysis_results")
    learning_entry = relationship("LearningEntry", back_populates="analysis_results")
