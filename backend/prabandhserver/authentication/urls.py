from django.urls import path,include
from .views import RegisterView, LoginView, LogoutView, UserView, CheckAuthView, CSRFTokenView, UsersByEmptypeView, EmptypesView, unique_departments, faculty_by_department, ProfileImageUploadView, FacultyDocumentUploadView, FacultyDocumentListView, HRFacultyListView, HRFacultyDetailView, HRFacultyDocumentsView, FacultyDirectoryView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('user/', UserView.as_view(), name='user'),
    path('check-auth/', CheckAuthView.as_view(), name='check-auth'),
    path('csrf/', CSRFTokenView.as_view(), name='csrf'),
    path('users/', UsersByEmptypeView.as_view(), name='users-by-emptype'),
    path('emptypes/', EmptypesView.as_view(), name='emptypes'),
    # JWT token endpoints
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('departments/', unique_departments, name='unique-departments'),
    path('faculty-by-department/', faculty_by_department, name='faculty-by-department'),
    path('profile-image/', ProfileImageUploadView.as_view(), name='profile-image-upload'),
    path('faculty/<int:id>/upload-document', FacultyDocumentUploadView.as_view(), name='faculty-upload-document'),
    path('faculty/<int:id>/documents', FacultyDocumentListView.as_view(), name='faculty-list-documents'),
    # HR Faculty List endpoint
    path('hr/faculty-list/', HRFacultyListView.as_view(), name='hr-faculty-list'),
    path('hr/faculty-detail/<int:id>/', HRFacultyDetailView.as_view(), name='hr-faculty-detail'),
    path('hr/faculty-documents/<int:id>/', HRFacultyDocumentsView.as_view(), name='hr-faculty-documents'),
    path('faculty-directory/', FacultyDirectoryView.as_view(), name='faculty-directory'),
]
