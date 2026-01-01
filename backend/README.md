# Call Me Reminder - Backend

Production-ready FastAPI backend with SQLite database, APScheduler for background jobs, and Twilio integration for voice calls.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9 or higher
- pip package manager
- Twilio account (free trial works)

### Installation

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Edit .env with your Twilio credentials
# (See Environment Variables section below)

# Run the server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── scheduler.py         # APScheduler setup
│   ├── twilio_client.py     # Twilio integration
│   └── routes/
│       └── reminders.py     # API endpoints
│
├── .env.example             # Environment variables template
├── requirements.txt         # Python dependencies
├── reminders.db            # SQLite database (auto-created)
├── scheduler_jobs.db       # Scheduler persistence (auto-created)
└── README.md               # This file
```

---

## 🔧 Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Twilio Configuration (Required for calls)
TWILIO_ACCOUNT_SID=AC3c3c24ea7c7666137dd521e03370f41f
TWILIO_AUTH_TOKEN=b0caa2e7e89df40532a255e58e3b079f
TWILIO_PHONE_NUMBER=+16466300614

# Database (Optional - defaults to SQLite)
DATABASE_URL=sqlite:///./reminders.db

# Server Configuration (Optional)
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

### Getting Twilio Credentials

1. Sign up at [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Get a free trial phone number
3. Find your Account SID and Auth Token in the console
4. Verify the phone number you want to test with (trial limitation)

**Important:**
- Free trial accounts can only call verified numbers
- Calls will have a "trial account" message prefix
- Upgrade for production use

---

## 📦 Dependencies

```txt
fastapi==0.104.1          # Web framework
uvicorn==0.24.0           # ASGI server
sqlalchemy==2.0.23        # ORM
pydantic==2.5.0           # Data validation
python-dotenv==1.0.0      # Environment variables
twilio==8.10.0            # Twilio API client
apscheduler==3.10.4       # Background job scheduler
```

Install all dependencies:
```bash
pip install -r requirements.txt
```

---

## 🗄️ Database Schema

### Reminders Table

```sql
CREATE TABLE reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    scheduled_time DATETIME NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    call_sid VARCHAR(50),
    error_message TEXT
);
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Auto-incrementing primary key |
| `title` | String(100) | Reminder title (3-100 chars) |
| `message` | Text | Message to speak (10-500 chars) |
| `phone_number` | String(20) | E.164 format (+14155552671) |
| `scheduled_time` | DateTime | When to trigger (local time) |
| `timezone` | String(50) | User's timezone (e.g., America/New_York) |
| `status` | String(20) | scheduled, completed, or failed |
| `created_at` | DateTime | When reminder was created |
| `updated_at` | DateTime | Last modification time |
| `call_sid` | String(50) | Twilio call ID (if completed) |
| `error_message` | Text | Error details (if failed) |

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:8000
```

### Endpoints

#### 1. Create Reminder
```http
POST /api/reminders/
Content-Type: application/json

{
  "title": "Team Meeting",
  "message": "Don't forget the team meeting at 2 PM in conference room B",
  "phone_number": "+14155552671",
  "scheduled_time": "2026-01-02T14:00:00",
  "timezone": "America/New_York"
}

Response: 201 Created
{
  "id": 1,
  "title": "Team Meeting",
  "message": "Don't forget...",
  "phone_number": "+14155552671",
  "scheduled_time": "2026-01-02T14:00:00",
  "timezone": "America/New_York",
  "status": "scheduled",
  "created_at": "2026-01-01T10:00:00",
  "updated_at": "2026-01-01T10:00:00",
  "call_sid": null,
  "error_message": null
}
```

#### 2. List Reminders
```http
GET /api/reminders/
Optional Query Parameters:
  - status: scheduled | completed | failed
  - skip: pagination offset (default: 0)
  - limit: max results (default: 100)

Example:
GET /api/reminders/?status=scheduled&limit=10

