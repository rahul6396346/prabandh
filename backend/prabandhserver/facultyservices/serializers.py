from rest_framework import serializers
from .models import EventType, EventSubType, EventsDetails

class EventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = ['id', 'type']

class EventSubTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventSubType
        fields = ['id', 'name', 'event_type']

class EventsDetailsSerializer(serializers.ModelSerializer):
    event_type_name = serializers.CharField(source='event_type', read_only=True)
    applied_amount = serializers.CharField(source='event_budget', read_only=True)
    files_uploaded = serializers.SerializerMethodField()
    files_required = serializers.SerializerMethodField()

    FILE_LABELS = [
        ("creatives", "Creative"),
        ("attendance_file", "Attendance"),
        ("geotagpics_file1", "Geotagged Photo1"),
        ("geotagpics_file2", "Geotagged Photo2"),
        ("geotagpics_file3", "Geotagged Photo3"),
        ("report_file", "Report"),
        ("news_social_media", "News Social Media"),
        ("news_print_media", "News Print Media"),
        ("proposal_file", "Proposal"),
        ("vcapproval_file", "VC Approval"),
        ("videoclip", "Video Clip"),
        ("certificate", "Certificate"),
        ("creative", "Creative (Text)"),
        ("backdrop", "Backdrop"),
        ("standee", "Standee"),
    ]

    def get_files_uploaded(self, obj):
        request = self.context.get('request', None)
        uploaded = []
        for field, label in self.FILE_LABELS:
            value = getattr(obj, field, None)
            url = None
            # FileFields and URLField
            if value:
                if hasattr(value, 'url'):
                    url = value.url
                    if request is not None:
                        url = request.build_absolute_uri(url)
                elif field == 'videoclip':
                    url = value
                # Only add if we have a URL
                if url:
                    uploaded.append({"label": label, "url": url})
        return uploaded

    def get_files_required(self, obj):
        required = []
        for field, label in self.FILE_LABELS:
            value = getattr(obj, field, None)
            if not value:
                required.append(label)
        return required

    class Meta:
        model = EventsDetails
        fields = '__all__'
        read_only_fields = ['upload_by']
        extra_fields = ['files_uploaded', 'files_required'] 