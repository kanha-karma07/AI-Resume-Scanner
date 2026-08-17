from django.db import models
from candidate.models import JobDescription
from django.conf import settings

class RecruiterUploadedResume(models.Model):
    STATUS_CHOICES = [
        ('Applied', 'Applied'),
        ('Pending Review', 'Pending Review'),
        ('Shortlisted', 'Shortlisted'),
        ('Interview', 'Interview'),
        ('Selected', 'Selected'),
        ('Offer Sent', 'Offer Sent'),
        ('Hired', 'Hired'),
        ('Rejected', 'Rejected'),
    ]

    job = models.ForeignKey(JobDescription, on_delete=models.CASCADE, related_name='recruiter_resumes')
    candidate_name = models.CharField(max_length=255, blank=True, default="Unknown Candidate")
    candidate_email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=50, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    resume_file = models.FileField(upload_to="recruiter_resumes/")
    
    parsed_text = models.TextField(blank=True)
    skills = models.JSONField(default=list, blank=True)
    education = models.JSONField(default=list, blank=True)
    experience = models.JSONField(default=list, blank=True)
    projects = models.JSONField(default=list, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    
    ats_score = models.IntegerField(default=0)
    match_percentage = models.IntegerField(default=0)
    matched_skills = models.JSONField(default=list, blank=True)
    missing_skills = models.JSONField(default=list, blank=True)
    recommendation = models.CharField(max_length=255, blank=True)
    
    ai_summary = models.TextField(blank=True)
    strengths = models.JSONField(default=list, blank=True)
    weaknesses = models.JSONField(default=list, blank=True)
    risk_level = models.CharField(max_length=50, blank=True)
    
    is_bookmarked = models.BooleanField(default=False)
    expected_salary = models.CharField(max_length=100, blank=True, null=True)
    notice_period = models.CharField(max_length=100, blank=True, null=True)
    availability = models.CharField(max_length=100, blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending Review')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    rejection_reason = models.TextField(blank=True, null=True)
    selected_date = models.DateTimeField(blank=True, null=True)
    hired_date = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.candidate_name} - {self.job.title}"


class CandidateNote(models.Model):
    resume = models.ForeignKey(RecruiterUploadedResume, on_delete=models.CASCADE, related_name='notes')
    recruiter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='candidate_notes')
    content = models.TextField()
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Note by {self.recruiter.username} on {self.resume.candidate_name}"


class RecruiterActivity(models.Model):
    ACTION_CHOICES = [
        ('Viewed', 'Viewed Resume'),
        ('Downloaded', 'Downloaded Resume'),
        ('Shortlisted', 'Shortlisted'),
        ('Rejected', 'Rejected'),
        ('Interview', 'Interview Scheduled'),
        ('Note', 'Added Note'),
        ('Email', 'Sent Email'),
        ('Moved', 'Moved Pipeline Stage'),
    ]
    recruiter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities')
    resume = models.ForeignKey(RecruiterUploadedResume, on_delete=models.CASCADE, related_name='activities', null=True, blank=True)
    action_type = models.CharField(max_length=50, choices=ACTION_CHOICES)
    description = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)


class EmailLog(models.Model):
    STATUS_CHOICES = [
        ('Sent', 'Sent'),
        ('Failed', 'Failed')
    ]
    recruiter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_emails')
    candidate = models.ForeignKey(RecruiterUploadedResume, on_delete=models.CASCADE, related_name='received_emails')
    subject = models.CharField(max_length=255)
    body = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Sent')
    sent_at = models.DateTimeField(auto_now_add=True)
