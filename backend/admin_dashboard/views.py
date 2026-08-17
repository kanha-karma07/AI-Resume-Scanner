from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.generics import ListAPIView, RetrieveAPIView, UpdateAPIView
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count, Q, Avg

from accounts.models import User, PaymentHistory
from candidate.models import CandidateProfile, Resume, JobDescription
from recruiter.models import RecruiterUploadedResume
from .serializers import (
    AdminUserSerializer, AdminCandidateSerializer, AdminResumeSerializer,
    AdminJobDescriptionSerializer, AdminSubscriptionSerializer
)
from .permissions import IsAdmin

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class AdminLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(email__iexact=email).first()

        if not user or not user.check_password(password):
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        
        if user.role != User.Roles.ADMIN:
            return Response({"error": "Access denied. Admin privileges required."}, status=status.HTTP_403_FORBIDDEN)
        
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Admin Login Successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": AdminUserSerializer(user).data
        }, status=status.HTTP_200_OK)

class AdminDashboardAPIView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        total_candidates = User.objects.filter(role=User.Roles.CANDIDATE).count()
        total_recruiters = User.objects.filter(role=User.Roles.RECRUITER).count()
        total_users = User.objects.count()
        premium_candidates = User.objects.filter(role=User.Roles.CANDIDATE, is_premium=True).count()
        premium_recruiters = User.objects.filter(role=User.Roles.RECRUITER, is_premium=True).count()
        active_subscriptions = PaymentHistory.objects.filter(status="SUCCESS").count()
        total_resumes = Resume.objects.count()
        total_jds = JobDescription.objects.count()
        active_hiring = RecruiterUploadedResume.objects.count()

        return Response({
            "total_candidates": total_candidates,
            "total_recruiters": total_recruiters,
            "total_users": total_users,
            "premium_candidates": premium_candidates,
            "premium_recruiters": premium_recruiters,
            "active_subscriptions": active_subscriptions,
            "total_resumes": total_resumes,
            "total_jds": total_jds,
            "active_hiring": active_hiring
        }, status=status.HTTP_200_OK)

class AdminCandidateListAPIView(ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminCandidateSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = CandidateProfile.objects.all().order_by('-created_at')
        search = self.request.query_params.get('search', None)
        plan = self.request.query_params.get('plan', None)
        
        if search:
            queryset = queryset.filter(
                Q(user__full_name__icontains=search) |
                Q(user__email__icontains=search) |
                Q(user__phone_number__icontains=search)
            )
        if plan:
            if plan.lower() == 'premium':
                queryset = queryset.filter(user__is_premium=True)
            elif plan.lower() == 'freemium':
                queryset = queryset.filter(user__is_premium=False)
                
        return queryset

class AdminCandidateDetailAPIView(RetrieveAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminCandidateSerializer
    queryset = CandidateProfile.objects.all()

class AdminRecruiterListAPIView(ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminUserSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = User.objects.filter(role=User.Roles.RECRUITER).order_by('-created_at')
        search = self.request.query_params.get('search', None)
        plan = self.request.query_params.get('plan', None)
        
        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(company_name__icontains=search)
            )
        if plan:
            if plan.lower() == 'premium':
                queryset = queryset.filter(is_premium=True)
            elif plan.lower() == 'freemium':
                queryset = queryset.filter(is_premium=False)
                
        return queryset

class AdminRecruiterDetailAPIView(RetrieveAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminUserSerializer
    queryset = User.objects.filter(role=User.Roles.RECRUITER)

class AdminUserListAPIView(ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminUserSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = User.objects.all().order_by('-created_at')
        search = self.request.query_params.get('search', None)
        role = self.request.query_params.get('role', None)
        
        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(email__icontains=search)
            )
        if role:
            queryset = queryset.filter(role__iexact=role)
            
        return queryset

class AdminResumeListAPIView(ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminResumeSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = Resume.objects.all().order_by('-uploaded_at')
        search = self.request.query_params.get('search', None)
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(candidate__user__full_name__icontains=search)
            )
        return queryset

class AdminJDListAPIView(ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminJobDescriptionSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = JobDescription.objects.all().order_by('-created_at')
        search = self.request.query_params.get('search', None)
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(company_name__icontains=search) |
                Q(recruiter__full_name__icontains=search)
            )
        return queryset

class AdminSubscriptionListAPIView(ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminSubscriptionSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = PaymentHistory.objects.all().order_by('-date')
        search = self.request.query_params.get('search', None)
        plan = self.request.query_params.get('plan', None)
        
        if search:
            queryset = queryset.filter(
                Q(user__full_name__icontains=search) |
                Q(user__email__icontains=search)
            )
        if plan:
            queryset = queryset.filter(plan__icontains=plan)
            
        return queryset

class AdminAnalyticsAPIView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        user_counts = User.objects.values('role').annotate(count=Count('id'))
        
        total_resumes = Resume.objects.count()
        avg_ats_score = Resume.objects.aggregate(Avg('ats_score'))['ats_score__avg'] or 0
        success_parsing = Resume.objects.filter(status='Completed').count()
        failed_parsing = Resume.objects.filter(status='Failed').count()
        
        recruiter_pipeline = RecruiterUploadedResume.objects.values('status').annotate(count=Count('id'))
        
        return Response({
            "user_analytics": user_counts,
            "resume_analytics": {
                "total": total_resumes,
                "avg_ats": round(avg_ats_score, 2),
                "success": success_parsing,
                "failed": failed_parsing
            },
            "pipeline_analytics": recruiter_pipeline
        }, status=status.HTTP_200_OK)

class AdminProfileAPIView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        serializer = AdminUserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
