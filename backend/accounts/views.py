from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import CandidateRegisterSerializer, RecruiterRegisterSerializer, LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = CandidateRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Candidate Registered Successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RecruiterRegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = RecruiterRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Recruiter Registered Successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():

            user = serializer.validated_data["user"]

            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "message": "Login Successful",

                    "access": str(refresh.access_token),

                    "refresh": str(refresh),

                    "role": user.role,
                    
                    "is_premium": user.is_premium,
                    
                    "membership_type": user.membership_type,

                    "subscriptionStatus": user.subscription_status,
                    
                    "plan": user.plan,
                    
                    "paymentStatus": user.payment_status,
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
