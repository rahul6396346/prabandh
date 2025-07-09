from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q, Value
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.generics import ListAPIView
from deputy_registrar.models import School

from .serializers import FacultySerializer, RegisterSerializer, LoginSerializer, FacultyDocumentSerializer
from .models import Faculty, FacultyDocument

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        refresh = RefreshToken.for_user(user)
        return Response({
            'token': token.key,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': FacultySerializer(user).data,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors, 'message': 'Login failed'}, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.validated_data['user']
        login(request, user)
        token, _ = Token.objects.get_or_create(user=user)
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'token': token.key,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': FacultySerializer(user).data,
            'emptype': user.emptype,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            request.user.auth_token.delete()
            logout(request)
        return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)


class UserView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FacultySerializer

    def get_object(self):
        return self.request.user


class CheckAuthView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response({'isAuthenticated': True, 'user': FacultySerializer(request.user).data}, status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFTokenView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        return Response({'success': 'CSRF cookie set'}, status=status.HTTP_200_OK)


# New class to fetch users by emptype
class UsersByEmptypeView(generics.ListAPIView):
    serializer_class = FacultySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get the emptypes from the query parameters
        emptypes = self.request.query_params.getlist('emptype')
        
        if not emptypes:
            return Faculty.objects.none()  # Return empty queryset if no emptypes provided
            
        # Filter users by the provided emptypes
        queryset = Faculty.objects.filter(emptype__in=emptypes)
        
        # Optionally exclude the current user
        exclude_self = self.request.query_params.get('exclude_self', 'false').lower() == 'true'
        if exclude_self:
            queryset = queryset.exclude(id=self.request.user.id)
            
        return queryset.order_by('name')  # Order by name for better UX


# New API view to get all unique emptypes
class EmptypesView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Get all unique emptypes from the database that have at least one user
        emptypes = Faculty.objects.exclude(emptype='').values_list('emptype', flat=True).distinct()
        
        # Convert QuerySet to list
        emptypes_list = list(emptypes)
        
        # Group users by emptype
        emptype_users = {}
        for emptype in emptypes_list:
            users = Faculty.objects.filter(emptype=emptype).values('id', 'name', 'registration_no', 'department')
            emptype_users[emptype] = list(users)
        
        return Response({
            "emptypes": emptypes_list,
            "users_by_emptype": emptype_users
        })


class IsHRUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.emptype == 'hr'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unique_departments(request):
    """
    Returns a list of unique departments from the Faculty model.
    """
    departments = Faculty.objects.exclude(department='').values_list('department', flat=True).distinct()
    return Response({'departments': list(departments)})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def faculty_by_department(request):
    """
    Returns a list of faculty for a given department.
    Query param: department=<department_name>
    """
    department = request.query_params.get('department', None)
    if not department:
        return Response({'error': 'Department parameter is required.'}, status=400)
    faculty = Faculty.objects.filter(department=department).values('id', 'name', 'registration_no', 'designation', 'primary_email')
    return Response({'faculty': list(faculty)})


class ProfileImageUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request, *args, **kwargs):
        faculty = request.user
        image = request.FILES.get('profile_image')
        if not image:
            return Response({'error': 'No image provided.'}, status=400)
        if image.size > 5 * 1024 * 1024:
            return Response({'error': 'Image size exceeds 5MB.'}, status=400)
        faculty.profile_image = image
        faculty.save()
        return Response(FacultySerializer(faculty, context={'request': request}).data)


class FacultyDocumentUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, id, *args, **kwargs):
        faculty = Faculty.objects.get(id=id)
        document_type = request.data.get('document_type')
        file = request.FILES.get('file')
        if not document_type or not file:
            return Response({'error': 'document_type and file are required.'}, status=400)
        if file.size > 5 * 1024 * 1024:
            return Response({'error': 'File size exceeds 5MB.'}, status=400)
        # Only allow certain file types
        allowed_types = ['application/pdf', 'image/jpeg', 'image/png']
        if file.content_type not in allowed_types:
            return Response({'error': 'Invalid file type.'}, status=400)
        # Replace existing document of same type for this faculty
        FacultyDocument.objects.filter(faculty=faculty, document_type=document_type).delete()
        doc = FacultyDocument.objects.create(faculty=faculty, document_type=document_type, file=file)
        return Response(FacultyDocumentSerializer(doc, context={'request': request}).data, status=201)


class FacultyDocumentListView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FacultyDocumentSerializer

    def get_queryset(self):
        faculty_id = self.kwargs['id']
        return FacultyDocument.objects.filter(faculty_id=faculty_id)


class HRFacultyListView(APIView):
    permission_classes = [IsHRUser]

    def get(self, request):
        faculty_qs = Faculty.objects.all().select_related('school')
        data = []
        for faculty in faculty_qs:
            data.append({
                "id": faculty.id,
                "full_name": faculty.name,
                "email": faculty.primary_email,
                "employee_type": faculty.emptype,
                "school": faculty.school.name if faculty.school else "",
                "department": faculty.department or ""
            })
        return Response(data)


class HRFacultyDetailView(APIView):
    permission_classes = [IsHRUser]

    def get(self, request, id):
        try:
            faculty = Faculty.objects.get(id=id)
        except Faculty.DoesNotExist:
            return Response({'error': 'Faculty not found.'}, status=404)
        return Response(FacultySerializer(faculty, context={'request': request}).data)

    def patch(self, request, id):
        try:
            faculty = Faculty.objects.get(id=id)
        except Faculty.DoesNotExist:
            return Response({'error': 'Faculty not found.'}, status=404)
        # Only allow updating is_staff
        is_staff = request.data.get('is_staff', None)
        if is_staff is not None:
            faculty.is_staff = bool(is_staff)
            faculty.save()
        return Response(FacultySerializer(faculty, context={'request': request}).data)

class HRFacultyDocumentsView(APIView):
    permission_classes = [IsHRUser]

    def get(self, request, id):
        docs = FacultyDocument.objects.filter(faculty_id=id)
        serializer = FacultyDocumentSerializer(docs, many=True, context={'request': request})
        return Response(serializer.data)
