from django.urls import path
from .views_notifications import save_fcm_token

urlpatterns = [
    path('save-fcm-token/', save_fcm_token)
]
