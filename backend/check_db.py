import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from accounts.models import User
from candidate.models import CandidateProfile

print("=== DB INTEGRATION CHECK ===")

cands = User.objects.filter(role="candidate")
print(f"Total Candidates in DB: {cands.count()}")
for c in cands.order_by("-created_at")[:2]:
    print(f"- {c.email} (Has Profile: {CandidateProfile.objects.filter(user=c).exists()})")

recs = User.objects.filter(role="recruiter")
print(f"\nTotal Recruiters in DB: {recs.count()}")
for r in recs.order_by("-created_at")[:2]:
    # the project might use RecruiterProfile or similar, let's check RecruiterUploadedResume
    from recruiter.models import RecruiterUploadedResume
    print(f"- {r.email} (Company: {r.company_name})")

print("=== CHECK COMPLETE ===")
