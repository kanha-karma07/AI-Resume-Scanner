import uuid
import re
from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate


def validate_strong_password(value):
    if len(value) < 8:
        raise serializers.ValidationError("Password must be at least 8 characters long.")
    if not re.search(r'[A-Z]', value):
        raise serializers.ValidationError("Password must contain at least one uppercase letter.")
    if not re.search(r'[a-z]', value):
        raise serializers.ValidationError("Password must contain at least one lowercase letter.")
    if not re.search(r'[0-9]', value):
        raise serializers.ValidationError("Password must contain at least one number.")
    if not re.search(r'[\W_]', value):
        raise serializers.ValidationError("Password must contain at least one special character.")
    return value

class CandidateRegisterSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(trim_whitespace=True, allow_blank=False, required=True)
    last_name = serializers.CharField(trim_whitespace=True, allow_blank=False, required=True)
    email = serializers.EmailField(trim_whitespace=True, allow_blank=False, required=True)
    password = serializers.CharField(write_only=True, trim_whitespace=True, allow_blank=False, required=True, validators=[validate_strong_password])
    confirm_password = serializers.CharField(write_only=True, trim_whitespace=True, allow_blank=False, required=True)

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "password",
            "confirm_password"
        ]

    def validate_first_name(self, value):
        if not re.match(r"^[A-Za-z0-9\s&.,\-']+$", value):
            raise serializers.ValidationError("First name can only contain alphanumeric characters, spaces, and common punctuation (& . , - ').")
        return value

    def validate_last_name(self, value):
        if not re.match(r"^[A-Za-z0-9\s&.,\-']+$", value):
            raise serializers.ValidationError("Last name can only contain alphanumeric characters, spaces, and common punctuation (& . , - ').")
        return value

    def validate_email(self, value):
        value = value.lower().strip()
        
        # Strict email regex to prevent malformed like test@gmail or 123456
        if not re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", value):
            raise serializers.ValidationError("Enter a valid email address.")
        
        # Prevent numeric-only local parts (before @)
        local_part = value.split("@")[0]
        if local_part.isdigit():
            raise serializers.ValidationError("Email cannot be entirely numeric before the @ symbol.")
            
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")
        
        # Generate dummy username for Django's AbstractUser constraint
        dummy_username = f"user_{uuid.uuid4().hex[:10]}"
        
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        
        # Force candidate role
        user = User(
            username=dummy_username,
            role=User.Roles.CANDIDATE,
            full_name=f"{first_name} {last_name}".strip(),
            **validated_data
        )
        
        user.set_password(password)
        user.save()
        return user


class RecruiterRegisterSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(trim_whitespace=True, allow_blank=False, required=True)
    email = serializers.EmailField(trim_whitespace=True, allow_blank=False, required=True)
    password = serializers.CharField(write_only=True, trim_whitespace=True, allow_blank=False, required=True, validators=[validate_strong_password])
    confirm_password = serializers.CharField(write_only=True, trim_whitespace=True, allow_blank=False, required=True)

    class Meta:
        model = User
        fields = [
            "full_name",
            "company_name",
            "email",
            "password",
            "confirm_password"
        ]

    def validate_full_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Recruiter Name cannot be empty.")
        if not re.match(r"^[A-Za-z0-9\s&.,\-']+$", value):
            raise serializers.ValidationError("Recruiter Name can only contain alphanumeric characters, spaces, and common punctuation (& . , - ').")
        return value

    def validate_email(self, value):
        value = value.lower().strip()
        
        # Strict email regex to prevent malformed like test@gmail or 123456
        if not re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", value):
            raise serializers.ValidationError("Enter a valid email address.")
        
        # Prevent numeric-only local parts (before @)
        local_part = value.split("@")[0]
        if local_part.isdigit():
            raise serializers.ValidationError("Email cannot be entirely numeric before the @ symbol.")
            
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")
        
        # Generate dummy username for Django's AbstractUser constraint
        dummy_username = f"user_{uuid.uuid4().hex[:10]}"
        
        # Force recruiter role
        user = User(
            username=dummy_username,
            role=User.Roles.RECRUITER,
            **validated_data
        )
        
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(trim_whitespace=True, allow_blank=False, required=True)
    password = serializers.CharField(write_only=True, trim_whitespace=True, allow_blank=False, required=True)

    def validate(self, attrs):
        email = attrs.get("email")
        if email:
            email = email.lower()
        password = attrs.get("password")

        # Authenticate manually via email
        user = User.objects.filter(email__iexact=email).first()

        if not user:
            raise serializers.ValidationError({"email": "Account not found."})

        if not user.check_password(password):
            raise serializers.ValidationError({"password": "Incorrect password."})

        attrs["user"] = user
        return attrs