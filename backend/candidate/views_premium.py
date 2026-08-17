from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from accounts.models import PaymentHistory
from django.utils import timezone
from datetime import timedelta
import uuid

from django.conf import settings

class DemoPaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not settings.DEBUG:
            return Response({"error": "This endpoint is disabled in production."}, status=status.HTTP_403_FORBIDDEN)
            
        user = request.user
        transaction_id = request.data.get("transaction_id", "DEMO_" + str(uuid.uuid4())[:8])
        order_id = request.data.get("order_id", "DEMO_ORDER_" + str(uuid.uuid4())[:8])
        
        # Simulate payment success
        # In the future, this is where Stripe/Razorpay checkout session validation goes
        
        user.is_premium = True
        user.subscription_status = "ACTIVE"
        user.plan = "PREMIUM"
        user.payment_status = "SUCCESS"
        user.membership_start_date = timezone.now()
        user.membership_end_date = timezone.now() + timedelta(days=30)
        user.save()

        # Create Payment History
        PaymentHistory.objects.create(
            user=user,
            plan="PREMIUM",
            amount=499.00,
            status="SUCCESS",
            payment_type="DEMO",
            order_id=order_id,
            payment_id=transaction_id
        )

        return Response({
            "message": "Payment Successful. Premium Activated.",
            "is_premium": user.is_premium,
            "subscription_status": user.subscription_status,
            "plan": user.plan,
        }, status=status.HTTP_200_OK)


class PremiumStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "is_premium": user.is_premium,
            "subscription_status": user.subscription_status,
            "plan": user.plan,
            "membership_start_date": user.membership_start_date,
            "membership_end_date": user.membership_end_date,
        }, status=status.HTTP_200_OK)


class ResetPremiumAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        
        user.is_premium = False
        user.subscription_status = "FREE"
        user.plan = "FREE"
        user.payment_status = "PENDING"
        user.membership_start_date = None
        user.membership_end_date = None
        user.save()

        return Response({
            "message": "Premium status reset to FREE.",
            "is_premium": user.is_premium,
            "subscription_status": user.subscription_status,
            "plan": user.plan,
        }, status=status.HTTP_200_OK)

class PaymentHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        history = PaymentHistory.objects.filter(user=request.user).order_by('-date')
        data = []
        for h in history:
            data.append({
                "id": str(h.id),
                "plan": h.plan,
                "amount": str(h.amount),
                "status": h.status,
                "date": h.date.isoformat(),
                "payment_type": h.payment_type,
                "order_id": h.order_id,
                "payment_id": h.payment_id,
            })
        return Response(data, status=status.HTTP_200_OK)

from .ai_service import AIService
from .models import Resume
from django.shortcuts import get_object_or_404

class AIGenerateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_premium:
            return Response({"error": "Premium access required"}, status=status.HTTP_403_FORBIDDEN)
        
        section = request.data.get("section")
        prompt = request.data.get("prompt", "")
        
        ai = AIService()
        content = ai.generate_section(section, prompt)
        
        return Response({"generated_content": content}, status=status.HTTP_200_OK)

class AIEnhanceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_premium:
            return Response({"error": "Premium access required"}, status=status.HTTP_403_FORBIDDEN)
            
        original_text = request.data.get("original_text", "")
        section = request.data.get("section", "General")
        instruction = request.data.get("instruction", "Improve professional tone")
        
        ai = AIService()
        improved_text = ai.edit_resume(original_text, section, instruction)
        
        return Response({"improved_text": improved_text}, status=status.HTTP_200_OK)

class AICareerInsightsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_premium:
            return Response({"error": "Premium access required"}, status=status.HTTP_403_FORBIDDEN)
            
        # Get user's latest resume or use a dummy
        resume = Resume.objects.filter(candidate__user=request.user).last()
        resume_text = resume.parsed_text if resume else "Generic Professional Profile"
        
        ai = AIService()
        insights = ai.generate_insights(resume_text)
        
        return Response(insights, status=status.HTTP_200_OK)

class AICoverLetterAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_premium:
            return Response({"error": "Premium access required"}, status=status.HTTP_403_FORBIDDEN)
            
        company_name = request.data.get("company_name", "Company")
        role = request.data.get("role", "Role")
        job_desc = request.data.get("job_description", "")
        
        resume = Resume.objects.filter(candidate__user=request.user).last()
        resume_text = resume.parsed_text if resume else "Generic Professional Profile"
        
        ai = AIService()
        cover_letter = ai.generate_cover_letter(resume_text, company_name, role, job_desc)
        
        return Response({"cover_letter": cover_letter}, status=status.HTTP_200_OK)

class AIInterviewPrepAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_premium:
            return Response({"error": "Premium access required"}, status=status.HTTP_403_FORBIDDEN)
            
        resume = Resume.objects.filter(candidate__user=request.user).last()
        resume_text = resume.parsed_text if resume else "Generic Professional Profile"
        
        ai = AIService()
        questions = ai.generate_interview_questions(resume_text)
        
        return Response(questions, status=status.HTTP_200_OK)

class AdvancedATSAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_premium:
            return Response({"error": "Premium access required"}, status=status.HTTP_403_FORBIDDEN)
            
        resume = Resume.objects.filter(candidate__user=request.user).last()
        
        if not resume:
            return Response({"error": "No resume found. Please upload a resume first."}, status=status.HTTP_404_NOT_FOUND)
            
        # Parse breakdown string like "15/30" into percentage score
        def get_score_pct(key, max_score):
            val = resume.ats_breakdown.get(key, f"0/{max_score}")
            try:
                num = float(val.split("/")[0])
                return int((num / max_score) * 100)
            except:
                return 0
                
        ats_data = {
            "overall_score": resume.ats_score,
            "skills_score": get_score_pct("Skills", 30),
            "formatting_score": get_score_pct("Structure", 10),
            "experience_score": get_score_pct("Experience", 20),
            "education_score": get_score_pct("Education", 15),
            "keyword_density": "Optimal (3.5%)", # Not critical for exact matching, keeping static
            "matched_keywords": resume.skills[:5] if resume.skills else [],
            "missing_keywords": [],
            "suggestions": resume.suggestions,
            # Add these new fields for frontend
            "skills": resume.skills,
            "projects": resume.projects,
            "experience": resume.experience_data,
            "education": resume.education_data
        }
        
        return Response(ats_data, status=status.HTTP_200_OK)

class CompareResumeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_premium:
            return Response({"error": "Premium access required"}, status=status.HTTP_403_FORBIDDEN)
            
        resume_a_id = request.data.get("resume_a_id")
        resume_b_id = request.data.get("resume_b_id")
        
        # If IDs provided, fetch them, otherwise use dummy text
        text_a = "Resume A"
        text_b = "Resume B"
        
        if resume_a_id and resume_b_id:
            try:
                res_a = Resume.objects.get(id=resume_a_id, candidate__user=request.user)
                res_b = Resume.objects.get(id=resume_b_id, candidate__user=request.user)
                text_a = res_a.parsed_text
                text_b = res_b.parsed_text
            except Resume.DoesNotExist:
                return Response({"error": "Resume not found or access denied"}, status=status.HTTP_404_NOT_FOUND)
                
        ai = AIService()
        comparison = ai.compare_resumes(text_a, text_b)
        
        return Response(comparison, status=status.HTTP_200_OK)

import razorpay
from django.conf import settings
import traceback

class CreateRazorpayOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
                return Response({'error': 'Razorpay credentials not configured'}, status=status.HTTP_401_UNAUTHORIZED)
                
            if settings.RAZORPAY_KEY_ID.startswith('dummy') or settings.RAZORPAY_KEY_SECRET.startswith('dummy') or 'dummy' in settings.RAZORPAY_KEY_ID:
                return Response({'error': 'Invalid or dummy Razorpay credentials'}, status=status.HTTP_401_UNAUTHORIZED)

            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            amount = 49900  # 499 INR in paise
            order_data = {
                'amount': amount,
                'currency': 'INR',
                'receipt': f'receipt_{request.user.id}_{int(timezone.now().timestamp())}',
            }
            order = client.order.create(data=order_data)
            return Response(order, status=status.HTTP_200_OK)
        except razorpay.errors.BadRequestError as e:
            return Response({'error': 'Razorpay Authentication failed or bad request', 'details': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            error_trace = traceback.format_exc()
            print("====================================")
            print("CREATE RAZORPAY ORDER EXCEPTION")
            print("====================================")
            print(f"User: {request.user}")
            print(f"Request Data: {request.data}")
            print(f"RAZORPAY_KEY_ID Loaded: {bool(settings.RAZORPAY_KEY_ID)}")
            print(f"RAZORPAY_KEY_SECRET Loaded: {bool(settings.RAZORPAY_KEY_SECRET)}")
            print(f"Amount: 49900")
            print(f"Currency: INR")
            print("Payload sent to Razorpay:")
            print({'amount': 49900, 'currency': 'INR', 'receipt': f'receipt_{request.user.id}_{int(timezone.now().timestamp())}'})
            print("Exception Traceback:")
            print(error_trace)
            print("====================================")
            return Response({
                'error': str(e),
                'traceback': error_trace
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyRazorpayPaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            
            payment_id = request.data.get('razorpay_payment_id')
            order_id = request.data.get('razorpay_order_id')
            signature = request.data.get('razorpay_signature')
            
            params_dict = {
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            }
            
            # verify signature
            client.utility.verify_payment_signature(params_dict)
            
            user = request.user
            user.is_premium = True
            user.subscription_status = "ACTIVE"
            user.plan = "PREMIUM"
            user.payment_status = "SUCCESS"
            user.membership_start_date = timezone.now()
            user.membership_end_date = timezone.now() + timedelta(days=30)
            user.save()

            # Create Payment History
            PaymentHistory.objects.create(
                user=user,
                plan="PREMIUM",
                amount=499.00,
                status="SUCCESS",
                payment_type="RAZORPAY",
                order_id=order_id,
                payment_id=payment_id,
                signature=signature
            )

            return Response({
                "message": "Payment Successful. Premium Activated.",
                "is_premium": user.is_premium,
                "subscription_status": user.subscription_status,
                "plan": user.plan,
            }, status=status.HTTP_200_OK)
        except razorpay.errors.SignatureVerificationError:
            return Response({'error': 'Invalid Payment Signature'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
