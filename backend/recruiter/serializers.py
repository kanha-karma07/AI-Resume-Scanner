from rest_framework import serializers
from .models import RecruiterUploadedResume, CandidateNote, RecruiterActivity, EmailLog
from candidate.serializers import JobDescriptionSerializer

class RecruiterUploadedResumeSerializer(serializers.ModelSerializer):
    job_details = JobDescriptionSerializer(source='job', read_only=True)

    class Meta:
        model = RecruiterUploadedResume
        fields = '__all__'

class CandidateNoteSerializer(serializers.ModelSerializer):
    recruiter_name = serializers.CharField(source='recruiter.full_name', read_only=True)

    class Meta:
        model = CandidateNote
        fields = '__all__'

class RecruiterActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = RecruiterActivity
        fields = '__all__'

class EmailLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailLog
        fields = '__all__'
