from django.shortcuts import render
from rest_framework import generics
from .models import EventType, EventSubType, EventsDetails
from .serializers import EventTypeSerializer, EventSubTypeSerializer, EventsDetailsSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from django.db import models
from rest_framework.generics import ListAPIView, UpdateAPIView, RetrieveAPIView
from rest_framework.decorators import action
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import MultiPartParser, FormParser
from .utils import send_event_notification_email
from authentication.models import Faculty
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from authentication.views import HRFacultyListView

# Create your views here.

class EventTypeListView(generics.ListCreateAPIView):
    queryset = EventType.objects.all()
    serializer_class = EventTypeSerializer
    permission_classes = [IsAuthenticated]

class EventSubTypeListView(generics.ListCreateAPIView):
    serializer_class = EventSubTypeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        event_type_id = self.request.query_params.get('event_type')
        if event_type_id:
            return EventSubType.objects.filter(event_type_id=event_type_id)
        return EventSubType.objects.none()

class EventTypeSubtypeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        event_types = EventType.objects.all()
        event_subtypes = EventSubType.objects.all()

        data = {
            "event_types": [
                {"id": et.id, "type": et.type} for et in event_types
            ],
            "event_subtypes": [
                {"id": es.id, "name": es.name, "event_type": es.event_type.id} for es in event_subtypes
            ]
        }

        return Response(data)
    
    def post(self, request):
        """
        Handle creation of EventType or EventSubType based on the request data.
        Expecting:
        {
            "event_type": "Academics"               # For new event type
        }
        OR
        {
            "event_type_id": 1,
            "event_subtype": "Freshers"             # For new subtype
        }
        """
        event_type_name = request.data.get("event_type")
        event_subtype_name = request.data.get("event_subtype")
        event_type_id = request.data.get("event_type_id")

          # Create new EventType
        if event_type_name:
            if EventType.objects.filter(type__iexact=event_type_name).exists():
                return Response({"detail": "Event type already exists."}, status=status.HTTP_400_BAD_REQUEST)
            event_type = EventType.objects.create(type=event_type_name)
            return Response({"message": "Event type created successfully", "id": event_type.id}, status=201)

        # Create new EventSubType
        if event_type_id and event_subtype_name:
            try:
                event_type = EventType.objects.get(id=event_type_id)
            except EventType.DoesNotExist:
                return Response({"detail": "Invalid event type ID"}, status=400)

            if EventSubType.objects.filter(name__iexact=event_subtype_name, event_type=event_type).exists():
                return Response({"detail": "Subtype already exists under this type."}, status=400)

            subtype = EventSubType.objects.create(name=event_subtype_name, event_type=event_type)
            return Response({"message": "Event subtype created successfully", "id": subtype.id}, status=201)

        return Response({"detail": "Invalid data provided."}, status=400)

