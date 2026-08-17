import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from accounts.models import User

admin_email = "admin@resumescanner.com"
password = "AdminPassword123!"

user = User.objects.filter(email__iexact=admin_email).first()
if user:
    print(f"User found: {user.email}, Role: {user.role}, Is Active: {user.is_active}")
    is_valid = user.check_password(password)
    print(f"Password check for '{password}': {is_valid}")
else:
    print("User not found!")
