from django.contrib import admin
from .models import Faculty, School, FacultyDocument
from facultyservices.models import EventsDetails

class FacultyAdmin(admin.ModelAdmin):
    list_display = (
        'registration_no',
        'name',
        'primary_email',
        'emptype',  # Added emptype to display
        'get_department',  # Changed from 'department' to 'get_department'
        'designation',
        'is_active',
        'date_joined',
    )
    search_fields = ('registration_no', 'primary_email', 'name', 'department', 'emptype')  # Added emptype to search
    list_filter = ('department', 'is_active', 'emptype')  # Added emptype to filters
    
    def get_department(self, obj):
        # Return department if it exists, otherwise return a default value
        return obj.department if obj.department else "-"
    get_department.short_description = 'Department'  # Sets the column header


admin.site.register(Faculty, FacultyAdmin)
admin.site.register(EventsDetails)
admin.site.register(School)
admin.site.register(FacultyDocument)