from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Faculty
from deputy_registrar.models import School


class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = [
            'id',
            'registration_no',
            'name',
            'primary_email',
            'official_email',
            'department',
            'designation',
            'school',
            'emptype'
        ]
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = Faculty
        fields = ['primary_email', 'password', 'name', 'registration_no', 'emptype', 'department']

    def create(self, validated_data):
        password = validated_data.pop('password')
        email = validated_data.pop('primary_email')
        user = Faculty.objects.create_user(email=email, password=password, **validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    primary_email = serializers.EmailField()
    password = serializers.CharField(max_length=128, write_only=True, style={'input_type': 'password'})
    emptype = serializers.CharField(max_length=50)

    def validate(self, data):
        primary_email = data.get('primary_email')
        password = data.get('password')
        emptype = data.get('emptype')

        if not primary_email or not password:
            raise serializers.ValidationError('Both email and password are required.')

        if not emptype:
            raise serializers.ValidationError('Employee type is required.')

        user = authenticate(request=self.context.get('request'), username=primary_email, password=password)

        if not user:
            raise serializers.ValidationError('Invalid credentials.')
            
        # Validate that the user's emptype matches the provided emptype
        if user.emptype != emptype:
            raise serializers.ValidationError('Invalid employee type for this user.')

        data['user'] = user
        return data
