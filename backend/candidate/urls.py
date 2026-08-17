from django.urls import path

from .views import  CandidateProfileAPIView, ResumeUploadAPIView , ResumeListAPIView, ResumeDeleteAPIView , ResumeDetailAPIView, JobDescriptionAPIView, ResumeMatchAPIView, ResumeBuildAPIView, ResumeEditAPIView, ResumeConfirmUpdateAPIView, AIJobMatchAPIView



urlpatterns = [

    path(
        "profile/",
        CandidateProfileAPIView.as_view(),
        name="candidate-profile"
    ),

    path(
        "resume/upload/",
        ResumeUploadAPIView.as_view(),
        name="resume-upload"
    ),

    path(
        "resume/",
        ResumeListAPIView.as_view(),
        name="resume-list"
    ),


    path(
    "resume/<int:pk>/detail/",
    ResumeDetailAPIView.as_view(),
    name="resume-detail"
    ),


     path(
        "resume/<int:pk>/", 
        ResumeDeleteAPIView.as_view()),


    path(
    "job-description/",
    JobDescriptionAPIView.as_view(),
    ),

    path(
    "resume/<int:resume_id>/match/<int:job_id>/",
    ResumeMatchAPIView.as_view(),
    ),
    
    path(
    "resume/build/",
    ResumeBuildAPIView.as_view(),
    ),

    path(
    "resume/<int:pk>/edit/",
    ResumeEditAPIView.as_view(),
    ),

    path(
    "resume/<int:pk>/confirm-update/",
    ResumeConfirmUpdateAPIView.as_view(),
    ),
    
    path(
        "job-match/",
        AIJobMatchAPIView.as_view(),
        name="job-match"
    ),
]