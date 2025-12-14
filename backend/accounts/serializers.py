from rest_framework import serializers
from .models import User, DoctorProfile, UserRole


class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = ("full_name", "specialization", "phone", "room")


class AdminDoctorSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    doctor_profile = DoctorProfileSerializer(required=False)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "password",
            "first_name",
            "last_name",
            "is_active",
            "doctor_profile",
        )

    def create(self, validated_data):
        profile_data = validated_data.pop("doctor_profile", {})
        password = validated_data.pop("password")

        user = User.objects.create(
            role=UserRole.DOCTOR,
            **validated_data,
        )
        user.set_password(password)
        user.save()

        DoctorProfile.objects.update_or_create(
            user=user,
            defaults={
                "full_name": profile_data.get("full_name") or user.full_name,
                "specialization": profile_data.get("specialization", ""),
                "phone": profile_data.get("phone", ""),
                "room": profile_data.get("room", ""),
            },
        )
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("doctor_profile", None)
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.role = UserRole.DOCTOR

        if password:
            instance.set_password(password)

        instance.save()

        if profile_data is not None:
            DoctorProfile.objects.update_or_create(
                user=instance,
                defaults={
                    "full_name": profile_data.get("full_name") or instance.full_name,
                    "specialization": profile_data.get("specialization", ""),
                    "phone": profile_data.get("phone", ""),
                    "room": profile_data.get("room", ""),
                },
            )

        return instance


class MeSerializer(serializers.ModelSerializer):
    doctor_profile = DoctorProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ("id", "email", "role", "first_name", "last_name", "doctor_profile")
