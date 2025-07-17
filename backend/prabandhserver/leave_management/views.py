from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
import json
import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.permissions import IsAuthenticated  # Fix import for IsAuthenticated

from .models import LeaveApplication, ClassAdjustment, LeaveBalance
from .serializers import LeaveApplicationSerializer, ClassAdjustmentSerializer, LeaveBalanceSerializer
from authentication.models import Faculty
from notifications.sender import send_push_notifications
import holidays

# Create a custom permission class for HR users
class IsHRUser(permissions.BasePermission):
    """
    Custom permission to only allow HR users to access certain endpoints.
    """
    def has_permission(self, request, view):
        # Log the user type for debugging
        logger = logging.getLogger('leave_management')
        user_type = getattr(request.user, 'emptype', 'unknown')
        logger.debug(f"Permission check for user {request.user.id}, type: {user_type}")
        
        # Check if user has HR role (emptype)
        return request.user.is_authenticated and getattr(request.user, 'emptype', '') == 'hr'

# Create a custom permission class for HOD users
class IsHODUser(permissions.BasePermission):
    """
    Custom permission to only allow HOD users to access certain endpoints.
    """
    def has_permission(self, request, view):
        # Log the user type for debugging
        logger = logging.getLogger('leave_management')
        user_type = getattr(request.user, 'emptype', 'unknown')
        logger.debug(f"HOD Permission check for user {request.user.id}, type: {user_type}")
        
        # Check if user has HOD role (emptype)
        return request.user.is_authenticated and getattr(request.user, 'emptype', '').lower() in ['hod', 'head of department']

# Create a custom permission class for Dean users
class IsDeanUser(permissions.BasePermission):
    """
    Custom permission to only allow Dean users to access certain endpoints.
    """
    def has_permission(self, request, view):
        # Log the user type for debugging
        logger = logging.getLogger('leave_management')
        user_type = getattr(request.user, 'emptype', 'unknown')
        logger.debug(f"Dean Permission check for user {request.user.id}, type: {user_type}")
        
        # Check if user has Dean role (emptype)
        return request.user.is_authenticated and getattr(request.user, 'emptype', '').lower() in ['dean']

# Create a custom permission class for VC users
class IsVCUser(permissions.BasePermission):
    """
    Custom permission to only allow VC users to access certain endpoints.
    """
    def has_permission(self, request, view):
        # Log the user type for debugging
        logger = logging.getLogger('leave_management')
        user_type = getattr(request.user, 'emptype', 'unknown')
        logger.debug(f"VC Permission check for user {request.user.id}, type: {user_type}")
        
        # Check if user has VC role (emptype)
        return request.user.is_authenticated and getattr(request.user, 'emptype', '').lower() in ['vc', 'vice chancellor']

class LeaveApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        """
        Override to use different permission classes for different actions.
        """
        if self.action in ['hr_approve', 'hr_reject']:
            # For HR actions, add IsHRUser permission
            logger = logging.getLogger('leave_management')
            logger.debug(f"Using HR permissions for action: {self.action}")
            return [permissions.IsAuthenticated(), IsHRUser()]
        elif self.action in ['hod_approve', 'hod_reject', 'hod_recommend_to_dean', 'hod_recommend_to_vc']:
            # For HOD actions, add IsHODUser permission
            logger = logging.getLogger('leave_management')
            logger.debug(f"Using HOD permissions for action: {self.action}")
            return [permissions.IsAuthenticated(), IsHODUser()]
        elif self.action in ['dean_approve', 'dean_reject', 'dean_recommend_to_vc']:
            # For Dean actions, add IsDeanUser permission
            logger = logging.getLogger('leave_management')
            logger.debug(f"Using Dean permissions for action: {self.action}")
            return [permissions.IsAuthenticated(), IsDeanUser()]
        elif self.action in ['vc_approve', 'vc_reject']:
            # For VC actions, add IsVCUser permission
            logger = logging.getLogger('leave_management')
            logger.debug(f"Using VC permissions for action: {self.action}")
            return [permissions.IsAuthenticated(), IsVCUser()]
        return super().get_permissions()
    
    def get_queryset(self):
        # Debug logging for queryset access
        logger = logging.getLogger('leave_management')
        logger.debug(f"LeaveApplication queryset requested by user {self.request.user.id}")
        
        # Extract query parameters
        status_filter = self.request.query_params.get('status', None)
        hr_approvals = self.request.query_params.get('hr_approvals', 'false').lower() == 'true'
        hod_approvals = self.request.query_params.get('hod_approvals', 'false').lower() == 'true'
        dean_approvals = self.request.query_params.get('dean_approvals', 'false').lower() == 'true'
        vc_approvals = self.request.query_params.get('vc_approvals', 'false').lower() == 'true'
        
        # Check user roles
        is_hr = hasattr(self.request.user, 'emptype') and self.request.user.emptype == 'hr'
        is_hod = hasattr(self.request.user, 'emptype') and self.request.user.emptype.lower() in ['hod', 'head of department']
        is_dean = hasattr(self.request.user, 'emptype') and self.request.user.emptype.lower() == 'dean'
        is_vc = hasattr(self.request.user, 'emptype') and self.request.user.emptype.lower() in ['vc', 'vice chancellor']
        
        # Regular faculty user logic
        if not any([is_hr, is_hod, is_dean, is_vc]):
            # Log unauthorized access attempts
            if hr_approvals:
                logger.warning(f"Non-HR user {self.request.user.id} attempted to access HR approvals")
                return LeaveApplication.objects.filter(faculty=self.request.user).order_by('-applied_on')
            
            if hod_approvals:
                logger.warning(f"Non-HOD user {self.request.user.id} attempted to access HOD approvals")
                return LeaveApplication.objects.filter(faculty=self.request.user).order_by('-applied_on')
                
            if dean_approvals:
                logger.warning(f"Non-Dean user {self.request.user.id} attempted to access Dean approvals")
                return LeaveApplication.objects.filter(faculty=self.request.user).order_by('-applied_on')
                
            if vc_approvals:
                logger.warning(f"Non-VC user {self.request.user.id} attempted to access VC approvals")
                return LeaveApplication.objects.filter(faculty=self.request.user).order_by('-applied_on')
            
            # Regular faculty filtering by status
            if status_filter:
                if ',' in status_filter:
                    status_values = status_filter.split(',')
                    return LeaveApplication.objects.filter(
                        faculty=self.request.user,
                        status__in=status_values
                    ).order_by('-applied_on')
                else:
                    return LeaveApplication.objects.filter(
                        faculty=self.request.user,
                        status=status_filter
                    ).order_by('-applied_on')
            
            # Faculty can only see their own leave applications by default 
            return LeaveApplication.objects.filter(faculty=self.request.user).order_by('-applied_on') 
        
        # === HOD User Logic ===
        if is_hod:
            if hod_approvals:
                # HOD can ONLY see applications specifically forwarded to them by ID
                # NO department-based visibility to avoid cross-visibility
                queryset = LeaveApplication.objects.filter(
                    forward_to=str(self.request.user.id),
                    status='pending'
                ).order_by('-applied_on')
                
                # Apply status filter if provided
                if status_filter:
                    if ',' in status_filter:
                        status_values = status_filter.split(',')
                        queryset = queryset.filter(status__in=status_values)
                    else:
                        queryset = queryset.filter(status=status_filter)
                
                logger.debug(f"HOD user {self.request.user.id} accessed departmental leave applications")
                return queryset
            else:
                # HOD can see their own applications when not in approval mode
                if status_filter:
                    if ',' in status_filter:
                        status_values = status_filter.split(',')
                        return LeaveApplication.objects.filter(
                            faculty=self.request.user,
                            status__in=status_values
                        ).order_by('-applied_on')
                    else:
                        return LeaveApplication.objects.filter(
                            faculty=self.request.user,
                            status=status_filter
                        ).order_by('-applied_on')
                return LeaveApplication.objects.filter(faculty=self.request.user).order_by('-applied_on')
        
        # === Dean User Logic ===
        if is_dean:
            if dean_approvals:
                # Dean can see applications specifically forwarded to them
                queryset = LeaveApplication.objects.filter(
                    Q(status='forwarded_to_dean') |
                    Q(forward_to=str(self.request.user.id))
                ).order_by('-applied_on')
                
                # Apply status filter if provided
                if status_filter:
                    if ',' in status_filter:
                        status_values = status_filter.split(',')
                        queryset = queryset.filter(status__in=status_values)
                    else:
                        queryset = queryset.filter(status=status_filter)
                
                logger.debug(f"Dean user {self.request.user.id} accessed leave applications")
                return queryset
            else:
                # Dean can see their own applications when not in approval mode
                if status_filter:
                    if ',' in status_filter:
                        status_values = status_filter.split(',')
                        return LeaveApplication.objects.filter(
                            faculty=self.request.user,
                            status__in=status_values
                        ).order_by('-applied_on')
                    else:
                        return LeaveApplication.objects.filter(
                            faculty=self.request.user,
                            status=status_filter
                        ).order_by('-applied_on')
                return LeaveApplication.objects.filter(faculty=self.request.user).order_by('-applied_on')
        
        # === VC User Logic ===
        if is_vc:
            if vc_approvals:
                # VC can see applications specifically forwarded to them
                queryset = LeaveApplication.objects.filter(
                    Q(status='forwarded_to_vc') |
                    Q(forward_to=str(self.request.user.id))
                ).order_by('-applied_on')
                
                # Apply status filter if provided
                if status_filter:
                    if ',' in status_filter:
                        status_values = status_filter.split(',')
                        queryset = queryset.filter(status__in=status_values)
                    else:
                        queryset = queryset.filter(status=status_filter)
                
                logger.debug(f"VC user {self.request.user.id} accessed leave applications")
                return queryset
            else:
                # VC can see their own applications when not in approval mode
                if status_filter:
                    if ',' in status_filter:
                        status_values = status_filter.split(',')
                        return LeaveApplication.objects.filter(
                            faculty=self.request.user,
                            status__in=status_values
                        ).order_by('-applied_on')
                    else:
                        return LeaveApplication.objects.filter(
                            faculty=self.request.user,
                            status=status_filter
                        ).order_by('-applied_on')
                return LeaveApplication.objects.filter(faculty=self.request.user).order_by('-applied_on')
        
        # === HR User Logic ===
        if is_hr:
            if hr_approvals:
                # HR can only see applications specifically forwarded to HR
                # Either by status 'forwarded_to_hr' OR by forward_to field pointing to HR user ID
                queryset = LeaveApplication.objects.filter(
                    Q(status='forwarded_to_hr') |
                    Q(forward_to=str(self.request.user.id))
                ).order_by('-applied_on')
            else:
                # When not in approval mode, HR can see all applications for general reporting
                queryset = LeaveApplication.objects.all()
        
        # Apply status filter if provided
        if status_filter:
            if ',' in status_filter:
                status_values = status_filter.split(',')
                queryset = queryset.filter(status__in=status_values)
            else:
                queryset = queryset.filter(status=status_filter)
        
        # Log the query for debugging
        logger.debug(f"HR user {self.request.user.id} accessed leave applications with filter: {status_filter}")
        
        return queryset
    
    def perform_create(self, serializer):
        # Get the forward_to value from the request data
        forward_to = self.request.data.get('forward_to', '')
        
        # Determine initial status based on forward_to
        forward_to_lower = forward_to.lower()
        if forward_to_lower in ['hr', 'human resources']:
            # If forwarded directly to HR, set status to forwarded_to_hr
            initial_status = 'forwarded_to_hr'
        elif forward_to_lower in ['dean']:
            # If forwarded directly to Dean, set status to forwarded_to_dean
            initial_status = 'forwarded_to_dean'
        elif forward_to_lower in ['vc', 'vice chancellor', 'vice-chancellor']:
            # If forwarded directly to VC, set status to forwarded_to_vc
            initial_status = 'forwarded_to_vc'
        elif forward_to_lower in ['hod', 'head of department']:
            # If forwarded to HOD, set status to forwarded_to_hod
            initial_status = 'forwarded_to_hod'
        else:
            # For all other cases, set status to pending
            initial_status = 'pending'
        
        # Set the faculty to the current logged-in user and set initial status
        serializer.save(faculty=self.request.user, status=initial_status)
        
        # Log the leave application creation
        logger = logging.getLogger('leave_management')
        logger.info(f"Leave application created by {self.request.user.name} with status: {initial_status}, forwarded to: {forward_to}")
        
        # Log the leave application creation
        logger = logging.getLogger('leave_management')
        logger.info(f"Leave application created by {self.request.user.name} with status: {initial_status}, forwarded to: {forward_to}")
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        # Extract class adjustments from request data if present
        data = request.data.copy()
        class_adjustments_data = data.pop('class_adjustments', [])
        
        # Convert class_adjustments to a list if it's not already
        if isinstance(class_adjustments_data, str):
            try:
                class_adjustments_data = json.loads(class_adjustments_data)
            except json.JSONDecodeError:
                class_adjustments_data = []
        
        # Create serializer with the main leave application data
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # Get leave type and number of days for balance checking
        leave_type = data.get('leave_type')
        from decimal import Decimal
        no_of_days = Decimal(str(data.get('no_of_days', 0)))  # Convert to Decimal to match database field type
        
        # Get from_date and to_date from validated data
        from_date = serializer.validated_data.get('from_date')
        to_date = serializer.validated_data.get('to_date')
        
        # Check and deduct leave balance immediately upon application
        try:
            leave_balance, created = LeaveBalance.objects.get_or_create(
                faculty=request.user,
                defaults={
                    'casual_leave': 15.0,
                    'medical_leave': 12.0,
                    'compensatory_leave': 8.0,
                    'earned_leave': 15.0,
                    'semester_leave': 5.0,
                    'maternity_leave': 15.0,
                    'paternity_leave': 0.0,
                    'extraordinary_leave': 15.0,
                    'academic_leave': 5.0,
                    'half_pay_leave': 5.0,
                    'duty_leave': 15.0,
                    'hpl': 5.0,
                    'vacation_leave': 15.0,
                    'cl_slot1_total': 7.0,
                    'cl_slot1_used': 0.0,
                    'cl_slot1_lapsed': False,
                    'cl_slot2_total': 8.0,
                    'cl_slot2_used': 0.0,
                    'cl_slot2_lapsed': False
                }
            )

            # Enforce CL cannot be combined with other leave types
            if leave_type == 'casual':
                # Check if there are overlapping leave applications of other types
                overlapping = LeaveApplication.objects.filter(
                    faculty=request.user,
                    leave_type__ne='casual',
                    from_date__lte=to_date,
                    to_date__gte=from_date,
                    status__in=['pending', 'approved']
                ).exists()
                if overlapping:
                    return Response({'error': 'Casual Leave cannot be combined with other leave types.'}, status=status.HTTP_400_BAD_REQUEST)

                # Exclude holidays/Sundays from CL count
                from datetime import timedelta
                from django.utils import timezone
                import holidays
                india_holidays = holidays.India()
                cl_days = 0
                current = from_date
                while current <= to_date:
                    if current.weekday() < 5 and current not in india_holidays:
                        cl_days += 1
                    current += timedelta(days=1)
                if cl_days != no_of_days:
                    no_of_days = cl_days

                # Enforce slotting and lapse logic
                slot = leave_balance.get_cl_slot(from_date)
                if slot == 'slot1' and leave_balance.cl_slot1_lapsed:
                    return Response({'error': 'Slot 1 CL has lapsed.'}, status=status.HTTP_400_BAD_REQUEST)
                if slot == 'slot2' and leave_balance.cl_slot2_lapsed:
                    return Response({'error': 'Slot 2 CL has lapsed.'}, status=status.HTTP_400_BAD_REQUEST)
                remaining_balance = leave_balance.get_remaining_cl_in_slot(slot)
                if remaining_balance < no_of_days:
                    return Response({'error': f'Insufficient CL in {slot}. Available: {remaining_balance} days, Requested: {no_of_days} days'}, status=status.HTTP_400_BAD_REQUEST)
                leave_balance.deduct_cl_in_slot(slot, no_of_days)
            else:
                # For other leave types, use default logic
                remaining_balance = leave_balance.get_remaining_balance(leave_type)
                if remaining_balance < no_of_days:
                    return Response(
                        {
                            'error': f'Insufficient leave balance. Available: {remaining_balance} days, Requested: {no_of_days} days'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                leave_balance.deduct_leave(leave_type, no_of_days)

            logger = logging.getLogger('leave_management')
            logger.info(f"Immediately deducted {no_of_days} days of {leave_type} leave from faculty {request.user.id}")
            
        except Exception as e:
            logger = logging.getLogger('leave_management')
            logger.error(f"Error deducting leave balance: {str(e)}")
            return Response(
                {'error': 'Failed to process leave balance'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Set faculty to current user and save
        leave_application = serializer.save(faculty=request.user)

        send_push_notifications(
            leave_application.faculty,
            "Leave Application Submitted",
            "Submitted"
        )
        
        # Process the class adjustments if any
        if class_adjustments_data:
            for adjustment_data in class_adjustments_data:
                adjustment_data['leave_application'] = leave_application.id
                adjustment_serializer = ClassAdjustmentSerializer(data=adjustment_data)
                adjustment_serializer.is_valid(raise_exception=True)
                adjustment_serializer.save()
        
        # Ensure we return the updated serializer
        updated_serializer = self.get_serializer(leave_application)
        
        # Return the serialized data with status 201
        headers = self.get_success_headers(updated_serializer.data)
        return Response(updated_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=False, methods=['get'])
    def leave_balance(self, request):
        try:
            # Get leave balance for the current faculty or create if it doesn't exist
            leave_balance, created = LeaveBalance.objects.get_or_create(
                faculty=request.user,
                defaults={
                    'casual_leave': 15.0,
                    'medical_leave': 12.0,
                    'compensatory_leave': 8.0,
                    'earned_leave': 15.0,
                    'semester_leave': 5.0,
                    'maternity_leave': 15.0,
                    'paternity_leave': 0.0,
                    'extraordinary_leave': 15.0,
                    'academic_leave': 5.0,
                    'half_pay_leave': 5.0,
                    'duty_leave': 15.0,
                    'hpl': 5.0,
                    'vacation_leave': 15.0,
                    'cl_slot1_total': 7.0,
                    'cl_slot1_used': 0.0,
                    'cl_slot1_lapsed': False,
                    'cl_slot2_total': 8.0,
                    'cl_slot2_used': 0.0,
                    'cl_slot2_lapsed': False
                }
            )
            
            # Format response in the structure expected by frontend
            response_data = {
                'casual': {
                    'total': leave_balance.casual_leave,
                    'used': leave_balance.casual_leave_used,
                    'remaining': leave_balance.casual_leave - leave_balance.casual_leave_used,
                    'slot1': {
                        'total': leave_balance.cl_slot1_total,
                        'used': leave_balance.cl_slot1_used,
                        'remaining': leave_balance.cl_slot1_total - leave_balance.cl_slot1_used,
                        'lapsed': leave_balance.cl_slot1_lapsed
                    },
                    'slot2': {
                        'total': leave_balance.cl_slot2_total,
                        'used': leave_balance.cl_slot2_used,
                        'remaining': leave_balance.cl_slot2_total - leave_balance.cl_slot2_used,
                        'lapsed': leave_balance.cl_slot2_lapsed
                    }
                },
                'medical': {
                    'total': leave_balance.medical_leave,
                    'used': leave_balance.medical_leave_used,
                    'remaining': leave_balance.medical_leave - leave_balance.medical_leave_used
                },
                'compensatory': {
                    'total': leave_balance.compensatory_leave,
                    'used': leave_balance.compensatory_leave_used,
                    'remaining': leave_balance.compensatory_leave - leave_balance.compensatory_leave_used
                },
                'earned': {
                    'total': leave_balance.earned_leave,
                    'used': leave_balance.earned_leave_used,
                    'remaining': leave_balance.earned_leave - leave_balance.earned_leave_used
                },
                'semester': {
                    'total': leave_balance.semester_leave,
                    'used': leave_balance.semester_leave_used,
                    'remaining': leave_balance.semester_leave - leave_balance.semester_leave_used
                },
                'maternity': {
                    'total': leave_balance.maternity_leave,
                    'used': leave_balance.maternity_leave_used,
                    'remaining': leave_balance.maternity_leave - leave_balance.maternity_leave_used
                },
                'paternity': {
                    'total': leave_balance.paternity_leave,
                    'used': leave_balance.paternity_leave_used,
                    'remaining': leave_balance.paternity_leave - leave_balance.paternity_leave_used
                },
                'extraordinary': {
                    'total': leave_balance.extraordinary_leave,
                    'used': leave_balance.extraordinary_leave_used,
                    'remaining': leave_balance.extraordinary_leave - leave_balance.extraordinary_leave_used
                },
                'academic': {
                    'total': leave_balance.academic_leave,
                    'used': leave_balance.academic_leave_used,
                    'remaining': leave_balance.academic_leave - leave_balance.academic_leave_used
                },
                'half_pay': {
                    'total': leave_balance.half_pay_leave,
                    'used': leave_balance.half_pay_leave_used,
                    'remaining': leave_balance.half_pay_leave - leave_balance.half_pay_leave_used
                },
                'duty': {
                    'total': leave_balance.duty_leave,
                    'used': leave_balance.duty_leave_used,
                    'remaining': leave_balance.duty_leave - leave_balance.duty_leave_used
                }
            }
            
            return Response(response_data)
        except Exception as e:
            logger = logging.getLogger('leave_management')
            logger.error(f"Error retrieving leave balance: {str(e)}")
            return Response(
                {"error": "Failed to retrieve leave balance"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    @action(detail=True, methods=['post'])
    def forward_to_hr(self, request, pk=None):
        try:
            leave_application = self.get_object()
            
            # Update status to forwarded_to_hr
            leave_application.status = 'forwarded_to_hr'
            leave_application.save()

            try:
                send_push_notifications(
                    leave_application.faculty,
                    "Your Leave Application is Forwarded to HR",
                    ""
                )
            except Exception as e:
                # Log the error but still return success
                print(f"Failed to send notification: {e}")
            
            serializer = self.get_serializer(leave_application)
            return Response({
                'message': 'Leave application forwarded to HR successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
            
    # Old duplicate methods removed - using the newer implementations below
            
    @action(detail=True, methods=['post'])
    def hr_approve(self, request, pk=None):
        logger = logging.getLogger('leave_management')
        
        # Log request details for debugging
        logger.debug(f"HR approve request for application {pk}")
        logger.debug(f"User: {request.user.id}, Name: {request.user.name}, Type: {getattr(request.user, 'emptype', 'unknown')}")
        logger.debug(f"Request headers: {request.headers}")
        
        try:
            # Get the leave application object
            leave_application = self.get_object()
            logger.debug(f"Leave application retrieved: {leave_application.id}, status: {leave_application.status}")
            
            # Check if the application is in a valid state for approval
            # Accept both 'pending' and 'forwarded_to_hr' statuses for flexibility
            valid_statuses = ['pending', 'forwarded_to_hr']
            if leave_application.status not in valid_statuses:
                error_msg = f"Cannot approve application in {leave_application.status} status. Application must be in one of: {', '.join(valid_statuses)}."
                logger.warning(error_msg)
                return Response({
                    'error': error_msg
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update status to approved_by_hr
            leave_application.status = 'approved_by_hr'
            
            # Add remarks if provided
            if 'remarks' in request.data:
                leave_application.remarks = request.data['remarks']
                logger.debug(f"Added remarks: {request.data['remarks']}")
            
            # Save the changes
            leave_application.save()
            logger.info(f"Successfully approved leave application {pk}")
            
            send_push_notifications(
                leave_application.faculty,
                "Leave Application Approved",
                "Your leave application has been approved by HR."
            )

            # Return updated application data
            serializer = self.get_serializer(leave_application)
            return Response({
                'message': 'Leave application approved by HR successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log the error for debugging
            logger.error(f"Error approving leave application {pk}: {str(e)}", exc_info=True)
            
            return Response({
                'error': f'Failed to approve leave application: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    @action(detail=True, methods=['post'])
    def hr_reject(self, request, pk=None):
        logger = logging.getLogger('leave_management')
        
        # Log request details for debugging
        logger.debug(f"HR reject request for application {pk}")
        logger.debug(f"User: {request.user.id}, Name: {request.user.name}, Type: {getattr(request.user, 'emptype', 'unknown')}")
        logger.debug(f"Request headers: {request.headers}")
        
        try:
            # Get the leave application object
            leave_application = self.get_object()
            logger.debug(f"Leave application retrieved: {leave_application.id}, status: {leave_application.status}")
            
            # Check if the application is in a valid state for rejection
            # Accept both 'pending' and 'forwarded_to_hr' statuses for flexibility
            valid_statuses = ['pending', 'forwarded_to_hr']
            if leave_application.status not in valid_statuses:
                error_msg = f"Cannot reject application in {leave_application.status} status. Application must be in one of: {', '.join(valid_statuses)}."
                logger.warning(error_msg)
                return Response({
                    'error': error_msg
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update status to rejected_by_hr
            leave_application.status = 'rejected_by_hr'
            
            # Add remarks if provided
            if 'remarks' in request.data:
                leave_application.remarks = request.data['remarks']
                logger.debug(f"Added remarks: {request.data['remarks']}")
            
            # Explicitly restore leave balance (backup for signal)
            self._restore_leave_balance(leave_application)
            
            # Save the changes
            leave_application.save()
            send_push_notifications(
                leave_application.faculty,
                "Leave Application Rejected",
                "Your leave application has been rejected by HR."
            )
            logger.info(f"Successfully rejected leave application {pk}")
            
            # Return updated application data
            serializer = self.get_serializer(leave_application)
            return Response({
                'message': 'Leave application rejected by HR successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log the error for debugging
            logger.error(f"Error rejecting leave application {pk}: {str(e)}", exc_info=True)
            
            return Response({
                'error': f'Failed to reject leave application: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    @action(detail=True, methods=['post'])
    def hod_approve(self, request, pk=None):
        logger = logging.getLogger('leave_management')
        
        # Log request details for debugging
        logger.debug(f"HOD approve request for application {pk}")
        logger.debug(f"User: {request.user.id}, Name: {request.user.name}, Type: {getattr(request.user, 'emptype', 'unknown')}")
        logger.debug(f"Request headers: {request.headers}")
        
        try:
            # Get the leave application object
            leave_application = self.get_object()
            logger.debug(f"Leave application retrieved: {leave_application.id}, status: {leave_application.status}")
            
            # Check if the application is in a valid state for approval
            # Accept both 'pending' and 'forwarded_to_hod' statuses for flexibility
            valid_statuses = ['pending', 'forwarded_to_hod']
            if leave_application.status not in valid_statuses:
                error_msg = f"Cannot approve application in {leave_application.status} status. Application must be in one of: {', '.join(valid_statuses)}."
                logger.warning(error_msg)
                return Response({
                    'error': error_msg
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Determine the final status based on the forward_to field and current status
            forward_to = leave_application.forward_to.lower() if leave_application.forward_to else ""
            
            if 'hr' in forward_to or 'human resources' in forward_to:
                # If originally meant for HR, forward to HR
                leave_application.status = 'forwarded_to_hr'
                message = 'Leave application approved by HOD and forwarded to HR successfully'
            elif 'dean' in forward_to:
                # If meant for Dean, forward to Dean
                leave_application.status = 'forwarded_to_dean'
                message = 'Leave application approved by HOD and forwarded to Dean successfully'
            elif 'vc' in forward_to or 'vice chancellor' in forward_to:
                # If meant for VC, forward to VC
                leave_application.status = 'forwarded_to_vc'
                message = 'Leave application approved by HOD and forwarded to VC successfully'
            else:
                # If meant for final approval by HOD, approve directly
                leave_application.status = 'approved_by_hod'
                message = 'Leave application approved by HOD successfully'
            
            # Add remarks if provided
            if 'remarks' in request.data:
                leave_application.remarks = request.data['remarks']
                logger.debug(f"Added remarks: {request.data['remarks']}")
            
            # Save the changes
            leave_application.save()
            send_push_notifications(
                leave_application.faculty,
                "Leave Application Approved",
                "Your leave application has been rejected by HOD."
            )
            logger.info(f"Successfully approved leave application {pk} by HOD")
            
            # Return updated application data
            serializer = self.get_serializer(leave_application)
            return Response({
                'message': 'Leave application approved by HOD successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log the error for debugging
            logger.error(f"Error approving leave application {pk} by HOD: {str(e)}", exc_info=True)
            
            return Response({
                'error': f'Failed to approve leave application: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    @action(detail=True, methods=['post'])
    def hod_reject(self, request, pk=None):
        logger = logging.getLogger('leave_management')
        
        # Log request details for debugging
        logger.debug(f"HOD reject request for application {pk}")
        logger.debug(f"User: {request.user.id}, Name: {request.user.name}, Type: {getattr(request.user, 'emptype', 'unknown')}")
        logger.debug(f"Request headers: {request.headers}")
        
        try:
            # Get the leave application object
            leave_application = self.get_object()
            logger.debug(f"Leave application retrieved: {leave_application.id}, status: {leave_application.status}")
            
            # Check if the application is in a valid state for rejection
            # Accept both 'pending' and 'forwarded_to_hod' statuses for flexibility
            valid_statuses = ['pending', 'forwarded_to_hod']
            if leave_application.status not in valid_statuses:
                error_msg = f"Cannot reject application in {leave_application.status} status. Application must be in one of: {', '.join(valid_statuses)}."
                logger.warning(error_msg)
                return Response({
                    'error': error_msg
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update status to rejected_by_hod
            leave_application.status = 'rejected_by_hod'
            
            # Add remarks if provided
            if 'remarks' in request.data:
                leave_application.remarks = request.data['remarks']
                logger.debug(f"Added remarks: {request.data['remarks']}")
            
            # Explicitly restore leave balance (backup for signal)
            self._restore_leave_balance(leave_application)
            
            # Save the changes
            leave_application.save()
            send_push_notifications(
                leave_application.faculty,
                "Leave Application Rejected",
                "Your leave application has been rejected by HOD."
            )
            logger.info(f"Successfully rejected leave application {pk} by HOD")
            
            # Return updated application data
            serializer = self.get_serializer(leave_application)
            return Response({
                'message': 'Leave application rejected by HOD successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log the error for debugging
            logger.error(f"Error rejecting leave application {pk} by HOD: {str(e)}", exc_info=True)
            
            return Response({
                'error': f'Failed to reject leave application: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    @action(detail=True, methods=['post'])
    def dean_approve(self, request, pk=None):
        logger = logging.getLogger('leave_management')
        
        # Log request details for debugging
        logger.debug(f"Dean approve request for application {pk}")
        logger.debug(f"User: {request.user.id}, Name: {request.user.name}, Type: {getattr(request.user, 'emptype', 'unknown')}")
        logger.debug(f"Request headers: {request.headers}")
        
        try:
            # Get the leave application object
            leave_application = self.get_object()
            logger.debug(f"Leave application retrieved: {leave_application.id}, status: {leave_application.status}")
            
            # Check if the application is in a valid state for approval
            # Accept both 'pending' and 'forwarded_to_dean' statuses for flexibility
            valid_statuses = ['pending', 'forwarded_to_dean']
            if leave_application.status not in valid_statuses:
                error_msg = f"Cannot approve application in {leave_application.status} status. Application must be in one of: {', '.join(valid_statuses)}."
                logger.warning(error_msg)
                return Response({
                    'error': error_msg
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Determine next status based on the forward_to field
            forward_to = leave_application.forward_to.lower()
            
            if 'hr' in forward_to or 'human resources' in forward_to:
                # If originally meant for HR, forward to HR
                leave_application.status = 'forwarded_to_hr'
                message = 'Leave application approved by Dean and forwarded to HR successfully'
            elif 'vc' in forward_to or 'vice chancellor' in forward_to:
                # If meant for VC, forward to VC
                leave_application.status = 'forwarded_to_vc'
                message = 'Leave application approved by Dean and forwarded to VC successfully'
            else:
                # If meant for final approval by Dean, approve directly
                leave_application.status = 'approved_by_dean'
                message = 'Leave application approved by Dean successfully'
            
            # Add remarks if provided
            if 'remarks' in request.data:
                leave_application.remarks = request.data['remarks']
                logger.debug(f"Added remarks: {request.data['remarks']}")
            
            # Save the changes
            leave_application.save()
            send_push_notifications(
                leave_application.faculty,
                "Leave Application Approved",
                "Your leave application has been approved by DEAN."
            )
            logger.info(f"Dean approved leave application {pk}, new status: {leave_application.status}")
            
            # Return updated application data
            serializer = self.get_serializer(leave_application)
            return Response({
                'message': message,
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log the error for debugging
            logger.error(f"Error approving leave application {pk} by Dean: {str(e)}", exc_info=True)
            
            return Response({
                'error': f'Failed to approve leave application: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    @action(detail=True, methods=['post'])
    def dean_reject(self, request, pk=None):
        logger = logging.getLogger('leave_management')
        
        # Log request details for debugging
        logger.debug(f"Dean reject request for application {pk}")
        logger.debug(f"User: {request.user.id}, Name: {request.user.name}, Type: {getattr(request.user, 'emptype', 'unknown')}")
        logger.debug(f"Request headers: {request.headers}")
        
        try:
            # Get the leave application object
            leave_application = self.get_object()
            logger.debug(f"Leave application retrieved: {leave_application.id}, status: {leave_application.status}")
            
            # Check if the application is in a valid state for rejection
            # Accept both 'pending' and 'forwarded_to_dean' statuses for flexibility
            valid_statuses = ['pending', 'forwarded_to_dean']
            if leave_application.status not in valid_statuses:
                error_msg = f"Cannot reject application in {leave_application.status} status. Application must be in one of: {', '.join(valid_statuses)}."
                logger.warning(error_msg)
                return Response({
                    'error': error_msg
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update status to rejected_by_dean
            leave_application.status = 'rejected_by_dean'
            
            # Add remarks if provided
            if 'remarks' in request.data:
                leave_application.remarks = request.data['remarks']
                logger.debug(f"Added remarks: {request.data['remarks']}")
            
            # Explicitly restore leave balance (backup for signal)
            self._restore_leave_balance(leave_application)
            
            # Save the changes
            leave_application.save()
            send_push_notifications(
                leave_application.faculty,
                "Leave Application Rejected",
                "Your leave application has been rejected by Dean."
            )
            logger.info(f"Successfully rejected leave application {pk} by Dean")
            
            # Return updated application data
            serializer = self.get_serializer(leave_application)
            return Response({
                'message': 'Leave application rejected by Dean successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log the error for debugging
            logger.error(f"Error rejecting leave application {pk} by Dean: {str(e)}", exc_info=True)
            
            return Response({
                'error': f'Failed to reject leave application: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    @action(detail=True, methods=['post'])
    def vc_approve(self, request, pk=None):
        logger = logging.getLogger('leave_management')
        
        # Log request details for debugging
        logger.debug(f"VC approve request for application {pk}")
        logger.debug(f"User: {request.user.id}, Name: {request.user.name}, Type: {getattr(request.user, 'emptype', 'unknown')}")
        logger.debug(f"Request headers: {request.headers}")
        
        try:
            # Get the leave application object
            leave_application = self.get_object()
            logger.debug(f"Leave application retrieved: {leave_application.id}, status: {leave_application.status}")
            
            # Check if the application is in a valid state for approval
            # Accept both 'pending' and 'forwarded_to_vc' statuses for flexibility
            valid_statuses = ['pending', 'forwarded_to_vc']
            if leave_application.status not in valid_statuses:
                error_msg = f"Cannot approve application in {leave_application.status} status. Application must be in one of: {', '.join(valid_statuses)}."
                logger.warning(error_msg)
                return Response({
                    'error': error_msg
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update status to approved_by_vc (final approval)
            leave_application.status = 'approved_by_vc'
            
            # Add remarks if provided
            if 'remarks' in request.data:
                leave_application.remarks = request.data['remarks']
                logger.debug(f"Added remarks: {request.data['remarks']}")
            
            # Save the changes
            leave_application.save()
            send_push_notifications(
                leave_application.faculty,
                "Leave Application Approved",
                "Your leave application has been approved by Vice-Chancellor."
            )
            logger.info(f"VC approved leave application {pk}, final approval granted")
            
            # Return updated application data
            serializer = self.get_serializer(leave_application)
            return Response({
                'message': 'Leave application approved by VC successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log the error for debugging
            logger.error(f"Error approving leave application {pk} by VC: {str(e)}", exc_info=True)
            
            return Response({
                'error': f'Failed to approve leave application: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    @action(detail=True, methods=['post'])
    def vc_reject(self, request, pk=None):
        logger = logging.getLogger('leave_management')
        
        # Log request details for debugging
        logger.debug(f"VC reject request for application {pk}")
        logger.debug(f"User: {request.user.id}, Name: {request.user.name}, Type: {getattr(request.user, 'emptype', 'unknown')}")
        logger.debug(f"Request headers: {request.headers}")
        
        try:
            # Get the leave application object
            leave_application = self.get_object()
            logger.debug(f"Leave application retrieved: {leave_application.id}, status: {leave_application.status}")
            
            # Check if the application is in a valid state for rejection
            # Accept both 'pending' and 'forwarded_to_vc' statuses for flexibility
            valid_statuses = ['pending', 'forwarded_to_vc']
            if leave_application.status not in valid_statuses:
                error_msg = f"Cannot reject application in {leave_application.status} status. Application must be in one of: {', '.join(valid_statuses)}."
                logger.warning(error_msg)
                return Response({
                    'error': error_msg
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update status to rejected_by_vc
            leave_application.status = 'rejected_by_vc'
            
            # Add remarks if provided
            if 'remarks' in request.data:
                leave_application.remarks = request.data['remarks']
                logger.debug(f"Added remarks: {request.data['remarks']}")
            
            # Explicitly restore leave balance (backup for signal)
            self._restore_leave_balance(leave_application)
            
            # Save the changes
            leave_application.save()
            send_push_notifications(
                leave_application.faculty,
                "Leave Application Rejected",
                "Your leave application has been rejected by Vice-Chancellor."
            )
            logger.info(f"Successfully rejected leave application {pk} by VC")
            
            # Return updated application data
            serializer = self.get_serializer(leave_application)
            return Response({
                'message': 'Leave application rejected by VC successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log the error for debugging
            logger.error(f"Error rejecting leave application {pk} by VC: {str(e)}", exc_info=True)
            
            return Response({
                'error': f'Failed to reject leave application: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    # Recommendation endpoints
    @action(detail=True, methods=['post'])
    def hod_recommend_to_dean(self, request, pk=None):
        logger = logging.getLogger('leave_management')
        
        # Log request details for debugging
        logger.debug(f"HOD recommend to Dean request for application {pk}")
        logger.debug(f"User: {request.user.id}, Name: {request.user.name}, Type: {getattr(request.user, 'emptype', 'unknown')}")
        logger.debug(f"Request headers: {request.headers}")
        
        try:
            # Get the leave application object
            leave_application = self.get_object()
            logger.debug(f"Leave application retrieved: {leave_application.id}, status: {leave_application.status}")
            
            # Check if the application is in a valid status for recommendation
            valid_statuses = ['pending', 'forwarded_to_hod']
            if leave_application.status not in valid_statuses:
                error_msg = f"Cannot recommend application in {leave_application.status} status. Application must be in one of: {', '.join(valid_statuses)}."
                logger.warning(error_msg)
                return Response({
                    'error': error_msg
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update status to forwarded_to_dean
            leave_application.status = 'forwarded_to_dean'
            
            # Add remarks if provided
            if 'remarks' in request.data:
                leave_application.remarks = request.data['remarks']
                logger.debug(f"Added remarks: {request.data['remarks']}")
            
            # Save the changes
            leave_application.save()
            send_push_notifications(
                leave_application.faculty,
                "Leave Application Recommended!",
                "Your leave application has been recommended by HOD to DEAN"
            )
            logger.info(f"Successfully recommended leave application {pk} to Dean by HOD")
            
            # Return updated application data
            serializer = self.get_serializer(leave_application)
            return Response({
                'message': 'Leave application recommended to Dean successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log the error for debugging
            logger.error(f"Error recommending leave application {pk} to Dean by HOD: {str(e)}", exc_info=True)
            
            return Response({
                'error': f'Failed to recommend leave application to Dean: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def hod_recommend_to_vc(self, request, pk=None):
        logger = logging.getLogger('leave_management')
        
        # Log request details for debugging
        logger.debug(f"HOD recommend to VC request for application {pk}")
        logger.debug(f"User: {request.user.id}, Name: {request.user.name}, Type: {getattr(request.user, 'emptype', 'unknown')}")
        logger.debug(f"Request headers: {request.headers}")
        
        try:
            # Get the leave application object
            leave_application = self.get_object()
            logger.debug(f"Leave application retrieved: {leave_application.id}, status: {leave_application.status}")
            
            # Check if the application is in a valid status for recommendation
            valid_statuses = ['pending', 'forwarded_to_hod']
            if leave_application.status not in valid_statuses:
                error_msg = f"Cannot recommend application in {leave_application.status} status. Application must be in one of: {', '.join(valid_statuses)}."
                logger.warning(error_msg)
                return Response({
                    'error': error_msg
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update status to forwarded_to_vc
            leave_application.status = 'forwarded_to_vc'
            
            # Add remarks if provided
            if 'remarks' in request.data:
                leave_application.remarks = request.data['remarks']
                logger.debug(f"Added remarks: {request.data['remarks']}")
            
            # Save the changes
            leave_application.save()
            send_push_notifications(
                leave_application.faculty,
                "Leave Application Recommended!",
                "Your leave application has been recommended by HOD to VC"
            )
            logger.info(f"Successfully recommended leave application {pk} to VC by HOD")
            
            # Return updated application data
            serializer = self.get_serializer(leave_application)
            return Response({
                'message': 'Leave application recommended to VC successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log the error for debugging
            logger.error(f"Error recommending leave application {pk} to VC by HOD: {str(e)}", exc_info=True)
            
            return Response({
                'error': f'Failed to recommend leave application to VC: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def dean_recommend_to_vc(self, request, pk=None):
        logger = logging.getLogger('leave_management')
        
        # Log request details for debugging
        logger.debug(f"Dean recommend to VC request for application {pk}")
        logger.debug(f"User: {request.user.name}, Type: {getattr(request.user, 'emptype', 'unknown')}")
        logger.debug(f"Request headers: {request.headers}")
        
        try:
            # Get the leave application object
            leave_application = self.get_object()
            logger.debug(f"Leave application retrieved: {leave_application.id}, status: {leave_application.status}")
            
            # Check if the application is in a valid status for recommendation
            valid_statuses = ['pending', 'forwarded_to_dean']
            if leave_application.status not in valid_statuses:
                error_msg = f"Cannot recommend application in {leave_application.status} status. Application must be in one of: {', '.join(valid_statuses)}."
                logger.warning(error_msg)
                return Response({
                    'error': error_msg
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update status to forwarded_to_vc
            leave_application.status = 'forwarded_to_vc'
            
            # Add remarks if provided
            if 'remarks' in request.data:
                leave_application.remarks = request.data['remarks']
                logger.debug(f"Added remarks: {request.data['remarks']}")
            
            # Save the changes
            leave_application.save()
            send_push_notifications(
                leave_application.faculty,
                "Leave Application Recommended!",
                "Your leave application has been recommended by DEAN to VC"
            )
            logger.info(f"Successfully recommended leave application {pk} to VC by Dean")
            
            # Return updated application data
            serializer = self.get_serializer(leave_application)
            return Response({
                'message': 'Leave application recommended to VC successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log the error for debugging
            logger.error(f"Error recommending leave application {pk} to VC by Dean: {str(e)}", exc_info=True)
            
            return Response({
                'error': f'Failed to recommend leave application to VC: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    def get_object(self):
        """
        Override the default get_object to support different retrieval methods
        based on the current action.
        """
        logger = logging.getLogger('leave_management')
        
        # Check if we're in HR approval/reject mode
        if self.action in ['hr_approve', 'hr_reject']:
            logger.debug(f"Using direct object lookup for HR action: {self.action}")
            try:
                # Get the primary key from the URL
                pk = self.kwargs.get('pk')
                # Directly retrieve the object without permission checks
                obj = LeaveApplication.objects.get(pk=pk)
                logger.debug(f"Retrieved leave application {pk} directly for HR action")
                return obj
            except LeaveApplication.DoesNotExist:
                logger.error(f"Leave application with ID {pk} not found")
                raise
        # Check if we're in HOD approval/reject/recommendation mode
        elif self.action in ['hod_approve', 'hod_reject', 'hod_recommend_to_dean', 'hod_recommend_to_vc']:
            logger.debug(f"Using direct object lookup for HOD action: {self.action}")
            try:
                # Get the primary key from the URL
                pk = self.kwargs.get('pk')
                # Directly retrieve the object without permission checks
                obj = LeaveApplication.objects.get(pk=pk)
                logger.debug(f"Retrieved leave application {pk} directly for HOD action")
                return obj
            except LeaveApplication.DoesNotExist:
                logger.error(f"Leave application with ID {pk} not found")
                raise
        # Check if we're in Dean approval/reject/recommendation mode
        elif self.action in ['dean_approve', 'dean_reject', 'dean_recommend_to_vc']:
            logger.debug(f"Using direct object lookup for Dean action: {self.action}")
            try:
                # Get the primary key from the URL
                pk = self.kwargs.get('pk')
                # Directly retrieve the object without permission checks
                obj = LeaveApplication.objects.get(pk=pk)
                logger.debug(f"Retrieved leave application {pk} directly for Dean action")
                return obj
            except LeaveApplication.DoesNotExist:
                logger.error(f"Leave application with ID {pk} not found")
                raise
        # Check if we're in VC approval/reject mode
        elif self.action in ['vc_approve', 'vc_reject']:
            logger.debug(f"Using direct object lookup for VC action: {self.action}")
            try:
                # Get the primary key from the URL
                pk = self.kwargs.get('pk')
                # Directly retrieve the object without permission checks
                obj = LeaveApplication.objects.get(pk=pk)
                logger.debug(f"Retrieved leave application {pk} directly for VC action")
                return obj
            except LeaveApplication.DoesNotExist:
                logger.error(f"Leave application with ID {pk} not found")
                raise
        
        # For other actions, use the default implementation
        return super().get_object()

    @action(detail=False, methods=['get'])
    def test_hr_permissions(self, request):
        """
        Simple endpoint to test if HR permissions are working correctly.
        """
        logger = logging.getLogger('leave_management')
        
        # Log request details
        logger.debug("HR permissions test endpoint called")
        logger.debug(f"User: {request.user.id}, Name: {request.user.name}")
        logger.debug(f"User type (emptype): {getattr(request.user, 'emptype', 'unknown')}")
        logger.debug(f"Authentication headers: {request.headers.get('Authorization', 'None')}")
        
        # Check if user is HR
        if getattr(request.user, 'emptype', '') == 'hr':
            logger.info(f"User {request.user.id} confirmed as HR")
            return Response({
                'status': 'success',
                'message': 'You have HR permissions',
                'user_details': {
                    'id': request.user.id,
                    'name': request.user.name,
                    'emptype': request.user.emptype,
                    'email': request.user.primary_email
                }
            }, status=status.HTTP_200_OK)
        else:
            logger.warning(f"User {request.user.id} failed HR permissions check, emptype: {getattr(request.user, "emptype", "unknown")}")
            return Response({
                'status': 'error',
                'message': f'You do not have HR permissions. Your emptype is: {getattr(request.user, "emptype", "unknown")}'
            }, status=status.HTTP_403_FORBIDDEN)

class LeaveBalanceViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveBalanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Check if user is HR
        is_hr = hasattr(self.request.user, 'emptype') and self.request.user.emptype == 'hr'
        
        if is_hr:
            # HR can see all leave balances
            return LeaveBalance.objects.all().order_by('faculty__name')
        
        # Regular faculty can only see their own leave balance
        return LeaveBalance.objects.filter(faculty=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_balance(self, request):
        try:
            # Get or create leave balance for current faculty
            leave_balance, created = LeaveBalance.objects.get_or_create(
                faculty=request.user,
                defaults={
                    'casual_leave': 15.0,
                    'medical_leave': 12.0,
                    'compensatory_leave': 8.0,
                    'earned_leave': 15.0,
                    'semester_leave': 5.0,
                    'maternity_leave': 15.0,
                    'paternity_leave': 0.0,
                    'extraordinary_leave': 15.0,
                    'academic_leave': 5.0,
                    'half_pay_leave': 5.0,
                    'duty_leave': 15.0,
                    'hpl': 5.0,
                    'vacation_leave': 15.0,
                    'cl_slot1_total': 7.0,
                    'cl_slot1_used': 0.0,
                    'cl_slot1_lapsed': False,
                    'cl_slot2_total': 8.0,
                    'cl_slot2_used': 0.0,
                    'cl_slot2_lapsed': False
                }
            )
            
            serializer = self.get_serializer(leave_balance)
            return Response(serializer.data)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

@receiver(post_save, sender=LeaveApplication)
def handle_leave_balance_on_status_change(sender, instance, created, **kwargs):
    """Handle leave balance updates when leave application status changes"""
    
    logger = logging.getLogger('leave_management')
    
    # Log all signal triggers for debugging
    logger.debug(f"Signal triggered for leave application {instance.id}, created: {created}, status: {instance.status}")
    
    # Skip if this is a new application (balance already deducted in create method)
    if created:
        logger.debug(f"Skipping signal for new application {instance.id}")
        return
    
    # Define status categories
    approved_statuses = [
        'approved', 
        'approved_by_hr', 
        'approved_by_hod', 
        'approved_by_dean', 
        'approved_by_vc'
    ]
    
    rejected_statuses = [
        'rejected',
        'rejected_by_hr',
        'rejected_by_hod', 
        'rejected_by_dean',
        'rejected_by_vc',
        'cancelled'
    ]
    
    try:
        # Get or create leave balance for the faculty
        leave_balance, balance_created = LeaveBalance.objects.get_or_create(
            faculty=instance.faculty,
            defaults={
                'casual_leave': 15.0,
                'medical_leave': 12.0,
                'compensatory_leave': 8.0,
                'earned_leave': 15.0,
                'semester_leave': 5.0,
                'maternity_leave': 15.0,
                'paternity_leave': 0.0,
                'extraordinary_leave': 15.0,
                'academic_leave': 5.0,
                'half_pay_leave': 5.0,
                'duty_leave': 15.0,
                'hpl': 5.0,
                'vacation_leave': 15.0,
                'cl_slot1_total': 7.0,
                'cl_slot1_used': 0.0,
                'cl_slot1_lapsed': False,
                'cl_slot2_total': 8.0,
                'cl_slot2_used': 0.0,
                'cl_slot2_lapsed': False
            }
        )
        
        if balance_created:
            logger.warning(f"Created missing leave balance for faculty {instance.faculty.id}")
        
        # Map leave types to the proper field names
        leave_type_mapping = {
            'casual': 'casual',
            'medical': 'medical', 
            'compensatory': 'compensatory',
            'earned': 'earned',
            'semester': 'semester',
            'maternity': 'maternity',
            'paternity': 'paternity',
            'extraordinary': 'extraordinary',
            'academic': 'academic',
            'half_pay': 'half_pay',
            'duty': 'duty',
            'hpl': 'hpl'  # Legacy support
        }
        
        mapped_leave_type = leave_type_mapping.get(instance.leave_type)
        
        if not mapped_leave_type:
            logger.warning(f"Unknown leave type '{instance.leave_type}' for application {instance.id}")
            return
        
        # Log current balance before any changes
        current_balance = leave_balance.get_remaining_balance(mapped_leave_type)
        logger.debug(f"Current {mapped_leave_type} balance for faculty {instance.faculty.id}: {current_balance}")
        
        if instance.status in approved_statuses:
            # For approved applications, balance was already deducted during creation
            # Just log the approval for tracking
            logger.info(f"Leave application {instance.id} approved for faculty {instance.faculty.id}. Balance was already deducted during application.")
            
        elif instance.status in rejected_statuses:
            # For rejected/cancelled applications, restore the balance
            logger.info(f"Processing rejection for leave application {instance.id}, status: {instance.status}")
            
            # Add the leave back to balance
            leave_balance.add_leave(mapped_leave_type, instance.no_of_days)
            
            # Log the balance restoration
            new_balance = leave_balance.get_remaining_balance(mapped_leave_type)
            logger.info(f"RESTORED {instance.no_of_days} days of {instance.leave_type} leave for faculty {instance.faculty.id} due to {instance.status}")
            logger.info(f"Balance changed from {current_balance} to {new_balance}")
            
        else:
            logger.debug(f"No balance change needed for status '{instance.status}' on application {instance.id}")
                
    except Exception as e:
        logger.error(f"Error handling leave balance for application {instance.id}: {str(e)}", exc_info=True)

def _restore_leave_balance(self, leave_application):
        """
        Helper method to restore leave balance when an application is rejected
        This ensures balance is restored even if the signal doesn't work properly
        """
        logger = logging.getLogger('leave_management')
        
        try:
            # Get or create leave balance for the faculty
            leave_balance, created = LeaveBalance.objects.get_or_create(
                faculty=leave_application.faculty,
                defaults={
                    'casual_leave': 15.0,
                    'medical_leave': 12.0,
                    'compensatory_leave': 8.0,
                    'earned_leave': 15.0,
                    'semester_leave': 5.0,
                    'maternity_leave': 15.0,
                    'paternity_leave': 0.0,
                    'extraordinary_leave': 15.0,
                    'academic_leave': 5.0,
                    'half_pay_leave': 5.0,
                    'duty_leave': 15.0,
                    'hpl': 5.0,
                    'vacation_leave': 15.0,
                    'cl_slot1_total': 7.0,
                    'cl_slot1_used': 0.0,
                    'cl_slot1_lapsed': False,
                    'cl_slot2_total': 8.0,
                    'cl_slot2_used': 0.0,
                    'cl_slot2_lapsed': False
                }
            )
            
            if created:
                logger.warning(f"Created missing leave balance for faculty {leave_application.faculty.id}")
            
            # Map leave types to the proper field names
            leave_type_mapping = {
                'casual': 'casual',
                'medical': 'medical', 
                'compensatory': 'compensatory',
                'earned': 'earned',
                'semester': 'semester',
                'maternity': 'maternity',
                'paternity': 'paternity',
                'extraordinary': 'extraordinary',
                'academic': 'academic',
                'half_pay': 'half_pay',
                'duty': 'duty',
                'hpl': 'hpl'
            }
            
            mapped_leave_type = leave_type_mapping.get(leave_application.leave_type)
            
            if mapped_leave_type:
                # Get current balance before restoration
                current_balance = leave_balance.get_remaining_balance(mapped_leave_type)
                
                # Add the leave back to balance
                leave_balance.add_leave(mapped_leave_type, leave_application.no_of_days)
                
                # Get new balance after restoration
                new_balance = leave_balance.get_remaining_balance(mapped_leave_type)
                
                logger.info(f"MANUALLY RESTORED {leave_application.no_of_days} days of {leave_application.leave_type} leave for faculty {leave_application.faculty.id}")
                logger.info(f"Balance restored from {current_balance} to {new_balance}")
            else:
                logger.warning(f"Unknown leave type '{leave_application.leave_type}' for application {leave_application.id}")
                
        except Exception as e:
            logger.error(f"Error manually restoring leave balance for application {leave_application.id}: {str(e)}", exc_info=True)