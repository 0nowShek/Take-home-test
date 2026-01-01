from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional
import pytz

class ReminderBase(BaseModel):
    """Base schema with common fields"""
    title: str = Field(..., min_length=1, max_length=100)
    message: str = Field(..., min_length=10, max_length=500)
    phone_number: str = Field(..., pattern=r'^\+[1-9]\d{1,14}$')  # E.164 format
    timezone: str = Field(default="America/New_York")
    scheduled_time: datetime

class ReminderCreate(ReminderBase):
    """Schema for creating a new reminder"""
    pass
    
    @validator('scheduled_time')
    def scheduled_time_must_be_future(cls, reminder_datetime, values):
        tz_name = values.get("timezone")

        if not tz_name:
            raise ValueError("Timezone must be provided")

        try:
            tz = pytz.timezone(tz_name)
        except Exception:
            raise ValueError(f"Invalid timezone: {tz_name}")

        # Convert input datetime to the user's timezone
        if reminder_datetime.tzinfo is None:
            # naive -> assume user timezone
            reminder_datetime = tz.localize(reminder_datetime)
        else:
            # aware (like your +00:00 UTC input) -> convert to user's timezone
            reminder_datetime = reminder_datetime.astimezone(tz)

        # Current time in the user's timezone
        now = datetime.now(tz)

        if reminder_datetime <= now:
            raise ValueError('Scheduled time must be in the future')

        return reminder_datetime

class ReminderUpdate(BaseModel):
    """Schema for updating a reminder (all fields optional)"""
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    message: Optional[str] = Field(None, min_length=10, max_length=500)
    phone_number: Optional[str] = Field(None, pattern=r'^\+[1-9]\d{1,14}$')
    scheduled_time: Optional[datetime] = None
    timezone: Optional[str] = None
    status: Optional[str] = None

class ReminderResponse(ReminderBase):
    """Schema for reminder responses"""
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    call_sid: Optional[str] = None
    error_message: Optional[str] = None
    
    class Config:
        from_attributes = True  # Allows ORM models to work with Pydantic