Response: 200 OK
[
  {
    "id": 1,
    "title": "Team Meeting",
    ...
  }
]
```

#### 3. Get Single Reminder
```http
GET /api/reminders/{id}

Response: 200 OK
{
  "id": 1,
  "title": "Team Meeting",
  ...
}

Response: 404 Not Found
{
  "detail": "Reminder with id 999 not found"
}
```

#### 4. Update Reminder
```http
PUT /api/reminders/{id}
Content-Type: application/json

{
  "title": "Updated Meeting",
  "scheduled_time": "2026-01-02T15:00:00"
}

Response: 200 OK
{
  "id": 1,
  "title": "Updated Meeting",
  "scheduled_time": "2026-01-02T15:00:00",
  ...
}
```

Notes:
- Only provided fields are updated
- `updated_at` is automatically set
- If `scheduled_time` changes, job is rescheduled

#### 5. Delete Reminder
```http
DELETE /api/reminders/{id}

Response: 204 No Content
```

Notes:
- Removes from database
- Cancels scheduled job if exists

---

### Debug Endpoints

#### List Scheduled Jobs
```http
GET /api/reminders/debug/jobs

Response: 200 OK
{
  "total_jobs": 3,
  "jobs": [
    {
      "id": "reminder-1",
      "next_run": "2026-01-02 14:00:00",
      "trigger": "date[2026-01-02 14:00:00]"
    }
  ]
}
```

#### Manually Trigger Reminder
```http
POST /api/reminders/debug/trigger/{id}

Response: 200 OK
{
  "status": "triggered",
  "reminder_id": 1,
  "message": "Check logs for call status"
}
```

Use this to test call workflow immediately without waiting.

---

## 🕐 Scheduler Architecture

### APScheduler Overview

The backend uses APScheduler with SQLAlchemy job store for persistent scheduling.

**Key Features:**
- Jobs persist across server restarts
- Automatic reload of pending jobs on startup
- Status tracking (scheduled → completed/failed)
- Error handling with user-friendly messages

### How It Works

#### 1. Reminder Created
```python
# In routes/reminders.py
db_reminder = Reminder(...)
db.add(db_reminder)
db.commit()

# Schedule the job
schedule_reminder(db_reminder.id, db_reminder.scheduled_time)
```

#### 2. Job Scheduled
```python
# In scheduler.py
scheduler.add_job(
    trigger_reminder,           # Function to call
    trigger=DateTrigger(run_date=scheduled_time),
    args=[reminder_id],
    id=f"reminder-{reminder_id}",
    replace_existing=True
)
```

#### 3. Job Triggers
```python
def trigger_reminder(reminder_id: int):
    # Fetch reminder from DB
    reminder = db.query(Reminder).get(reminder_id)
    
    # Make Twilio call
    call_sid = make_call(
        phone_number=reminder.phone_number,
        message=reminder.message
    )
    
    # Update status
    if call_sid:
        reminder.status = "completed"
        reminder.call_sid = call_sid
    else:
        reminder.status = "failed"
        reminder.error_message = "Call failed"
    
    db.commit()
```

#### 4. Server Restart
```python
# On app startup
def reload_scheduled_jobs():
    # Get all scheduled reminders
    pending = db.query(Reminder).filter(
        Reminder.status == "scheduled"
    ).all()
    
    # Re-add jobs to scheduler
    for reminder in pending:
        if reminder.scheduled_time > now:
            schedule_reminder(reminder.id, reminder.scheduled_time)
```

---

## 📞 Twilio Integration

### Setup

1. **Get Twilio Credentials**
   - Account SID
   - Auth Token
   - Phone Number

2. **Verify Test Numbers** (Free Trial)
   ```
   Console → Phone Numbers → Verified Caller IDs → Add Number
   ```

3. **Configure .env**
   ```env
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### Call Workflow

