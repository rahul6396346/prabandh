from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeaveApplicationViewSet, LeaveBalanceViewSet

router = DefaultRouter()
router.register(r'applications', LeaveApplicationViewSet, basename='leave-application')
router.register(r'balances', LeaveBalanceViewSet, basename='leave-balance')

urlpatterns = [
    path('', include(router.urls)),
]