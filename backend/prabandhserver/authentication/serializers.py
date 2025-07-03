from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Faculty
from deputy_registrar.models import School


class FacultySerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(required=False, allow_null=True)
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
            'emptype',
            'father_name',
            'gender',
            'category',
            'dob',
            'contact_no',
            'address',
            'joining_date',
            'qualification',
            'experience',
            'marital_status',
            'is_staff',
            'is_active',
            'date_joined',
            'profile_image',
        ]
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = Faculty
        fields = [
            'primary_email', 'password', 'name', 'registration_no', 'emptype', 'department', 'school',
            'father_name', 'gender', 'category', 'dob', 'designation', 'contact_no', 'official_email',
            'address', 'joining_date', 'qualification', 'experience', 'marital_status'
        ]
        extra_kwargs = {
            'department': {'required': False, 'allow_blank': True},
            'school': {'required': False, 'allow_null': True},
            'father_name': {'required': False, 'allow_blank': True},
            'gender': {'required': False, 'allow_blank': True},
            'category': {'required': False, 'allow_blank': True},
            'dob': {'required': False, 'allow_blank': True},
            'designation': {'required': False, 'allow_blank': True},
            'contact_no': {'required': False, 'allow_blank': True},
            'official_email': {'required': False, 'allow_blank': True},
            'address': {'required': False, 'allow_blank': True},
            'joining_date': {'required': False, 'allow_blank': True},
            'qualification': {'required': False, 'allow_blank': True},
            'experience': {'required': False, 'allow_blank': True},
            'marital_status': {'required': False, 'allow_blank': True},
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        email = validated_data.pop('primary_email')
        user = Faculty.objects.create_user(email=email, password=password, **validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    primary_email = serializers.EmailField()
    password = serializers.CharField(max_length=128, write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        primary_email = data.get('primary_email')
        password = data.get('password')

        if not primary_email or not password:
            raise serializers.ValidationError('Both email and password are required.')

        user = authenticate(request=self.context.get('request'), username=primary_email, password=password)

        if not user:
            raise serializers.ValidationError('Invalid credentials.')

        data['user'] = user
        return data
