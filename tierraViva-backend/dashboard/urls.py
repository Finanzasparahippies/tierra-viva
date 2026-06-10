from django.urls import path
from .views import AnalyticsOverview, SystemMetricsView

urlpatterns = [
    path('analytics/', AnalyticsOverview.as_view(), name='analytics_overview'),
    path('system/', SystemMetricsView.as_view(), name='system_metrics'),
]
