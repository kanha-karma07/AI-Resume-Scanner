from django.contrib import admin
from .models import CandidateProfile, Resume

admin.site.register(CandidateProfile)
admin.site.register(Resume)
from .models import JobDescription
admin.site.register(JobDescription)