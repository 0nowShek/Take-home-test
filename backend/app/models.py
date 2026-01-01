from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base

class Reminder(Base):
    """
    Reminder database model
    
    Stores all reminder information including:
    - Title and message
    - Phone number to call
    - Scheduled time and timezone
    - Status (scheduled, completed, failed)
    - Metadata (created_at, updated_at)
    - Call results (call_sid, error_message)
    """
    __tablename__ = "reminders"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Reminder content
    title = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    
    # Contact info
    phone_number = Column(String(20), nullable=False)
    
    # Scheduling
    scheduled_time = Column(DateTime, nullable=False)
    timezone = Column(String(50), nullable=False, default="America/New_York")
    
    # Status tracking
    status = Column(
        String(20), 
        nullable=False, 
        default="scheduled",
        # Possible values: scheduled, completed, failed
    )
    
    # Metadata - USE func.now() instead of datetime.utcnow
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    
    # Call results (populated after call attempt)
    call_sid = Column(String(50), nullable=True)  # Twilio call ID
    error_message = Column(Text, nullable=True)   # Error if failed
    
    def __repr__(self):
        return f"<Reminder(id={self.id}, title='{self.title}', status='{self.status}')>"