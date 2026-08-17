from django.urls import path
from .views import (
    AdminLoginAPIView, AdminDashboardAPIView,
    AdminCandidateListAPIView, AdminCandidateDetailAPIView,
    AdminRecruiterListAPIView, AdminRecruiterDetailAPIView,
    AdminUserListAPIView, AdminResumeListAPIView,
    AdminJDListAPIView, AdminSubscriptionListAPIView,
    AdminAnalyticsAPIView, AdminProfileAPIView
)

urlpatterns = [
    path('login/', AdminLoginAPIView.as_view(), name='admin_login'),
    path('dashboard/', AdminDashboardAPIView.as_view(), name='admin_dashboard'),
    path('candidates/', AdminCandidateListAPIView.as_view(), name='admin_candidates'),
    path('candidates/<int:pk>/', AdminCandidateDetailAPIView.as_view(), name='admin_candidate_detail'),
    path('recruiters/', AdminRecruiterListAPIView.as_view(), name='admin_recruiters'),
    path('recruiters/<int:pk>/', AdminRecruiterDetailAPIView.as_view(), name='admin_recruiter_detail'),
    path('users/', AdminUserListAPIView.as_view(), name='admin_users'),
    path('resumes/', AdminResumeListAPIView.as_view(), name='admin_resumes'),
    path('job-descriptions/', AdminJDListAPIView.as_view(), name='admin_jds'),
    path('subscriptions/', AdminSubscriptionListAPIView.as_view(), name='admin_subscriptions'),
    path('analytics/', AdminAnalyticsAPIView.as_view(), name='admin_analytics'),
    path('profile/', AdminProfileAPIView.as_view(), name='admin_profile'),
]
