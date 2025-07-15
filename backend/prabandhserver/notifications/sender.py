from firebase_admin import messaging
from leave_management.models import FCMToken

# Ensure Firebase is initialized
import notifications.firebase_config


def send_push_notifications(user, title, body):
    try:
        fcmtoken = (
            FCMToken.objects
            .filter(user=user, token__isnull=False)
            .exclude(token='')
            .first()
        )
        if not fcmtoken:
            print(f"No FCM token found for user {user.id}")
            return

        token = fcmtoken.token
        print(f"Using token: {token}")

        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            token=token,
        )
        response = messaging.send(message)
        print(f"Push notification sent: {response}")
    except Exception as e:
        print(f"Push Failed: {e}")
