from functools import wraps
from django.shortcuts import redirect, resolve_url
from django.contrib import messages
from django.conf import settings


def perfil_requerido(*perfis):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                login_path = resolve_url(settings.LOGIN_URL)
                return redirect(f'{login_path}?next={request.path}')
            if request.user.perfil not in perfis:
                messages.error(request, 'Acesso negado.')
                return redirect('core:home')
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator
