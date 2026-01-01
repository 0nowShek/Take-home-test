from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Reminder
from app.schemas import ReminderCreate, ReminderUpdate, ReminderResponse
from datetime import datetime
from app.scheduler import (
    schedule_reminder,
    delete_scheduled_reminder,
    update_scheduled_reminder,
    get_scheduled_jobs
)

router = APIRouter()


@router.post("/", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
def create_reminder(reminder: ReminderCreate, db: Session = Depends(get_db)):
    """
    Create a new reminder
    
    - Validates all fields
    - Ensures scheduled_time is in the future
    - Phone number must be in E.164 format (+14155552671)
    - Automatically schedules the reminder to trigger at specified time
    """
    # Create reminder in database
    db_reminder = Reminder(
        title=reminder.title,
        message=reminder.message,
        phone_number=reminder.phone_number,
        scheduled_time=reminder.scheduled_time,
        timezone=reminder.timezone,
        status="scheduled"
    )
    
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)
    
    print(f"✅ Created reminder: {db_reminder.id} - {db_reminder.title}")
    
    # Schedule the job - use the datetime directly
    success = schedule_reminder(db_reminder.id, db_reminder.scheduled_time)
    
    if not success:
        print(f"⚠️ Warning: Failed to schedule reminder {db_reminder.id}")
    
    return db_reminder


@router.get("/", response_model=List[ReminderResponse])
def get_reminders(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all reminders
    
    Optional filters:
    - skip: Pagination offset (default: 0)
    - limit: Max results (default: 100)
    - status: Filter by status (scheduled, completed, failed)
    """
    query = db.query(Reminder)
    
    # Filter by status if provided
    if status:
        query = query.filter(Reminder.status == status)
    
    # Apply pagination
    reminders = query.offset(skip).limit(limit).all()
    
    print(f"📋 Fetched {len(reminders)} reminders (status={status or 'all'})")
    
    return reminders


@router.get("/{reminder_id}", response_model=ReminderResponse)
def get_reminder(reminder_id: int, db: Session = Depends(get_db)):
    """
    Get a single reminder by ID
    
    Returns 404 if reminder not found
    """
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reminder with id {reminder_id} not found"
        )
    
    return reminder


@router.put("/{reminder_id}", response_model=ReminderResponse)
def update_reminder(
    reminder_id: int,
    reminder_update: ReminderUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a reminder
    
    - Only provided fields are updated
    - updated_at is automatically set
    - If scheduled_time changes, job is rescheduled
    """
    db_reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    
    if not db_reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reminder with id {reminder_id} not found"
        )
    
    # Track if scheduled_time changed
    time_changed = False
    update_data = reminder_update.dict(exclude_unset=True)
    
    if "scheduled_time" in update_data:
        time_changed = True
    
    # Update fields
    for field, value in update_data.items():
        setattr(db_reminder, field, value)
        
    db.commit()
    db.refresh(db_reminder)
    
    print(f"✏️ Updated reminder: {db_reminder.id} - {db_reminder.title}")
    
    # Reschedule if time changed and still scheduled
    if time_changed and db_reminder.status == "scheduled":
        # Use the datetime directly - no need to parse
        success = update_scheduled_reminder(db_reminder.id, db_reminder.scheduled_time)
        
        if success:
            print(f"📅 Rescheduled reminder {db_reminder.id} to {db_reminder.scheduled_time}")
        else:
            print(f"⚠️ Warning: Failed to reschedule reminder {db_reminder.id}")
    
    return db_reminder


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(reminder_id: int, db: Session = Depends(get_db)):
    """
    Delete a reminder
    
    - Removes from database
    - Cancels scheduled job if exists
    """
    db_reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    
    if not db_reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reminder with id {reminder_id} not found"
        )
    
    # Remove from scheduler first
    delete_scheduled_reminder(reminder_id)
    
    # Delete from database
    db.delete(db_reminder)
    db.commit()
    
    print(f"🗑️ Deleted reminder: {reminder_id}")
    
    return None


# ============================================
# DEBUG / ADMIN ENDPOINTS
# ============================================

@router.get("/debug/jobs", tags=["debug"])
def list_scheduled_jobs():
    """
    List all scheduled jobs (for debugging)
    
    Returns job IDs and next run times
    """
    jobs = get_scheduled_jobs()
    
    return {
        "total_jobs": len(jobs),
        "jobs": jobs
    }


@router.post("/debug/trigger/{reminder_id}", tags=["debug"])
def manually_trigger_reminder(reminder_id: int):
    """
    Manually trigger a reminder immediately (for testing)
    
    Does NOT wait for scheduled time
    """
    from app.scheduler import trigger_reminder
    
    try:
        trigger_reminder(reminder_id)
        return {
            "status": "triggered",
            "reminder_id": reminder_id,
            "message": "Check logs for call status"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )