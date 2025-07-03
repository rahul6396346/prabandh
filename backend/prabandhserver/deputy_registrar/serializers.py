from rest_framework import serializers
from deputy_registrar.models import School,  Programme, Department
from .models import Subject, Scheme

class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ['id', 'name']
        read_only_fields = ['id']

class DepartmentSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)
    class Meta:
        model = Department
        fields = ['id', 'name', 'school', 'school_name']
        read_only_fields = ['id', 'school_name']

class DepartmentMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'school']

class ProgrammeSerializer(serializers.ModelSerializer):
    school_details = SchoolSerializer(source='school', read_only=True)
    department_details = DepartmentMiniSerializer(source='department', read_only=True)
    
    class Meta:
        model = Programme
        fields = [
            'id', 
            'academic_year', 
            'course', 
            'branch', 
            'semester', 
            'school',
            'school_details',
            'department',
            'department_details',
            'type', 
            'system_type', 
            'education_level', 
            'regulatory_bodies', 
            'nep_non_nep', 
            'naac_non_naac',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'school_details', 'department_details']

    def validate(self, data):
        # Add additional validation if needed
        for field in ['academic_year', 'course', 'branch', 'semester']:
            if not data.get(field, '').strip():
                raise serializers.ValidationError({field: f"{field.replace('_', ' ').title()} cannot be empty"})
        return data
    


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'subject_name', 'subject_code', 'subject_type', 'programme']

class SchemeSerializer(serializers.ModelSerializer):
    subject_details = SubjectSerializer(source='subject', read_only=True)

    progressive = serializers.IntegerField(required=False, default=0)  # <--- This line ensures fallback to 0

    class Meta:
        model = Scheme
        fields = ['id', 'subject', 'subject_details', 'midterm1', 'midterm2', 
                 'class_participation', 'total_credits', 'endterm_theory', 
                 'endterm_practical', 'internal_viva', 'progressive', 
                 'total_practical_credits', 'total_tutorial_credits', 
                 'updated_by', 'is_new', 'introduction_year']
    
    def perform_create(self, serializer):
        if 'progressive' not in self.request.data:
            serializer.save(progressive=0)
        else:
            serializer.save()


class SubjectWithSchemeSerializer(serializers.ModelSerializer):
    schemes = SchemeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Subject
        fields = ['id', 'subject_name', 'subject_code', 'subject_type', 'programme', 'schemes']