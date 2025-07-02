from django.conf import settings
from django.core.mail import send_mail

def send_event_notification_email(to_email, subject, message):
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [to_email],
            fail_silently=False,
        )
        print(f"✅ Email sent to {to_email}")
    except Exception as e:
        print(f"🚨 Email send failed: {e}")
