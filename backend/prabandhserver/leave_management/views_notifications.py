from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from authentication.models import Faculty
from .models import FCMToken
import json

@csrf_exempt 
def save_fcm_token(request):
    data = json.loads(request.body)
    token = data.get("token")
    user = Faculty.objects.get(id=data.get("id"))
    FCMToken.objects.update_or_create(user=user, defaults={"token": token})
    return JsonResponse({"message": "Token saved"})