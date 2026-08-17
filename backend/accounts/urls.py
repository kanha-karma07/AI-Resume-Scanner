from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import RegisterAPIView, RecruiterRegisterAPIView, LoginAPIView

urlpatterns = [
    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),
    path(
        "register/",
        RegisterAPIView.as_view(),
        name="register"
    ),
    path(
        "register/recruiter/",
        RecruiterRegisterAPIView.as_view(),
        name="register_recruiter"
    ),
    path(
        "login/",
        LoginAPIView.as_view(),
        name="login"
    ),

]