```python
def make_call(phone_number: str, message: str) -> str:
    """
    Make a phone call using Twilio and speak the message.
    
    Args:
        phone_number: E.164 format (+14155552671)
        message: Text to speak
        
    Returns:
        call_sid: Twilio call ID if successful, None if failed
    """
    
    # Generate TwiML for text-to-speech
    twiml = f"""
    <?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Say voice="alice" language="en-US">{message}</Say>
    </Response>
    """
    
    # Make the call
    call = client.calls.create(
        to=phone_number,
        from_=TWILIO_PHONE_NUMBER,
        twiml=twiml
    )
    
    return call.sid
```

### Error Handling

The system provides user-friendly error messages for common issues:

| Error | User Message |
|-------|-------------|
| Unverified number | "Phone number not verified. Please verify in Twilio console." |
| Invalid format | "Invalid phone number format. Please check and try again." |
| Insufficient credits | "Insufficient account credits. Please add funds." |
| Network error | "Network error. Please try again later." |
| Generic | "Call failed due to technical issue. Please try again." |

---

## 🔄 Status Flow

```
Created → scheduled
           ↓
    [Scheduler triggers]
           ↓
      Make call
           ↓
    ┌──────┴──────┐
    ↓             ↓
completed      failed
(with call_sid) (with error_message)
```

### Status Descriptions

- **scheduled**: Waiting for trigger time
- **completed**: Call successful, message delivered
- **failed**: Call failed, see error_message

---

## 🧪 Testing

### Manual Testing

#### 1. Test Create + Schedule
```bash
curl -X POST http://localhost:8000/api/reminders/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Reminder",
    "message": "This is a test message that will be spoken during the call",
    "phone_number": "+14155552671",
    "scheduled_time": "2026-01-01T22:30:00",
    "timezone": "America/New_York"
  }'
```

#### 2. Check Scheduled Jobs
```bash
curl http://localhost:8000/api/reminders/debug/jobs
```

#### 3. Manually Trigger (Test Call)
```bash
curl -X POST http://localhost:8000/api/reminders/debug/trigger/1
```

#### 4. Check Status Updated
```bash
curl http://localhost:8000/api/reminders/1
```

### Testing Without Twilio

Create a mock client for testing without making real calls:

**File:** `app/twilio_client_mock.py`
```python
def make_call(phone_number: str, message: str) -> str:
    """Mock Twilio call - for testing"""
    import time
    time.sleep(0.5)  # Simulate API call
    
    print(f"[MOCK] Would call {phone_number}")
    print(f"[MOCK] Message: {message}")
    
    return f"MOCK_{phone_number}_{int(time.time())}"
```

Replace import in `scheduler.py`:
```python
# from app.twilio_client import make_call
from app.twilio_client_mock import make_call
```

---

## 🐛 Troubleshooting

### Common Issues

#### Database locked error
```
Solution: Close any DB browser connections
rm reminders.db scheduler_jobs.db
Restart server (will recreate DBs)
```

#### Twilio authentication failed
```
Check: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env
Verify: Credentials are correct in Twilio console
Ensure: No extra spaces or quotes in .env
```

#### Call to unverified number fails
```
Solution: Go to Twilio Console → Verified Caller IDs
Add and verify the phone number you want to test with
Wait for verification code via call/SMS
```

## 📚 Additional Resources

### FastAPI
- [Documentation](https://fastapi.tiangolo.com)
- [Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [Advanced User Guide](https://fastapi.tiangolo.com/advanced/)

### SQLAlchemy
- [Documentation](https://docs.sqlalchemy.org)
- [ORM Tutorial](https://docs.sqlalchemy.org/en/20/tutorial/)

### APScheduler
- [Documentation](https://apscheduler.readthedocs.io)
- [User Guide](https://apscheduler.readthedocs.io/en/3.x/userguide.html)

### Twilio
- [API Reference](https://www.twilio.com/docs/voice/api)
- [TwiML Reference](https://www.twilio.com/docs/voice/twiml)
- [Python SDK](https://www.twilio.com/docs/libraries/python)

---
