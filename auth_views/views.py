from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.shortcuts import render, redirect
from django.db.models import Q
from django.contrib.auth import authenticate, login

from .forms import SetPhoneNumber, LoginForm
from core_views.models import User

def login_user(request):
    user = request.user
    if user.is_authenticated:
        return redirect('/')
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            phone_number = form.cleaned_data['phone_number']
            password = form.cleaned_data['password']
            users = User.objects.filter(phone_number=phone_number)
            if users:
                user = users[0]
                if user.check_password(password):
                    login(request, user, backend='django.contrib.auth.backends.ModelBackend')
                    return redirect('/')
    else:
        form = LoginForm()
    return render(request, 'login.html', {'form': form})


@login_required
def user_logout(request):
    logout(request)
    return redirect('/login')


@login_required
def set_phone(request):
    user = request.user
    if request.method == 'POST':
        form = SetPhoneNumber(request.POST)
        if form.is_valid():
            current_user = request.user
            phone_number = form.cleaned_data['phone_number']
            users = User.objects.filter(~Q(id=current_user.id), phone_number=phone_number)
            if users:
                user = users[0]
                meta_data = user.meta
                meta_data.update(current_user.meta)
                current_user.meta = meta_data
                users.delete()
            current_user.phone_number = phone_number
            current_user.save()
            return redirect('/')
    else:
        if not user.phone_number:
            form = SetPhoneNumber()
        else:
            return redirect('/')

    return render(request, 'set_phone.html', {'form': form})
