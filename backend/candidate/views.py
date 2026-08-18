import json
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import status
from .models import CandidateProfile , Resume , JobDescription
from .serializers import CandidateProfileSerializer, ResumeSerializer , JobDescriptionSerializer 
from .utils import extract_jd_skills, match_resume_with_jd
from .services import analyze_resume
from .ai_service import AIService
from django.core.files.base import ContentFile

class CandidateProfileAPIView(APIView):

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        if str(request.user.role).lower() != "candidate":
            return Response({"error": "Only candidates have candidate profiles."}, status=status.HTTP_403_FORBIDDEN)
            
        profile, created = CandidateProfile.objects.get_or_create(user=request.user)

        serializer = CandidateProfileSerializer(profile, context={"request": request})

        return Response(serializer.data)

    def put(self, request):
        if str(request.user.role).lower() != "candidate":
            return Response({"error": "Only candidates have candidate profiles."}, status=status.HTTP_403_FORBIDDEN)
            
        profile, created = CandidateProfile.objects.get_or_create(user=request.user)

        # 2. Ignore empty strings for untouched fields
        if hasattr(request.data, 'copy'):
            cleaned_data = request.data.copy()
        else:
            import copy
            cleaned_data = copy.deepcopy(request.data)
            
        keys_to_remove = []
        for key in cleaned_data.keys():
            if cleaned_data.get(key) == "":
                keys_to_remove.append(key)
                
        for key in keys_to_remove:
            cleaned_data.pop(key)

        # 1. Use partial updates correctly
        serializer = CandidateProfileSerializer(
            profile,
            data=cleaned_data,
            partial=True,
            context={"request": request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response({
                "success": True,
                "message": "Profile updated successfully",
                "profile": serializer.data
            }, status=status.HTTP_200_OK)
        
        print("SERIALIZER ERRORS:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)    

class ResumeUploadAPIView(APIView):

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

     

    def post(self, request):
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info("=== STARTING RESUME UPLOAD ===")

        profile = CandidateProfile.objects.get(user=request.user)
        serializer = ResumeSerializer(data=request.data)

        if serializer.is_valid():
            resume = serializer.save(candidate=profile)
            logger.info(f"Resume uploaded. File path: {resume.resume_file.path}")

            try:
                analysis = analyze_resume(resume.resume_file.path)
                
                # Check for empty analysis
                if not analysis.get("parsed_text") or analysis.get("ats_score", 0) == 0:
                    logger.warning("AI Engine returned empty text or ATS=0. Parsing might have failed.")
                
                logger.info(f"Parsed skills: {analysis.get('skills', [])}")
                logger.info(f"Parsed education: {analysis.get('education_data', {})}")
                logger.info(f"Parsed experience: {analysis.get('experience_data', {})}")
                logger.info(f"ATS score: {analysis.get('ats_score', 0)}")
                
                logger.info(f"Parsed projects: {len(analysis.get('projects', []))} found")
                
                resume.parsed_text = analysis.get("parsed_text", "")
                resume.skills = analysis.get("skills", [])
                resume.education_data = analysis.get("education", [])
                resume.experience_data = analysis.get("experience", [])
                resume.projects = analysis.get("projects", [])
                resume.certifications = analysis.get("certifications", [])
                resume.languages = analysis.get("languages", [])
                resume.ats_score = analysis.get("ats_score", 0)
                resume.ats_breakdown = analysis.get("ats_breakdown", {})
                resume.suggestions = analysis.get("suggestions", [])

                logger.info("Database save: Updating parsed data into Resume model.")
                resume.status = "Completed"
                resume.save()

                # CRITICAL VERIFICATION: Ensure data actually persisted
                resume.refresh_from_db()
                logger.info(f"VERIFICATION - Reloaded Status: {resume.status}, Reloaded ATS: {resume.ats_score}")
                
                if resume.status != "Completed":
                    logger.error("Database save failed: Status did not update to Completed.")
                    raise Exception("Database verification failed. Status remains Uploaded.")

                if not resume.skills and analysis.get("skills"):
                    logger.error("Database save failed: Skills were lost during save.")
                    raise Exception("Database verification failed. Skills not saved.")

                return Response(
                    ResumeSerializer(resume).data,
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                import traceback
                error_trace = traceback.format_exc()
                logger.error(f"Resume analysis failed:\nHTTP Status: 503\nFull Response: {str(e)}\nComplete Traceback:\n{error_trace}")
                
                resume.status = "Failed"
                resume.save()
                
                return Response(
                    {"message": "Resume Analysis Service is currently unavailable."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class ResumeListAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        profile = CandidateProfile.objects.get(
            user=request.user
        )

        resumes = Resume.objects.filter(
            candidate=profile
        ).order_by("-uploaded_at")

        serializer = ResumeSerializer(
            resumes,
            many=True
        )

        return Response(serializer.data)         

class ResumeDeleteAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):

        profile = CandidateProfile.objects.get(
            user=request.user
        )

        resume = Resume.objects.get(
            id=pk,
            candidate=profile
        )

        resume.delete()

        return Response(
            {
                "message": "Resume deleted successfully."
            },
            status=status.HTTP_200_OK
        )       


# class ResumeDetailAPIView(APIView):

#     permission_classes = [IsAuthenticated]

#     def get(self, request, pk):

#         profile = CandidateProfile.objects.get(
#             user=request.user
#         )

#         resume = Resume.objects.get(
#             id=pk,
#             candidate=profile
#         )

#         serializer = ResumeSerializer(resume)

#         return Response(serializer.data)



class ResumeDetailAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        # print("=" * 50)
        # print("USER =>", request.user)
        # print("PK =>", pk)

        profile = CandidateProfile.objects.get(
            user=request.user
        )

        resumes = Resume.objects.filter(candidate=profile)

        resume = Resume.objects.get(
            id=pk,
            candidate=profile
        )

        serializer = ResumeSerializer(resume)

        return Response(serializer.data)



class JobDescriptionAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        jobs = JobDescription.objects.filter(status="Active").order_by("-created_at")

        serializer = JobDescriptionSerializer(
            jobs,
            many=True
        )

        return Response(serializer.data)


class ResumeMatchAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, resume_id, job_id):

        profile = CandidateProfile.objects.get(
            user=request.user
        )

        resume = Resume.objects.get(
            id=resume_id,
            candidate=profile
        )

        job = JobDescription.objects.get(
            id=job_id
        )

        result = match_resume_with_jd(
            resume,
            job
        )

        resume.matched_skills = result["matched_skills"]
        resume.missing_skills = result["missing_skills"]
        resume.match_percentage = result["match_percentage"]

        resume.save()

        return Response(result)
    

class ResumeBuildAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_premium:
            return Response({"error": "Premium subscription required"}, status=status.HTTP_403_FORBIDDEN)
            
        profile = CandidateProfile.objects.get(user=request.user)
        ai = AIService()
        
        try:
            generated_data = ai.build_resume(request.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Flatten skills if it's a dict
        skills_dict = generated_data.get("skills", {})
        flat_skills = []
        if isinstance(skills_dict, dict):
            for k, v in skills_dict.items():
                flat_skills.extend(v)
        else:
            flat_skills = skills_dict

        title = generated_data.get("personalDetails", {}).get("name", "Generated Resume") + " - Built"
        resume = Resume(
            candidate=profile,
            title=title,
            status="Completed",
            parsed_text=json.dumps(generated_data),
            skills=flat_skills,
            ats_score=90 # Default high score for AI built resumes
        )
        
        file_name = f"built_resume_{profile.id}.json"
        resume.resume_file.save(file_name, ContentFile(json.dumps(generated_data).encode('utf-8')))
        resume.save()
        
        return Response({
            "resume_id": resume.id,
            "resume_data": generated_data,
            "message": "Resume successfully generated"
        }, status=status.HTTP_201_CREATED)


class ResumeEditAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not request.user.is_premium:
            return Response({"error": "Premium subscription required"}, status=status.HTTP_403_FORBIDDEN)
            
        profile = CandidateProfile.objects.get(user=request.user)
        try:
            resume = Resume.objects.get(id=pk, candidate=profile)
        except Resume.DoesNotExist:
            return Response({"error": "Resume not found"}, status=status.HTTP_404_NOT_FOUND)
            
        section = request.data.get("section", "General")
        instruction = request.data.get("instruction", "Improve professional tone")
        
        ai = AIService()
        
        try:
            # parsed_text should be JSON for resumes created by AI Resume Builder
            original_data = json.loads(resume.parsed_text) if isinstance(resume.parsed_text, str) else resume.parsed_text
        except Exception:
            return Response({"error": "Resume data is not in a valid format for AI Editing. Please use a resume built with the AI Builder."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get the modified partial JSON
            modified_section_data = ai.edit_resume(original_data, section, instruction)
            
            # Merge into the original
            new_data = dict(original_data)
            if isinstance(modified_section_data, dict):
                for key, value in modified_section_data.items():
                    new_data[key] = value
                    
            return Response({"improved_text": new_data})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ResumeConfirmUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not request.user.is_premium:
            return Response({"error": "Premium subscription required"}, status=status.HTTP_403_FORBIDDEN)
            
        profile = CandidateProfile.objects.get(user=request.user)
        try:
            original_resume = Resume.objects.get(id=pk, candidate=profile)
        except Resume.DoesNotExist:
            return Response({"error": "Resume not found"}, status=status.HTTP_404_NOT_FOUND)
            
        updated_text = request.data.get("updated_text")
        if not updated_text:
            return Response({"error": "updated_text is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        import json
        if isinstance(updated_text, dict) or isinstance(updated_text, list):
            parsed_json_str = json.dumps(updated_text)
        else:
            parsed_json_str = updated_text
            
        # Create a new resume version (History)
        new_resume = Resume(
            candidate=profile,
            title=original_resume.title + " (AI Updated)",
            status="Completed",
            parsed_text=parsed_json_str,
            skills=original_resume.skills,
            ats_score=original_resume.ats_score,
            education_data=original_resume.education_data,
            experience_data=original_resume.experience_data
        )
        
        file_name = f"ai_updated_{original_resume.id}.json"
        new_resume.resume_file.save(file_name, ContentFile(parsed_json_str.encode('utf-8')))
        new_resume.save()
        
        return Response(ResumeSerializer(new_resume).data, status=status.HTTP_201_CREATED)


from django.utils import timezone
from .models import JobMatchAnalysis
import requests

class AIJobMatchAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = CandidateProfile.objects.get(user=user)
        
        # Freemium Limit Check
        if not user.is_premium:
            today = timezone.now().date()
            analysis_count = JobMatchAnalysis.objects.filter(
                candidate=profile,
                created_at__date=today
            ).count()
            if analysis_count >= 3:
                return Response(
                    {"error": "Free limit reached. You can only run 3 AI Job Matches per day. Upgrade to Premium for unlimited access."},
                    status=status.HTTP_403_FORBIDDEN
                )

        resume_id = request.data.get("resume_id")
        job_description = request.data.get("job_description")

        if not resume_id or not job_description:
            return Response({"error": "resume_id and job_description are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            resume = Resume.objects.get(id=resume_id, candidate=profile)
        except Resume.DoesNotExist:
            return Response({"error": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)

        resume_text = resume.parsed_text
        if not resume_text:
            return Response({"error": "Resume text is empty. Please ensure the resume was parsed successfully."}, status=status.HTTP_400_BAD_REQUEST)

        # Send to AI Engine
        FASTAPI_URL = os.environ.get("AI_ENGINE_URL", "http://127.0.0.1:8001") + "/analyze-job-match"
        try:
            ai_response = requests.post(FASTAPI_URL, json={
                "resume_text": resume_text,
                "job_description": job_description
            })
            if ai_response.status_code != 200:
                return Response({"error": f"AI Engine Failed: {ai_response.text}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            result_json = ai_response.json()
        except Exception as e:
            return Response({"error": f"Could not connect to AI Engine: {str(e)}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # Save to DB
        analysis = JobMatchAnalysis.objects.create(
            candidate=profile,
            resume=resume,
            job_description=job_description,
            result=result_json
        )

        return Response(result_json, status=status.HTTP_200_OK)



