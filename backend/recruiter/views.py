import requests
import json
import re
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q, Count, Avg
from django.utils import timezone

from candidate.models import JobDescription
from candidate.serializers import JobDescriptionSerializer
from candidate.utils import extract_jd_skills, extract_text_from_pdf, clean_resume_text, extract_skills, calculate_match_percentage, get_matching_skills, get_missing_skills
from .models import RecruiterUploadedResume, CandidateNote, RecruiterActivity, EmailLog
from .serializers import RecruiterUploadedResumeSerializer, CandidateNoteSerializer, RecruiterActivitySerializer

AI_ENGINE_URL = "http://localhost:8001"

class JobDescriptionAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if request.user.role != "recruiter": return Response({"error": "Unauthorized"}, status=403)
        serializer = JobDescriptionSerializer(data=request.data)
        if serializer.is_valid():
            job = serializer.save(recruiter=request.user)
            if not job.skills:
                job.skills = extract_jd_skills(job.description)
            job.save()
            return Response(JobDescriptionSerializer(job).data, status=201)
        return Response(serializer.errors, status=400)

    def get(self, request):
        if request.user.role != "recruiter": return Response({"error": "Unauthorized"}, status=403)
        jobs = JobDescription.objects.filter(recruiter=request.user).order_by("-created_at")
        return Response(JobDescriptionSerializer(jobs, many=True).data)

class JobDescriptionDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        if request.user.role != "recruiter": return Response({"error": "Unauthorized"}, status=403)
        try:
            job = JobDescription.objects.get(pk=pk, recruiter=request.user)
            return Response(JobDescriptionSerializer(job).data)
        except: return Response({"error": "Not found"}, status=404)

    def put(self, request, pk):
        if request.user.role != "recruiter": return Response({"error": "Unauthorized"}, status=403)
        try:
            job = JobDescription.objects.get(pk=pk, recruiter=request.user)
            serializer = JobDescriptionSerializer(job, data=request.data, partial=True)
            if serializer.is_valid():
                updated_job = serializer.save()
                if not updated_job.skills: updated_job.skills = extract_jd_skills(updated_job.description)
                updated_job.save()
                return Response(JobDescriptionSerializer(updated_job).data)
            return Response(serializer.errors, status=400)
        except: return Response({"error": "Not found"}, status=404)

    def delete(self, request, pk):
        if request.user.role != "recruiter": return Response({"error": "Unauthorized"}, status=403)
        try:
            job = JobDescription.objects.get(pk=pk, recruiter=request.user)
            job.delete()
            return Response({"message": "Deleted"}, status=200)
        except: return Response({"error": "Not found"}, status=404)

class RecruiterResumeUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, job_id):
        if request.user.role != "recruiter": return Response({"error": "Unauthorized"}, status=403)
        try: job = JobDescription.objects.get(id=job_id, recruiter=request.user)
        except: return Response({"error": "Not found"}, status=404)
        
        files = request.FILES.getlist('files')
        if not files: return Response({"error": "No files."}, status=400)
        if not request.user.is_premium and len(files) > 1: return Response({"error": "Free tier limit 1"}, status=403)

        results = []
        for file in files:
            uploaded = RecruiterUploadedResume.objects.create(job=job, resume_file=file, candidate_name=file.name.split('.')[0])
            try:
                # Fast parse via AI Engine
                file.seek(0)
                res = requests.post(f"{AI_ENGINE_URL}/parse-resume/", files={"file": (file.name, file, file.content_type)}, data={"job_description": job.description})
                
                if res.status_code == 200:
                    ai_data = res.json()
                    
                    # AI engine returns parsed data as stringified JSON in 'parsed_text'
                    parsed_text_str = ai_data.get("parsed_text", "{}")
                    data = {}
                    try:
                        import json
                        data = json.loads(parsed_text_str)
                    except:
                        pass
                    
                    uploaded.candidate_name = file.name.split('.')[0]
                    
                    uploaded.education = ai_data.get("education", [])
                    uploaded.experience = ai_data.get("experience", [])
                    uploaded.projects = ai_data.get("projects", [])
                    uploaded.skills = ai_data.get("skills", [])
                    
                    # 1. Base Resume ATS Score (Standalone)
                    uploaded.ats_score = ai_data.get("ats_score", 0)
                    
                    # 2. Specific Job Match Analysis (Resume vs Selected JD)
                    match_data = {}
                    try:
                        match_res = requests.post(
                            f"{AI_ENGINE_URL}/analyze-job-match", 
                            json={
                                "resume_text": parsed_text_str,
                                "job_description": job.description
                            },
                            timeout=60
                        )
                        if match_res.status_code == 200:
                            match_data = match_res.json()
                    except Exception as e:
                        print(f"Match Analysis Error: {e}")
                    
                    uploaded.match_percentage = match_data.get("match_score", 0)
                    uploaded.matched_skills = match_data.get("skills_match", [])
                    uploaded.missing_skills = match_data.get("missing_skills", [])
                    
                    # Call Insights
                    try:
                        insights_res = requests.post(f"{AI_ENGINE_URL}/generate-candidate-insights", json={"resume_data": data, "job_description": job.description})
                        if insights_res.status_code == 200:
                            insights = insights_res.json()
                            uploaded.ai_summary = insights.get("ai_summary", "")
                            uploaded.strengths = insights.get("strengths", [])
                            uploaded.weaknesses = insights.get("weaknesses", [])
                            uploaded.risk_level = insights.get("risk_level", "Unknown")
                    except: pass

                uploaded.status = "Pending Review"
                uploaded.save()
                
                RecruiterActivity.objects.create(recruiter=request.user, resume=uploaded, action_type="Viewed", description="Resume uploaded and parsed via AI.")
                
                results.append(RecruiterUploadedResumeSerializer(uploaded).data)
            except Exception as e:
                uploaded.status = "Rejected"
                uploaded.save()
                results.append(RecruiterUploadedResumeSerializer(uploaded).data)

        return Response({"message": "Uploaded", "data": results}, status=201)

class RecruiterJobResumesAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, job_id):
        if request.user.role != "recruiter": return Response({"error": "Unauthorized"}, status=403)
        try: job = JobDescription.objects.get(id=job_id, recruiter=request.user)
        except: return Response({"error": "Not found"}, status=404)

        query = Q(job=job)
        
        # Filtering
        search = request.query_params.get("search", "")
        if search:
            query &= (Q(candidate_name__icontains=search) | Q(candidate_email__icontains=search))
            
        status_filter = request.query_params.get("status", "")
        if status_filter: query &= Q(status=status_filter)
        
        min_ats = request.query_params.get("min_ats", "")
        if min_ats.isdigit(): query &= Q(ats_score__gte=int(min_ats))
        
        bookmarked = request.query_params.get("bookmarked", "")
        if bookmarked.lower() == "true": query &= Q(is_bookmarked=True)

        resumes = RecruiterUploadedResume.objects.filter(query)

        # Sorting
        sort_by = request.query_params.get("sort_by", "-ats_score")
        if sort_by in ["ats_score", "-ats_score", "uploaded_at", "-uploaded_at", "candidate_name", "-candidate_name"]:
            resumes = resumes.order_by(sort_by)

        return Response(RecruiterUploadedResumeSerializer(resumes, many=True).data)

class RecruiterAllResumesAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if request.user.role != "recruiter": return Response({"error": "Unauthorized"}, status=403)
        query = Q(job__recruiter=request.user)
        
        search = request.query_params.get("search", "")
        if search: query &= (Q(candidate_name__icontains=search) | Q(candidate_email__icontains=search))
            
        status_filter = request.query_params.get("status", "")
        if status_filter: query &= Q(status=status_filter)
        
        job_id = request.query_params.get("job_id", "")
        if job_id.isdigit(): query &= Q(job_id=int(job_id))
        
        min_ats = request.query_params.get("min_ats", "")
        if min_ats.isdigit(): query &= Q(ats_score__gte=int(min_ats))

        resumes = RecruiterUploadedResume.objects.filter(query)
        sort_by = request.query_params.get("sort_by", "-ats_score")
        if sort_by in ["ats_score", "-ats_score", "uploaded_at", "-uploaded_at", "candidate_name", "-candidate_name"]:
            resumes = resumes.order_by(sort_by)

        return Response(RecruiterUploadedResumeSerializer(resumes, many=True).data)

class RecruiterResumeDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, resume_id):
        if request.user.role != "recruiter": return Response({"error": "Unauthorized"}, status=403)
        try:
            resume = RecruiterUploadedResume.objects.get(id=resume_id, job__recruiter=request.user)
            return Response(RecruiterUploadedResumeSerializer(resume).data)
        except:
            return Response({"error": "Not found"}, status=404)

class RecruiterResumeStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request):
        if request.user.role != "recruiter": return Response({"error": "Unauthorized"}, status=403)
        resume_ids = request.data.get('resume_ids', [])
        new_status = request.data.get('status')
        rejection_reason = request.data.get('rejection_reason', '')
        
        if not resume_ids or not new_status: return Response({"error": "Invalid payload."}, status=400)

        resumes = RecruiterUploadedResume.objects.filter(id__in=resume_ids, job__recruiter=request.user)
        
        for resume in resumes:
            resume.status = new_status
            if new_status == 'Selected':
                resume.selected_date = timezone.now()
            if new_status == 'Hired':
                resume.hired_date = timezone.now()
            if new_status == 'Rejected':
                resume.rejection_reason = rejection_reason
            
            resume.save()
            
            RecruiterActivity.objects.create(
                recruiter=request.user, 
                resume=resume, 
                action_type="Moved", 
                description=f"Status changed to {new_status}" + (f" - {rejection_reason}" if new_status == 'Rejected' and rejection_reason else "")
            )

        return Response({"message": f"Updated {resumes.count()} resumes."})

class RecruiterBulkActionAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if request.user.role != "recruiter": return Response({"error": "Unauthorized"}, status=403)
        action = request.data.get("action")
        resume_ids = request.data.get("resume_ids", [])
        
        resumes = RecruiterUploadedResume.objects.filter(id__in=resume_ids, job__recruiter=request.user)
        
        if action == "Shortlist":
            resumes.update(status="Shortlisted")
            for r in resumes: RecruiterActivity.objects.create(recruiter=request.user, resume=r, action_type="Shortlisted")
        elif action == "Reject":
            resumes.update(status="Rejected")
            for r in resumes: RecruiterActivity.objects.create(recruiter=request.user, resume=r, action_type="Rejected")
        elif action == "Delete":
            resumes.delete()
        else:
            return Response({"error": "Unknown action"}, status=400)
            
        return Response({"message": "Bulk action completed."})

class RecruiterNotesAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, resume_id):
        notes = CandidateNote.objects.filter(resume_id=resume_id, recruiter=request.user).order_by("-created_at")
        return Response(CandidateNoteSerializer(notes, many=True).data)
        
    def post(self, request, resume_id):
        try: resume = RecruiterUploadedResume.objects.get(id=resume_id, job__recruiter=request.user)
        except: return Response({"error": "Not found"}, status=404)
        
        note = CandidateNote.objects.create(
            resume=resume, recruiter=request.user,
            content=request.data.get("content", ""),
            is_pinned=request.data.get("is_pinned", False)
        )
        RecruiterActivity.objects.create(recruiter=request.user, resume=resume, action_type="Note", description="Added a note.")
        return Response(CandidateNoteSerializer(note).data, status=201)

class RecruiterFavoritesAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, resume_id):
        try: 
            resume = RecruiterUploadedResume.objects.get(id=resume_id, job__recruiter=request.user)
            resume.is_bookmarked = not resume.is_bookmarked
            resume.save()
            return Response({"is_bookmarked": resume.is_bookmarked})
        except: return Response({"error": "Not found"}, status=404)

class RecruiterActivityTimelineAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, resume_id):
        activities = RecruiterActivity.objects.filter(resume_id=resume_id, recruiter=request.user).order_by("-timestamp")
        return Response(RecruiterActivitySerializer(activities, many=True).data)

class RecruiterAnalyticsAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if request.user.role != "recruiter": return Response({"error": "Unauthorized"}, status=403)
        jobs = JobDescription.objects.filter(recruiter=request.user)
        resumes = RecruiterUploadedResume.objects.filter(job__in=jobs)
        
        # 1. Base Stats
        stats = {
            "total_jobs": jobs.count(),
            "total_candidates": resumes.count(),
            "shortlisted": resumes.filter(status="Shortlisted").count(),
            "rejected": resumes.filter(status="Rejected").count(),
            "interviews": resumes.filter(status="Interview").count(),
            "hired": resumes.filter(status="Hired").count(),
            "avg_ats": resumes.aggregate(Avg("ats_score"))["ats_score__avg"] or 0
        }

        # 2. ATS Distribution (90+, 80-89, 70-79, <70)
        ats_dist = [
            {"name": "Excellent (90-100)", "value": resumes.filter(ats_score__gte=90).count()},
            {"name": "Good (80-89)", "value": resumes.filter(ats_score__gte=80, ats_score__lt=90).count()},
            {"name": "Average (70-79)", "value": resumes.filter(ats_score__gte=70, ats_score__lt=80).count()},
            {"name": "Poor (<70)", "value": resumes.filter(ats_score__lt=70).count()},
        ]
        stats["ats_distribution"] = ats_dist

        # 3. Hiring Funnel
        funnel = [
            {"stage": "Applied", "count": stats["total_candidates"]},
            {"stage": "Pending Review", "count": resumes.filter(status__in=["Pending Review", "Shortlisted", "Interview", "Selected", "Offer Sent", "Hired"]).count()},
            {"stage": "Shortlisted", "count": resumes.filter(status__in=["Shortlisted", "Interview", "Selected", "Offer Sent", "Hired"]).count()},
            {"stage": "Interview", "count": resumes.filter(status__in=["Interview", "Selected", "Offer Sent", "Hired"]).count()},
            {"stage": "Selected", "count": resumes.filter(status__in=["Selected", "Offer Sent", "Hired"]).count()},
            {"stage": "Offer Sent", "count": resumes.filter(status__in=["Offer Sent", "Hired"]).count()},
            {"stage": "Hired", "count": stats["hired"]},
        ]
        stats["hiring_funnel"] = funnel

        # 4. Top Candidates
        top_candidates = resumes.order_by("-ats_score")[:5]
        stats["top_candidates"] = RecruiterUploadedResumeSerializer(top_candidates, many=True).data

        # 5. Recent Activity
        recent_activity = RecruiterActivity.objects.filter(recruiter=request.user).order_by("-timestamp")[:8]
        stats["recent_activity"] = RecruiterActivitySerializer(recent_activity, many=True).data

        # 6. Monthly Trend (Mocked for now since SQLite Date extraction can be tricky, but let's do a simple count for the last 6 months if possible, or just send dummy structured data)
        # We will use Django's TruncMonth if it works, or just return basic past 6 months structure.
        from django.db.models.functions import TruncMonth
        from django.db.models import Count
        from datetime import datetime, timedelta
        
        six_months_ago = timezone.now() - timedelta(days=180)
        trend_qs = resumes.filter(uploaded_at__gte=six_months_ago).annotate(month=TruncMonth('uploaded_at')).values('month').annotate(count=Count('id')).order_by('month')
        trend_data = []
        for t in trend_qs:
            if t['month']:
                trend_data.append({"name": t['month'].strftime("%b %Y"), "applications": t['count']})
        stats["applications_trend"] = trend_data

        # 7. Skills Distribution
        skills_counter = {}
        for r in resumes:
            for s in r.skills:
                s_lower = s.lower()
                skills_counter[s_lower] = skills_counter.get(s_lower, 0) + 1
        
        # Sort and take top 10
        sorted_skills = sorted(skills_counter.items(), key=lambda x: x[1], reverse=True)[:10]
        stats["skills_distribution"] = [{"name": k.title(), "count": v} for k, v in sorted_skills]

        # 8. Active Resumes for Kanban
        active_resumes = resumes.order_by("-uploaded_at")[:50]
        stats["active_resumes"] = RecruiterUploadedResumeSerializer(active_resumes, many=True).data

        return Response(stats)

class AIGenerateJobDescriptionAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if request.user.role != "recruiter" or not request.user.is_premium: return Response({"error": "Premium required."}, status=403)
        try:
            payload = {
                "role": request.data.get("role", ""),
                "experience": request.data.get("experience", ""),
                "skills": request.data.get("skills", ""),
                "industry": request.data.get("industry", ""),
                "job_type": request.data.get("job_type", "")
            }
            res = requests.post(f"{AI_ENGINE_URL}/generate-structured-jd", json=payload)
            data = res.json()
            
            # Format the structured JSON into a professional markdown string
            content = f"## {payload['role']}\n\n"
            
            if data.get('summary'):
                content += f"### Job Summary\n{data.get('summary')}\n\n"
                
            if data.get('responsibilities') and isinstance(data['responsibilities'], list):
                content += "### Key Responsibilities\n" + "\n".join([f"- {r}" for r in data['responsibilities']]) + "\n\n"
                
            if data.get('requirements') and isinstance(data['requirements'], list):
                content += "### Requirements & Qualifications\n" + "\n".join([f"- {r}" for r in data['requirements']]) + "\n\n"
                
            if data.get('preferred_skills') and isinstance(data['preferred_skills'], list):
                content += "### Preferred Skills (Nice to Have)\n" + "\n".join([f"- {s}" for s in data['preferred_skills']]) + "\n\n"
                
            if data.get('tech_stack') and isinstance(data['tech_stack'], list):
                content += "### Tech Stack\n" + "\n".join([f"- {t}" for t in data['tech_stack']]) + "\n\n"
                
            if data.get('benefits') and isinstance(data['benefits'], list):
                content += "### Benefits & Perks\n" + "\n".join([f"- {b}" for b in data['benefits']]) + "\n"
                
            # Fallback if the AI returned raw text instead of structured json for some reason
            if not content.strip() or len(content) < 50:
                content = data.get("content", str(data))

            return Response({"content": content.strip(), "raw_data": data})
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class RecruiterProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if request.user.role != "recruiter": return Response({"error": "Unauthorized"}, status=403)
        return Response({
            "full_name": request.user.full_name, 
            "company_name": request.user.company_name,
            "email": request.user.email, 
            "role": request.user.role, 
            "phone_number": request.user.phone_number,
            "is_premium": request.user.is_premium
        })
    def put(self, request):
        if request.user.role != "recruiter": return Response({"error": "Unauthorized"}, status=403)
        
        full_name = request.data.get("full_name")
        company_name = request.data.get("company_name")
        phone = request.data.get("phone_number")
        
        if full_name is not None:
            if not full_name.strip():
                return Response({"full_name": "Recruiter Name cannot be empty."}, status=400)
            if not re.match(r"^[A-Za-z]+(?:\s[A-Za-z]+)*$", full_name.strip()):
                return Response({"full_name": "Recruiter Name can only contain alphabets and spaces."}, status=400)
            request.user.full_name = full_name.strip()
            
        if company_name is not None:
            if not company_name.strip():
                return Response({"company_name": "Company Name cannot be empty."}, status=400)
            if re.match(r"^[\d\W_]+$", company_name.strip()):
                return Response({"company_name": "Company Name cannot contain only numbers or symbols."}, status=400)
            request.user.company_name = company_name.strip()
            
        if phone is not None:
            request.user.phone_number = phone.strip()
            
        request.user.save()
        return Response({"message": "Updated", "profile": {
            "full_name": request.user.full_name,
            "company_name": request.user.company_name,
            "phone_number": request.user.phone_number,
            "email": request.user.email
        }})

class RecruiterAIInterviewQuestionsAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, resume_id):
        try:
            resume = RecruiterUploadedResume.objects.get(id=resume_id, job__recruiter=request.user)
            payload = {
                "resume_data": {"skills": resume.skills, "experience": resume.experience},
                "job_description": resume.job.description
            }
            res = requests.post(f"{AI_ENGINE_URL}/generate-interview-questions", json=payload)
            return Response(res.json())
        except Exception as e: return Response({"error": str(e)}, status=500)
