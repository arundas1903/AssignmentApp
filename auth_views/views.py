from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.shortcuts import render, redirect
from django.db.models import Q

from .forms import SetPhoneNumber
from core_views.models import User

def login(request):
    return render(request, 'login.html')


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
            return redirect('/home/')
    else:
        if not user.phone_number:
            form = SetPhoneNumber()
        else:
            return redirect('/home/')

    return render(request, 'set_phone.html', {'form': form})
