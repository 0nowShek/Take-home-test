"""
Twilio integration for making phone calls.
Uses Twilio's API to call a phone number and speak a message using TTS.
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Twilio credentials (set these in .env)
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")


def make_call(phone_number: str, message: str) -> str:
    """
    Make a phone call using Twilio and speak the message.
    
    Args:
        phone_number: E.164 formatted phone number (e.g., +14155552671)
        message: Text message to speak during the call
        
    Returns:
        call_sid: Twilio call SID if successful, None if failed
    """
    
    # Check if Twilio is configured
    if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER]):
        print("⚠️ Twilio not configured - skipping call")
        print(f"   Would have called: {phone_number}")
        print(f"   Message: {message}")
        return None
    
    try:
        from twilio.rest import Client
        
        # Initialize Twilio client
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        # Create TwiML for text-to-speech
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
        
        print(f"✅ Call initiated: {call.sid}")
        print(f"   To: {phone_number}")
        print(f"   Status: {call.status}")
        
        return call.sid
        
    except ImportError:
        print("❌ Twilio library not installed")
        print("   Install with: pip install twilio")
        return None
        
    except Exception as e:
        print(f"❌ Error making call: {e}")
        return None


def get_call_status(call_sid: str) -> str:
    """
    Get the status of a Twilio call.
    
    Args:
        call_sid: Twilio call SID
        
    Returns:
        Status string (queued, ringing, in-progress, completed, failed, etc.)
    """
    
    if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN]):
        return "no-twilio"
    
    try:
        from twilio.rest import Client
        
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        call = client.calls(call_sid).fetch()
        
        return call.status
        
    except Exception as e:
        print(f"❌ Error fetching call status: {e}")
        return "error"