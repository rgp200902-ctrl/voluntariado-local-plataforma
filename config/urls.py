from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

def handler404(request, exception):
    return TemplateView.as_view(template_name='404.html', extra_context={'request_path': request.path})(request), 404

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls')),
    path('', include('accounts.urls')),
    path('oportunidades/', include('oportunidades.urls')),
    path('offline/', TemplateView.as_view(template_name='offline.html'), name='offline'),
    path('robots.txt', TemplateView.as_view(template_name='robots.txt', content_type='text/plain'), name='robots'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static('/static/', document_root=settings.STATIC_ROOT)
