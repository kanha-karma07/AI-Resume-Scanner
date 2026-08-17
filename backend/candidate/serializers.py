from rest_framework import serializers
from .models import CandidateProfile, Resume, JobDescription, Application


import datetime
import re
from django.contrib.auth import get_user_model
User = get_user_model()

class CandidateProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(source="user.first_name", max_length=150)
    last_name = serializers.CharField(source="user.last_name", max_length=150)
    email = serializers.EmailField(source="user.email")
    phone_number = serializers.CharField(source="user.phone_number", max_length=15, required=False, allow_blank=True)
    
    linkedin = serializers.URLField(required=False, allow_blank=True)
    github = serializers.URLField(required=False, allow_blank=True)
    portfolio = serializers.URLField(required=False, allow_blank=True)

    class Meta:
        model = CandidateProfile

        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "profile_image",
            "date_of_birth",
            "gender",
            "address",
            "college",
            "degree",
            "experience",
            "linkedin",
            "github",
            "portfolio",
            "bio",
        ]

    def validate_first_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("First Name must be at least 2 characters.")
        if not re.match(r"^[A-Za-z\s]+$", value):
            raise serializers.ValidationError("First Name can only contain alphabets and spaces.")
        return value
        
    def validate_last_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Last Name is required.")
        if not re.match(r"^[A-Za-z\s]+$", value):
            raise serializers.ValidationError("Last Name can only contain alphabets and spaces.")
        return value
        
    def validate_email(self, value):
        value = value.strip()
        user = self.context.get('request').user if self.context.get('request') else None
        if user and User.objects.filter(email__iexact=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("This email is already in use by another account.")
        return value
        
    def validate_phone_number(self, value):
        if value:
            value = value.strip()
            if not value.isdigit() or len(value) != 10:
                raise serializers.ValidationError("Phone Number must contain exactly 10 digits.")
        return value
        
    def validate_date_of_birth(self, value):
        if value:
            today = datetime.date.today()
            if value > today:
                raise serializers.ValidationError("Date of birth cannot be in the future.")
            age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
            if age < 16 or age > 80:
                raise serializers.ValidationError("User age should be between 16 and 80 years.")
        return value
        
    def validate_address(self, value):
        if value == "":
            return value
        if value is not None and not str(value).strip():
            raise serializers.ValidationError("Address cannot be just empty spaces.")
        return value
        
    def validate_college(self, value):
        if value == "":
            return value
        if not str(value).strip():
            raise serializers.ValidationError("College cannot be just empty spaces.")
        if re.match(r"^[\d\W_]+$", str(value).strip()):
            raise serializers.ValidationError("College cannot contain only numbers or symbols.")
        return value
        
    def validate_degree(self, value):
        if value == "":
            return value
        if not str(value).strip():
            raise serializers.ValidationError("Degree cannot be just empty spaces.")
        if re.match(r"^[\d\W_]+$", str(value).strip()):
            raise serializers.ValidationError("Degree cannot contain only numbers or symbols.")
        return value
        
    def validate_experience(self, value):
        if value < 0:
            raise serializers.ValidationError("Experience cannot be negative.")
        return value
        
    def validate_bio(self, value):
        if value and len(value) > 500:
            raise serializers.ValidationError("Bio cannot exceed 500 characters.")
        return value
        
    def validate_profile_image(self, value):
        if value and hasattr(value, 'name') and value.name:
            ext = str(value.name).lower().split('.')[-1]
            if ext not in ['jpg', 'jpeg', 'png', 'webp']:
                raise serializers.ValidationError("Only jpg, jpeg, png, and webp images are supported.")
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Image file size must not exceed 5MB.")
        return value

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        if 'first_name' in user_data:
            user.first_name = user_data['first_name']
        if 'last_name' in user_data:
            user.last_name = user_data['last_name']
        if 'email' in user_data:
            user.email = user_data['email']
        if 'phone_number' in user_data:
            user.phone_number = user_data['phone_number']
            
        user.save()
        return super().update(instance, validated_data)

class ResumeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Resume

        fields = [
            "id",
            "title",
            "resume_file",
            "status",
            "parsed_text",
            "skills",
            "education_data",
            "experience_data",
            "projects",
            "certifications",
            "languages",
            "ats_score",
            "ats_breakdown",
            "suggestions",
            "matched_skills",
            "missing_skills",
            "match_percentage",
            "uploaded_at"
        ]
        read_only_fields = [
            "id", "status", "parsed_text", "skills", "education_data",
            "experience_data", "projects", "certifications", "languages",
            "ats_score", "ats_breakdown", "suggestions", "matched_skills",
            "missing_skills", "match_percentage", "uploaded_at"
        ]

    def validate_resume_file(self, value):
        if not value.name.lower().endswith('.pdf'):
            raise serializers.ValidationError("Only PDF files are supported.")
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("File size must not exceed 5MB.")
        return value

class JobDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobDescription
        fields = "__all__"
        read_only_fields = ["id", "recruiter", "created_at"]

    def to_internal_value(self, data):
        list_fields = ['skills', 'requirements', 'responsibilities', 'benefits']
        mutable_data = data.copy() if hasattr(data, 'copy') else data
        for field in list_fields:
            if field in mutable_data:
                val = mutable_data[field]
                if isinstance(val, str):
                    mutable_data[field] = [s.strip() for s in val.split(',') if s.strip()]
        return super().to_internal_value(mutable_data)

    def validate_title(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Job Title must be at least 3 characters.")
        if not re.search(r'[A-Za-z]', value):
            raise serializers.ValidationError("Job Title must contain alphabets.")
        if re.match(r"^[\d\W_]+$", value):
            raise serializers.ValidationError("Job Title cannot contain only numbers or symbols.")
        return value

    def validate_company_name(self, value):
        value = value.strip()
        if not value: return value
        alphabets = re.sub(r'[^A-Za-z]', '', value)
        if len(alphabets) < 2:
            raise serializers.ValidationError("Company Name must contain at least 2 alphabet characters.")
        if re.match(r"^[\d\W_]+$", value):
            raise serializers.ValidationError("Company Name cannot contain only numbers or symbols.")
        return value

    def validate_location(self, value):
        value = value.strip()
        if not value: return value
        if not re.search(r'[A-Za-z]', value):
            raise serializers.ValidationError("Location must contain alphabetic characters.")
        if re.match(r"^[\d\W_]+$", value):
            raise serializers.ValidationError("Location cannot contain only numbers or symbols.")
        return value

    def validate_experience(self, value):
        value = str(value).strip()
        if not value: return value
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Experience must contain a valid number.")
        if re.match(r'^-\d+', value):
            raise serializers.ValidationError("Experience cannot be negative.")
        match = re.search(r'\d+', value)
        if match:
            exp = int(match.group(0))
            if exp < 0 or exp > 50:
                raise serializers.ValidationError("Experience must be between 0 and 50 years.")
            return str(exp)
        return value

    def validate_salary(self, value):
        value = str(value).strip()
        if not value: return value
        if "nan" in value.lower() or "infinity" in value.lower() or "inf" in value.lower():
            raise serializers.ValidationError("Invalid salary format (NaN/Infinity).")
        if "-" in value and not re.match(r'^\d+\s*-\s*\d+$', value):
            if re.match(r'^-\d+', value) or value.startswith("-"):
                raise serializers.ValidationError("Salary cannot be negative.")
        if re.search(r'[A-Za-z]', value):
            raise serializers.ValidationError("Salary cannot contain alphabetical characters.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Salary must contain valid numbers.")
            
        import math
        parts = [p.strip() for p in value.split('-') if p.strip()]
        for p in parts:
            try:
                num = float(p)
                if math.isnan(num) or math.isinf(num):
                    raise serializers.ValidationError("Salary cannot be NaN or Infinity.")
                if num < 0:
                    raise serializers.ValidationError("Salary cannot be negative.")
                if num > 100000000:
                    raise serializers.ValidationError("Salary cannot exceed 100,000,000.")
            except ValueError:
                pass
                
        return value

    def validate_skills(self, value):
        if not value:
            raise serializers.ValidationError("At least one valid skill is required.")
        if isinstance(value, list):
            valid_skills = []
            for skill in value:
                s = str(skill).strip()
                if re.search(r'[A-Za-z]', s) and not re.match(r"^[\d\W_]+$", s):
                    valid_skills.append(s)
            if not valid_skills:
                raise serializers.ValidationError("Skills must contain at least one valid alphabetical skill.")
            return valid_skills
        return value

    def validate_description(self, value):
        value = value.strip()
        if len(value) < 50:
            raise serializers.ValidationError("Job Description must be at least 50 characters.")
        if not re.search(r'[A-Za-z]{2,}', value):
            raise serializers.ValidationError("Job Description must contain actual words.")
        if re.search(r'(.{1,4})\1{10,}', value):
            raise serializers.ValidationError("Job Description contains invalid repeated spam.")
        if re.match(r"^[\d\W_]+$", value):
            raise serializers.ValidationError("Job Description cannot contain only numbers or symbols.")
        return value


class ApplicationSerializer(serializers.ModelSerializer):
    resume = ResumeSerializer(read_only=True)
    candidate_profile = CandidateProfileSerializer(source='resume.candidate', read_only=True)
    job_details = JobDescriptionSerializer(source='job', read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'job', 'job_details', 'resume', 'candidate_profile', 'status', 'match_percentage', 'matched_skills', 'missing_skills', 'created_at']
