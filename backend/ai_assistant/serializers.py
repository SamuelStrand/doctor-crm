from rest_framework import serializers


class NoteDraftSerializer(serializers.Serializer):
    bullets = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
    )
    free_text = serializers.CharField(required=False, allow_blank=True)
    language = serializers.ChoiceField(choices=("en", "ru", "kk"), required=False, default="en")


class PatientSummarySerializer(serializers.Serializer):
    patient_id = serializers.IntegerField()
    limit = serializers.IntegerField(required=False, default=5, min_value=1, max_value=20)
    language = serializers.ChoiceField(choices=("en", "ru", "kk"), required=False, default="en")
