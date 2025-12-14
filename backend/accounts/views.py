from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response

from core.permissions import IsAdminRole
from .models import User, UserRole
from .serializers import AdminDoctorSerializer, MeSerializer


class MeView(APIView):
    def get(self, request):
        return Response(MeSerializer(request.user).data)


class AdminDoctorViewSet(viewsets.ModelViewSet):
    serializer_class = AdminDoctorSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        return User.objects.filter(role=UserRole.DOCTOR).select_related("doctor_profile").order_by("id")
