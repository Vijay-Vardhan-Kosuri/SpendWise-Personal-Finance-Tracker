from django.core.management.base import BaseCommand
from apps.accounts.models import User
from apps.finance.services import seed_demo_data_for_user


class Command(BaseCommand):
    help = "Create a clearly labeled demo user and populate sample data for local preview."

    def add_arguments(self, parser):
        parser.add_argument("--email", default="demo@spendwise.in")
        parser.add_argument("--password", default="DemoPass@2026")

    def handle(self, *args, **options):
        email = options["email"]
        password = options["password"]
        user, created = User.objects.get_or_create(
            email=email,
            defaults={"full_name": "Aarav Sharma (Demo)", "currency_preference": "INR"},
        )
        if created:
            user.set_password(password)
            user.save()
        seed_demo_data_for_user(user)
        self.stdout.write(self.style.SUCCESS(f"Demo data seeded for {email}"))
