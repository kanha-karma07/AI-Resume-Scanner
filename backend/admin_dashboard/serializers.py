from rest_framework import serializers
from accounts.models import User, PaymentHistory
from candidate.models import CandidateProfile, Resume
from recruiter.models import RecruiterUploadedResume
from candidate.models import JobDescription

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'company_name', 'phone_number', 'role', 'is_premium', 'plan', 'subscription_status', 'created_at']

class AdminCandidateSerializer(serializers.ModelSerializer):
    user = AdminUserSerializer(read_only=True)
    resume_count = serializers.SerializerMethodField()
    profile_completion = serializers.SerializerMethodField()

    class Meta:
        model = CandidateProfile
        fields = '__all__'

    def get_resume_count(self, obj):
        return obj.resumes.count()
        
    def get_profile_completion(self, obj):
        # basic completion calc
        fields = [obj.profile_image, obj.date_of_birth, obj.gender, obj.address, obj.college, obj.degree, obj.experience, obj.bio]
        filled = sum(1 for f in fields if f)
        return int((filled / len(fields)) * 100) if fields else 0

class AdminResumeSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='candidate.user.full_name', read_only=True)
    candidate_email = serializers.CharField(source='candidate.user.email', read_only=True)

    class Meta:
        model = Resume
        fields = ['id', 'title', 'status', 'ats_score', 'uploaded_at', 'candidate_name', 'candidate_email', 'resume_file']

class AdminJobDescriptionSerializer(serializers.ModelSerializer):
    recruiter_name = serializers.CharField(source='recruiter.full_name', read_only=True)
    recruiter_company = serializers.CharField(source='recruiter.company_name', read_only=True)
    
    class Meta:
        model = JobDescription
        fields = ['id', 'title', 'company_name', 'location', 'employment_type', 'experience', 'salary', 'status', 'created_at', 'recruiter_name', 'recruiter_company']

class AdminSubscriptionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    
    class Meta:
        model = PaymentHistory
        fields = ['id', 'user_name', 'user_email', 'user_role', 'plan', 'amount', 'status', 'date', 'payment_type']
