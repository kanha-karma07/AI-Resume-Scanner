from accounts.models import User
import sys

admin_email = "admin@resumescanner.com"
if not User.objects.filter(email=admin_email).exists():
    user = User.objects.create_superuser(
        username="superadmin",
        email=admin_email,
        password="AdminPassword123!"
    )
    user.role = "admin"
    user.full_name = "System Administrator"
    user.save()
    print("Admin user created successfully: admin@resumescanner.com / AdminPassword123!")
else:
    print("Admin user already exists.")
