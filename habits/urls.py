from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import HabitViewSet, HabitLogViewSet, RegisterView

router = DefaultRouter()

router.register('habits', HabitViewSet)
router.register('habit-logs', HabitLogViewSet)

urlpatterns = router.urls

urlpatterns += [
    path('register/', RegisterView.as_view(), name='register'),
]