from django.core.management.base import BaseCommand
from apps.finance.services import ensure_default_categories


class Command(BaseCommand):
    help = "Seed default SpendWise income and expense categories."

    def handle(self, *args, **options):
        ensure_default_categories()
        self.stdout.write(self.style.SUCCESS("Default SpendWise categories seeded."))
