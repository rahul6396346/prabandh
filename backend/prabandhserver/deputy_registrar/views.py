from rest_framework import viewsets, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .serializers import ProgrammeSerializer, SchoolSerializer,SchemeSerializer, SubjectWithSchemeSerializer, SubjectSerializer, DepartmentSerializer
from rest_framework.decorators import action
from .models import Programme, Subject, Scheme,School, Department


class IsDRUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.emptype == 'deputy_registrar' 
    

class ProgrammeViewSet(viewsets.ModelViewSet):
    serializer_class = ProgrammeSerializer


    def get_permissions(self):
        if self.action in ['create']:
            return [IsDRUser()]
        elif self.action in ['years_by_course', 'course_by_school']:
            return [IsAuthenticated()]  # [IsAuthenticated()] if you want only logged-in users
        return super().get_permissions()

    def get_queryset(self):
        queryset = Programme.objects.all()
        
        # Filter by school if provided
        school_id = self.request.query_params.get('school', None)
        if school_id:
            queryset = queryset.filter(school_id=school_id)
            
        # Filter by education level if provided
        education_level = self.request.query_params.get('education_level', None)
        if education_level:
            queryset = queryset.filter(education_level=education_level)
            
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(course__icontains=search) |
                Q(branch__icontains=search) |
                Q(academic_year__icontains=search)
            )
        return queryset


    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Additional validation if needed
            if not School.objects.filter(id=request.data.get('school')).exists():
                return Response(
                    {'school': 'Invalid school ID'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='courses-by-school')
    def courses_by_school(self, request):
        school_id = request.query_params.get('school')
        if not school_id:
            return Response({'error': 'school parameter is required'}, status=400)
        courses = Programme.objects.filter(school_id=school_id).values_list('course', flat=True).distinct()
        return Response(sorted([c for c in courses if c]))

    @action(detail=False, methods=['get'], url_path='years-by-course')
    def years_by_course(self, request):
        school_id = request.query_params.get('school')
        course = request.query_params.get('course')
        if not school_id or not course:
            return Response({'error': 'school and course parameters are required'}, status=400)
        years = Programme.objects.filter(school_id=school_id, course=course).values_list('academic_year', flat=True).distinct()
        return Response(sorted([y for y in years if y]))


class SchoolViewSet(viewsets.ModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        # Only deputy_registrar can create/update/delete
        return [IsDRUser()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsDRUser()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectWithSchemeSerializer
    
    def get_queryset(self):
        queryset = Subject.objects.prefetch_related('schemes').all()
        programme_id = self.request.query_params.get('programme')
        search = self.request.query_params.get('search')
        subject_type = self.request.query_params.get('subject_type')
        
        if programme_id:
            queryset = queryset.filter(programme_id=programme_id)
        if search:
            queryset = queryset.filter(
                Q(subject_name__icontains=search) |
                Q(subject_code__icontains=search)
            )
        if subject_type:
            queryset = queryset.filter(subject_type=subject_type)
            
        return queryset

    def get_serializer_class(self):
        if self.action == 'create':
            return SubjectSerializer
        return SubjectWithSchemeSerializer

class SchemeViewSet(viewsets.ModelViewSet):
    queryset = Scheme.objects.all()
    serializer_class = SchemeSerializer
    
    def get_queryset(self):
        queryset = Scheme.objects.select_related('subject').all()
        subject_id = self.request.query_params.get('subject')
        programme_id = self.request.query_params.get('programme')
        
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        if programme_id:
            queryset = queryset.filter(subject__programme_id=programme_id)
            
        return queryset