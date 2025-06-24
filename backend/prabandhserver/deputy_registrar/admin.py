from django.contrib import admin
from .models import Subject, Scheme
from .models import Programme


admin.site.register(Subject)
admin.site.register(Scheme)
admin.site.register(Programme)