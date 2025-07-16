from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

# Create your views here.

class HODSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Mock summary data
        data = {
            'total_faculty': 25,
            'pending_approvals': 3,
            'upcoming_meetings': 2,
            'recent_notices': [],
            'faculty_attendance': None,
        }
        return Response(data)
