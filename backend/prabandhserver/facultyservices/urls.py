from django.urls import path
from .views import EventTypeListView, EventSubTypeListView, EventTypeSubtypeListView, delete_event_type, delete_event_subtype, EventsDetailsCreateView, EventsDetailsListView, VCEventsListView, VCEventApprovalView, VCOfficeDashboardView, VCEventDetailView, EventFileUploadView, test_send_email

urlpatterns = [
    path('event-types/', EventTypeListView.as_view(), name='event-type-list'),
    path('event-subtypes/', EventSubTypeListView.as_view(), name='event-subtype-list'),
    path('event-type-subtype-list/', EventTypeSubtypeListView.as_view(), name='event-type-subtype-list'),
    path('event-types/<int:event_type_id>/delete/', delete_event_type, name='delete-event-type'),
    path('event-subtypes/<int:event_subtype_id>/delete/', delete_event_subtype, name='delete-event-subtype'),
    path('events/', EventsDetailsCreateView.as_view(), name='events-details-create'),
    path('events/list/', EventsDetailsListView.as_view(), name='events-details-list'),
    path('vc/events/', VCEventsListView.as_view(), name='vc-events-list'),
    path('vc/events/<int:pk>/approve/', VCEventApprovalView.as_view(), name='vc-event-approve'),
    path('vc-office/dashboard/', VCOfficeDashboardView.as_view(), name='vc-office-dashboard'),
    path('vc/events/<int:pk>/', VCEventDetailView.as_view(), name='vc-event-detail'),
    path('events/<int:event_id>/upload-file/', EventFileUploadView.as_view(), name='event-upload-file'),
    path('test-send-email/', test_send_email, name='test-send-email'),
] 