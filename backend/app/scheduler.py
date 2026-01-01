from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.triggers.date import DateTrigger
from datetime import datetime
from app.database import SessionLocal
from app.models import Reminder
from app.twilio import make_call


# Configure job store
jobstores = {
    'default': SQLAlchemyJobStore(url='sqlite:///./scheduler_jobs.db')
}

# Initialize scheduler
scheduler = BackgroundScheduler(jobstores=jobstores)


def start_scheduler():
    """Start the background scheduler"""
    if not scheduler.running:
        scheduler.start()
        print("✅ Scheduler started")
        
        # Reload pending jobs on startup
        reload_scheduled_jobs()
    else:
        print("⚠️ Scheduler already running")


def reload_scheduled_jobs():
    """
    Reload all scheduled reminders from database on startup.
    This ensures jobs aren't lost when server restarts.
    """
    db = SessionLocal()
    try:
        # Get all scheduled reminders
        pending_reminders = db.query(Reminder).filter(
            Reminder.status == "scheduled"
        ).all()
        
        print(f"📋 Found {len(pending_reminders)} scheduled reminders to reload")
        
        for reminder in pending_reminders:
            scheduled_time = datetime.fromisoformat(reminder.scheduled_time.replace('Z', '+00:00'))
            
            # Only schedule if in the future
            if scheduled_time > datetime.now():
                job_id = f"reminder-{reminder.id}"
                
                # Check if job already exists
                existing_job = scheduler.get_job(job_id)
                if not existing_job:
                    scheduler.add_job(
                        trigger_reminder,
                        trigger=DateTrigger(run_date=scheduled_time),
                        args=[reminder.id],
                        id=job_id,
                        replace_existing=True
                    )
                    print(f"  ✅ Reloaded: {reminder.title} (ID: {reminder.id})")
                else:
                    print(f"  ⏭️ Already scheduled: {reminder.title} (ID: {reminder.id})")
            else:
                print(f"  ⚠️ Skipped past reminder: {reminder.title} (ID: {reminder.id})")
                
    except Exception as e:
        print(f"❌ Error reloading jobs: {e}")
    finally:
        db.close()


def schedule_reminder(reminder_id: int, scheduled_time: datetime):
    """
    Schedule a reminder to trigger at a specific time.
    
    Args:
        reminder_id: Database ID of the reminder
        scheduled_time: When to trigger the reminder (datetime object)
    """
    job_id = f"reminder-{reminder_id}"
    
    try:
        scheduler.add_job(
            trigger_reminder,
            trigger=DateTrigger(run_date=scheduled_time),
            args=[reminder_id],
            id=job_id,
            replace_existing=True
        )
        print(f"📅 Scheduled reminder {reminder_id} for {scheduled_time}")
        return True
    except Exception as e:
        print(f"❌ Error scheduling reminder {reminder_id}: {e}")
        return False


def trigger_reminder(reminder_id: int):
    """
    Trigger a reminder: make the call and update status.
    This function is called by the scheduler at the scheduled time.
    
    Args:
        reminder_id: Database ID of the reminder to trigger
    """
    db = SessionLocal()
    
    try:
        # Fetch the reminder from DB
        reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()

        if not reminder:
            print(f"❌ Reminder with ID {reminder_id} not found in DB")
            return

        if reminder.status == "completed":
            print(f"⏭️ Reminder {reminder_id} already completed")
            return
        
        if reminder.status == "failed":
            print(f"⏭️ Reminder {reminder_id} already marked as failed")
            return

        print(f"📞 Triggering reminder {reminder.id} -> {reminder.phone_number}")
        print(f"   Title: {reminder.title}")
        print(f"   Message: {reminder.message[:50]}...")
        
        # Make the call
        call_sid = make_call(
            phone_number=reminder.phone_number,
            message=reminder.message
        )

        if call_sid:
            # Success - mark as completed
            reminder.status = "completed"
            reminder.call_sid = call_sid
            print(f"✅ Call successful! SID: {call_sid}")
        else:
            # Failed - mark as failed
            reminder.status = "failed"
            reminder.error_message = "Call failed - no SID returned"
            print(f"❌ Call failed for reminder {reminder_id}")

        db.commit()
        print(f"💾 Reminder {reminder_id} status updated to: {reminder.status}")

    except Exception as e:
        print(f"❌ Error triggering reminder {reminder_id}: {e}")
        
        # Mark as failed in DB
        try:
            reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
            if reminder:
                reminder.status = "failed"
                reminder.error_message = str(e)
                db.commit()
        except:
            pass
        
        db.rollback()
    finally:
        db.close()


def delete_scheduled_reminder(reminder_id: int):
    """
    Remove a scheduled job from the scheduler.
    Called when a reminder is deleted from the database.
    
    Args:
        reminder_id: Database ID of the reminder
        
    Returns:
        True if job was removed, False if job didn't exist
    """
    job_id = f"reminder-{reminder_id}"
    
    try:
        job = scheduler.get_job(job_id)
        
        if job:
            scheduler.remove_job(job_id)
            print(f"🗑️ Removed scheduled job: {job_id}")
            return True
        else:
            print(f"⚠️ Job {job_id} not found in scheduler (may have already triggered)")
            return False
            
    except Exception as e:
        print(f"❌ Error removing job {job_id}: {e}")
        return False


def update_scheduled_reminder(reminder_id: int, new_scheduled_time: datetime):
    """
    Update the scheduled time for a reminder.
    Removes the old job and creates a new one.
    
    Args:
        reminder_id: Database ID of the reminder
        new_scheduled_time: New time to trigger the reminder
    """
    # Remove old job
    delete_scheduled_reminder(reminder_id)
    
    # Schedule new job
    return schedule_reminder(reminder_id, new_scheduled_time)


def get_scheduled_jobs():
    """
    Get all scheduled jobs (for debugging).
    
    Returns:
        List of job details
    """
    jobs = scheduler.get_jobs()
    return [
        {
            "id": job.id,
            "next_run": job.next_run_time,
            "trigger": str(job.trigger)
        }
        for job in jobs
    ]