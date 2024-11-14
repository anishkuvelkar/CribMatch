# backend/urls.py
from django.contrib import admin
from django.urls import path
from api.views import UserRegistrationView, UserLoginView, UserProfileView,SimilarUsersView,SwipeActionView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', UserRegistrationView.as_view(), name='user-register'),  # Registration endpoint
    path('api/login/', UserLoginView.as_view(), name='user-login'),  # Login endpoint
    path('api/user/', UserProfileView.as_view(), name='user-profile'),  # User profile endpoint
    path('api/search/', SimilarUsersView.as_view(), name='similar-users'),
    path('api/searchview/', SwipeActionView.as_view(), name='swipe-action')
]
