from django.urls import path
from .views import NoteDraftView, PatientSummaryView

urlpatterns = [
    path("note-draft/", NoteDraftView.as_view(), name="ai-note-draft"),
    path("patient-summary/", PatientSummaryView.as_view(), name="ai-patient-summary"),
]
