from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import login

from .models import User
from .forms import SetPasswordForm, SearchForm

@login_required
def home(request):
    return render(request, 'home.html')


@login_required
def list_users(request):
    users = User.objects.filter(is_superuser=False)
    return render(request, 'users.html', {'users': users})


@login_required
def search_users(request):
    if request.method == 'POST':
        form = SearchForm(request.POST)
        if form.is_valid():
            phone = form.cleaned_data['phone']
            users = User.objects.filter(phone_number__contains=phone)
            return render(request, 'search.html', {'form': form, 'users': users})

    else:
        form = SearchForm()

    return render(request, 'search.html', {'form': form})


@login_required
def user_detail(request, pk):
    user = get_object_or_404(User, pk=pk)
    return render(request, 'user_detail.html', {'user': user})


@login_required
def set_password(request):
    if request.method == 'POST':
        form = SetPasswordForm(request.POST)
        if form.is_valid():
            user = request.user
            password = form.cleaned_data['password']
            user.set_password(password)
            user.save()
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            return redirect('/')

    else:
        form = SetPasswordForm()

    return render(request, 'set_password.html', {'form': form})
