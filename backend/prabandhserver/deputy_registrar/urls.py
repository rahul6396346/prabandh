from rest_framework.routers import DefaultRouter
from .views import SchoolViewSet, ProgrammeViewSet, SubjectViewSet, SchemeViewSet

router = DefaultRouter()
router.register(r'schools', SchoolViewSet, basename='school')
router.register(r'programmes', ProgrammeViewSet, basename='programme')
router.register(r'subjects', SubjectViewSet)
router.register(r'schemes', SchemeViewSet)

urlpatterns = router.urls