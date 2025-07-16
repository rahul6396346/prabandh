from rest_framework import serializers
from .models import LeaveApplication, ClassAdjustment, LeaveBalance
from authentication.serializers import FacultySerializer

class ClassAdjustmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassAdjustment
        fields = ['id', 'course', 'branch', 'semester', 'subject', 'class_timing', 'concerned_teacher']

class LeaveApplicationSerializer(serializers.ModelSerializer):
    faculty_details = FacultySerializer(source='faculty', read_only=True)
    class_adjustments = ClassAdjustmentSerializer(many=True, required=False)
    
    class Meta:
        model = LeaveApplication
        fields = [
            'id', 'faculty', 'faculty_details', 'leave_type', 'from_date', 'to_date', 
            'no_of_days', 'reason', 'contact_during_leave', 'address_during_leave', 
            'forward_to', 'supporting_document', 'status', 'applied_on', 
            'updated_on', 'remarks', 'class_adjustments'
        ]
        read_only_fields = ['id', 'faculty_details', 'applied_on', 'updated_on', 'status']
    
    def create(self, validated_data):
        class_adjustments_data = validated_data.pop('class_adjustments', [])
        leave_application = LeaveApplication.objects.create(**validated_data)
        
        for adjustment_data in class_adjustments_data:
            ClassAdjustment.objects.create(leave_application=leave_application, **adjustment_data)
        
        return leave_application
    
    def update(self, instance, validated_data):
        class_adjustments_data = validated_data.pop('class_adjustments', [])
        
        # Update leave application fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle class adjustments
        if class_adjustments_data:
            # Delete existing adjustments
            instance.class_adjustments.all().delete()
            
            # Create new adjustments
            for adjustment_data in class_adjustments_data:
                ClassAdjustment.objects.create(leave_application=instance, **adjustment_data)
        
        return instance

class LeaveBalanceSerializer(serializers.ModelSerializer):
    casual_remaining = serializers.SerializerMethodField()
    medical_remaining = serializers.SerializerMethodField()
    compensatory_remaining = serializers.SerializerMethodField()
    semester_remaining = serializers.SerializerMethodField()
    hpl_remaining = serializers.SerializerMethodField()
    maternity_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = LeaveBalance
        fields = [
            'id', 'faculty', 
            'casual_leave', 'casual_leave_used', 'casual_remaining',
            'medical_leave', 'medical_leave_used', 'medical_remaining',
            'compensatory_leave', 'compensatory_leave_used', 'compensatory_remaining',
            'academic_leave', 'academic_leave_used', 'semester_remaining',
            'hpl', 'hpl_used', 'hpl_remaining',
            'vacation_leave', 'vacation_leave_used', 'maternity_remaining',
            'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']
    
    def get_casual_remaining(self, obj):
        return obj.casual_leave - obj.casual_leave_used
    
    def get_medical_remaining(self, obj):
        return obj.medical_leave - obj.medical_leave_used
    
    def get_compensatory_remaining(self, obj):
        return obj.compensatory_leave - obj.compensatory_leave_used
    
    def get_semester_remaining(self, obj):
        return obj.academic_leave - obj.academic_leave_used
    
    def get_hpl_remaining(self, obj):
        return obj.hpl - obj.hpl_used
    
    def get_maternity_remaining(self, obj):
        return obj.vacation_leave - obj.vacation_leave_used