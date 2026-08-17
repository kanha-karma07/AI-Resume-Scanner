from django.urls import path
from .views import (
    JobDescriptionAPIView, 
    JobDescriptionDetailAPIView,
    RecruiterResumeUploadAPIView,
    RecruiterJobResumesAPIView,
    RecruiterAllResumesAPIView,
    RecruiterResumeDetailAPIView,
    RecruiterResumeStatusAPIView,
    RecruiterBulkActionAPIView,
    RecruiterNotesAPIView,
    RecruiterFavoritesAPIView,
    RecruiterActivityTimelineAPIView,
    RecruiterAnalyticsAPIView,
    AIGenerateJobDescriptionAPIView,
    RecruiterProfileAPIView,
    RecruiterAIInterviewQuestionsAPIView
)

urlpatterns = [
    path("job-description/", JobDescriptionAPIView.as_view(), name="recruiter-job-description-list-create"),
    path("job-description/<int:pk>/", JobDescriptionDetailAPIView.as_view(), name="recruiter-job-description-detail"),
    path("job-description/<int:job_id>/upload-resume/", RecruiterResumeUploadAPIView.as_view(), name="recruiter-resume-upload"),
    path("job-description/<int:job_id>/resumes/", RecruiterJobResumesAPIView.as_view(), name="recruiter-job-resumes"),
    path("resumes/", RecruiterAllResumesAPIView.as_view(), name="recruiter-all-resumes"),
    path("resume/<int:resume_id>/", RecruiterResumeDetailAPIView.as_view(), name="recruiter-resume-detail"),
    
    path("resume-status/", RecruiterResumeStatusAPIView.as_view(), name="recruiter-resume-status"),
    path("bulk-action/", RecruiterBulkActionAPIView.as_view(), name="recruiter-bulk-action"),
    
    path("resume/<int:resume_id>/notes/", RecruiterNotesAPIView.as_view(), name="recruiter-notes"),
    path("resume/<int:resume_id>/favorite/", RecruiterFavoritesAPIView.as_view(), name="recruiter-favorite"),
    path("resume/<int:resume_id>/timeline/", RecruiterActivityTimelineAPIView.as_view(), name="recruiter-timeline"),
    path("resume/<int:resume_id>/interview-questions/", RecruiterAIInterviewQuestionsAPIView.as_view(), name="recruiter-interview-questions"),
    
    path("analytics/", RecruiterAnalyticsAPIView.as_view(), name="recruiter-analytics"),
    
    path("ai-generate-jd/", AIGenerateJobDescriptionAPIView.as_view(), name="recruiter-ai-generate-jd"),
    path("profile/", RecruiterProfileAPIView.as_view(), name="recruiter-profile"),
]
