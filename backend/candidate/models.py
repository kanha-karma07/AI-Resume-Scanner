from django.db import models
from django.conf import settings


class CandidateProfile(models.Model):

    GENDER_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
        ("Other", "Other"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="candidate_profile"
    )

    profile_image = models.ImageField(
        upload_to="profile_images/",
        blank=True,
        null=True
    )

    date_of_birth = models.DateField(
        blank=True,
        null=True
    )

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        blank=True
    )

    address = models.TextField(
        blank=True
    )

    college = models.CharField(
        max_length=255,
        blank=True
    )

    degree = models.CharField(
        max_length=255,
        blank=True
    )

    experience = models.PositiveIntegerField(
        default=0,
        help_text="Experience in Years"
    )

    linkedin = models.URLField(
        blank=True
    )

    github = models.URLField(
        blank=True
    )

    portfolio = models.URLField(
        blank=True
    )

    bio = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.user.username


class Resume(models.Model):

    STATUS_CHOICES = [
        ("Uploaded", "Uploaded"),
        ("Processing", "Processing"),
        ("Completed", "Completed"),
        ("Failed", "Failed"),
    ]

    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name="resumes"
    )

    title = models.CharField(
        max_length=255
    )

    resume_file = models.FileField(
        upload_to="resumes/"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Uploaded"
    )

    parsed_text = models.TextField(
        blank=True
    )

    skills = models.JSONField(
        default=list,
        blank=True
    )

    education_data = models.JSONField(
        default=dict,
        blank=True
    )

    experience_data = models.JSONField(
        default=dict,
        blank=True
    )

    projects = models.JSONField(
        default=list,
        blank=True
    )

    certifications = models.JSONField(
        default=list,
        blank=True
    )

    languages = models.JSONField(
        default=list,
        blank=True
    )

    ats_score = models.IntegerField(
        default=0
    )

    ats_breakdown = models.JSONField(
        default=dict,
        blank=True
    )

    suggestions = models.JSONField(
        default=list,
        blank=True
    )

    matched_skills = models.JSONField(
        default=list,
        blank=True
    )

    missing_skills = models.JSONField(
        default=list,
        blank=True
    )

    match_percentage = models.IntegerField(
        default=0
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.title


class JobDescription(models.Model):

    EMPLOYMENT_CHOICES = [
        ("Full Time", "Full Time"),
        ("Part Time", "Part Time"),
        ("Internship", "Internship"),
        ("Contract", "Contract"),
    ]

    STATUS_CHOICES = [
        ("Active", "Active"),
        ("Closed", "Closed"),
    ]

    recruiter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="job_descriptions",
        null=True,
        blank=True
    )

    title = models.CharField(max_length=255)

    company_name = models.CharField(
        max_length=255,
        blank=True,
        default=""
    )

    location = models.CharField(max_length=255, blank=True, default="")

    employment_type = models.CharField(
        max_length=50,
        choices=EMPLOYMENT_CHOICES,
        blank=True,
        default="Full Time"
    )

    experience = models.CharField(max_length=100, blank=True, default="")

    salary = models.CharField(
        max_length=100,
        blank=True,
        default=""
    )

    description = models.TextField()

    skills = models.JSONField(
        default=list,
        blank=True
    )

    requirements = models.JSONField(
        default=list,
        blank=True
    )

    responsibilities = models.JSONField(
        default=list,
        blank=True
    )

    benefits = models.JSONField(
        default=list,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Active"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.title


class Application(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Shortlisted', 'Shortlisted'),
        ('Rejected', 'Rejected'),
    ]
    job = models.ForeignKey(JobDescription, on_delete=models.CASCADE, related_name='applications')
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    match_percentage = models.IntegerField(default=0)
    matched_skills = models.JSONField(default=list, blank=True)
    missing_skills = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('job', 'resume')

    def __str__(self):
        return f"{self.resume.candidate.user.username} - {self.job.title}"


class JobMatchAnalysis(models.Model):
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='job_match_analyses')
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='job_match_analyses', null=True, blank=True)
    job_description = models.TextField()
    result = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Match Analysis for {self.candidate.user.username} at {self.created_at}"

