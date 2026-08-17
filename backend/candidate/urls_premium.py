from django.urls import path
from .views_premium import (
    DemoPaymentAPIView, PremiumStatusAPIView, ResetPremiumAPIView, PaymentHistoryAPIView,
    AIGenerateAPIView, AIEnhanceAPIView,
    AICareerInsightsAPIView, AICoverLetterAPIView, AIInterviewPrepAPIView,
    AdvancedATSAPIView, CompareResumeAPIView, CreateRazorpayOrderAPIView, VerifyRazorpayPaymentAPIView
)

urlpatterns = [
    path('demo-payment/', DemoPaymentAPIView.as_view(), name='demo-payment'),
    path('payment-history/', PaymentHistoryAPIView.as_view(), name='payment-history'),
    path('create-order/', CreateRazorpayOrderAPIView.as_view(), name='create-order'),
    path('verify-payment/', VerifyRazorpayPaymentAPIView.as_view(), name='verify-payment'),
    path('status/', PremiumStatusAPIView.as_view(), name='premium-status'),
    path('reset/', ResetPremiumAPIView.as_view(), name='reset-premium'),
    
    path('generate/', AIGenerateAPIView.as_view(), name='ai-generate'),
    path('enhance/', AIEnhanceAPIView.as_view(), name='ai-enhance'),
    path('career-insights/', AICareerInsightsAPIView.as_view(), name='career-insights'),
    path('cover-letter/', AICoverLetterAPIView.as_view(), name='cover-letter'),
    path('interview-prep/', AIInterviewPrepAPIView.as_view(), name='interview-prep'),
    path('advanced-ats/', AdvancedATSAPIView.as_view(), name='advanced-ats'),
    path('compare/', CompareResumeAPIView.as_view(), name='compare-resume'),
]
