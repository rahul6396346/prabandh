from django.urls import path
from .views import HODSummaryView

urlpatterns = [
    path('summary/', HODSummaryView.as_view(), name='hod-summary'),
] 