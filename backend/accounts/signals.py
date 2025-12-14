from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import User, UserRole, DoctorProfile


@receiver(post_save, sender=User)
def ensure_doctor_profile(sender, instance: User, created: bool, **kwargs):
    if instance.role == UserRole.DOCTOR:
        DoctorProfile.objects.get_or_create(
            user=instance,
            defaults={"full_name": instance.full_name, "specialization": "", "phone": ""},
        )