@api_view(['DELETE'])
def delete_event_type(request, event_type_id):
    try:
        event_type = EventType.objects.get(id=event_type_id)
        event_type.delete()
        return Response({"message": "Event type deleted successfully."}, status=status.HTTP_200_OK)
    except EventType.DoesNotExist:
        return Response({"error": "Event type not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
def delete_event_subtype(request, event_subtype_id):
    try:
        event_subtype = EventSubType.objects.get(id=event_subtype_id)
        event_subtype.delete()
        return Response({"message": "Event subtype deleted successfully."}, status=status.HTTP_200_OK)
    except EventSubType.DoesNotExist:
        return Response({"error": "Event subtype not found."}, status=status.HTTP_404_NOT_FOUND)

class EventsDetailsCreateView(generics.CreateAPIView):
    queryset = EventsDetails.objects.all()
    serializer_class = EventsDetailsSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        faculty_name = getattr(user, 'name', None)
        if not faculty_name:
            faculty_name = str(user)
        event = serializer.save(upload_by=faculty_name)
        # Notify VC and VC Office by email
        vc_users = Faculty.objects.filter(emptype__in=['vc', 'vc_office'])
        for vc in vc_users:
            send_event_notification_email(
                vc.primary_email,
                f"New Event Submission: {event.event_name}",
                f"A new event '{event.event_name}' has been submitted by {faculty_name}."
            )

class EventsDetailsListView(generics.ListAPIView):
    serializer_class = EventsDetailsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        faculty_name = getattr(user, 'name', None)
        email = getattr(user, 'primary_email', None)

        # Fallback to user string if name is not available
        if not faculty_name:
            faculty_name = str(user)

        # Filter by name or email
        return EventsDetails.objects.filter(
            models.Q(upload_by=faculty_name) |
            models.Q(upload_by=email)
        ).order_by('-id')

class VCEventsListView(ListAPIView):
    serializer_class = EventsDetailsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Show all events for VC panel
        return EventsDetails.objects.all().order_by('-id')

class VCEventApprovalView(UpdateAPIView):
    queryset = EventsDetails.objects.all()
    serializer_class = EventsDetailsSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def patch(self, request, *args, **kwargs):
        event = self.get_object()
        status_value = request.data.get('vcapproval_status')
        if status_value not in ['Approved', 'Rejected', 'Pending']:
            return Response({'error': 'Invalid status'}, status=400)
        event.vcapproval_status = status_value
        event.save()
        # Notify faculty on approval
        if status_value == 'Approved':
            faculty = Faculty.objects.filter(name=event.upload_by).first()
            if faculty:
                send_event_notification_email(
                    faculty.primary_email,
                    f"Your event '{event.event_name}' has been approved by the Vice Chancellor.",
                    f"Congratulations! Your event '{event.event_name}' has been approved."
                )
        return Response(self.get_serializer(event).data)

class VCOfficeDashboardView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if getattr(user, 'emptype', '').lower() not in ["vc_office", "vcoffice"]:
            return Response({"detail": "Forbidden"}, status=403)
        return Response({
            "profile": {
                "name": getattr(user, "name", "VC Office User"),
                "id": getattr(user, "registration_no", "N/A"),
                "position": "VC Office",
                "department": getattr(user, "department", "N/A"),
                "since": "2022-01-01"
            },
            "stats": {
                "notices_sent": 12,
                "pending_files": 4,
                "faculty_reviewed": 8,
                "circulars_uploaded": 5,
                "leave_requests": 2
            }
        })

class VCEventDetailView(RetrieveAPIView):
    queryset = EventsDetails.objects.all()
    serializer_class = EventsDetailsSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if getattr(user, 'emptype', '').lower() not in ["vc_office", "vcoffice"]:
            return Response({"detail": "Forbidden"}, status=403)
        return super().get(request, *args, **kwargs)

class EventFileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):
        file_type = request.data.get('file_type')
        file = request.FILES.get('file')
        if not file_type or not file:
            return Response({'detail': 'file_type and file are required.'}, status=status.HTTP_400_BAD_REQUEST)
        event = EventsDetails.objects.get(id=event_id)
        allowed_fields = [
            'proposal_file', 'vcapproval_file', 'creatives', 'attendance_file', 'report_file',
            'geotagpics_file1', 'geotagpics_file2', 'geotagpics_file3', 'news_social_media', 'news_print_media'
        ]
        if file_type not in allowed_fields:
            return Response({'detail': 'Invalid file_type.'}, status=status.HTTP_400_BAD_REQUEST)
        setattr(event, file_type, file)
        event.save()
        return Response({'detail': f'{file_type} uploaded successfully.'}, status=status.HTTP_200_OK)

@csrf_exempt
def test_send_email(request):
    if request.method == 'POST':
        to_email = request.POST.get('to_email', 'ziyakhanitm@gmail.com')
        subject = request.POST.get('subject', 'SMTP Test Email')
        body = request.POST.get('body', 'This is a test email from Django SMTP setup.')
        try:
            send_event_notification_email(to_email, subject, body)
            return JsonResponse({'success': True, 'message': 'Email sent successfully.'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'POST only'}) 