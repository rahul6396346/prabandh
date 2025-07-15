from django.contrib import admin
from .models import LeaveApplication, ClassAdjustment, LeaveBalance, FCMToken

class ClassAdjustmentInline(admin.TabularInline):
    model = ClassAdjustment
    extra = 0

class LeaveApplicationAdmin(admin.ModelAdmin):
    list_display = ('faculty', 'leave_type', 'from_date', 'to_date', 'no_of_days', 'status', 'applied_on')
    list_filter = ('status', 'leave_type', 'applied_on')
    search_fields = ('faculty__name', 'faculty__registration_no', 'reason')
    readonly_fields = ('applied_on', 'updated_on')
    inlines = [ClassAdjustmentInline]
    
    fieldsets = (
        ('Faculty Information', {
            'fields': ('faculty',)
        }),
        ('Leave Details', {
            'fields': ('leave_type', 'from_date', 'to_date', 'no_of_days', 'reason')
        }),
        ('Contact Information', {
            'fields': ('contact_during_leave', 'address_during_leave')
        }),
        ('Application Status', {
            'fields': ('status', 'forward_to', 'remarks')
        }),
        ('Documents', {
            'fields': ('supporting_document',)
        }),
        ('Timestamps', {
            'fields': ('applied_on', 'updated_on')
        }),
    )

class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = ('faculty', 'get_casual_balance', 'get_medical_balance', 'get_compensatory_balance', 
                   'get_semester_balance', 'get_hpl_balance', 'get_maternity_balance', 'updated_at')
    search_fields = ('faculty__name', 'faculty__registration_no')
    readonly_fields = ('created_at', 'updated_at')
    
    def get_casual_balance(self, obj):
        return f"{obj.casual_leave - obj.casual_leave_used} / {obj.casual_leave}"
    get_casual_balance.short_description = 'Casual Leave (Remaining/Total)'
    
    def get_medical_balance(self, obj):
        return f"{obj.medical_leave - obj.medical_leave_used} / {obj.medical_leave}"
    get_medical_balance.short_description = 'Medical Leave (Remaining/Total)'
    
    def get_compensatory_balance(self, obj):
        return f"{obj.compensatory_leave - obj.compensatory_leave_used} / {obj.compensatory_leave}"
    get_compensatory_balance.short_description = 'Compensatory Leave (Remaining/Total)'
    
    def get_semester_balance(self, obj):
        return f"{obj.academic_leave - obj.academic_leave_used} / {obj.academic_leave}"
    get_semester_balance.short_description = 'Semester Break (Remaining/Total)'
    
    def get_hpl_balance(self, obj):
        return f"{obj.hpl - obj.hpl_used} / {obj.hpl}"
    get_hpl_balance.short_description = 'Half Pay Leave (Remaining/Total)'
    
    def get_maternity_balance(self, obj):
        return f"{obj.vacation_leave - obj.vacation_leave_used} / {obj.vacation_leave}"
    get_maternity_balance.short_description = 'Maternity Leave (Remaining/Total)'

admin.site.register(LeaveApplication, LeaveApplicationAdmin)
admin.site.register(ClassAdjustment)
admin.site.register(LeaveBalance, LeaveBalanceAdmin)
admin.site.register(FCMToken)