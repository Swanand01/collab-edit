from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import redirect, render
import string
import random
from django.contrib.auth.decorators import login_required


def register(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('/login')
    else:
        form = UserCreationForm()

    context = {"form": form}
    return render(request, 'register.html', context)


@login_required
def index(request):
    if request.method == "POST":
        uname = str(request.user)
        room_name = request.POST.get('room_name')
        request.session['user_name'] = uname
        if room_name == "":
            room_name = ''.join(random.choices(
                string.ascii_uppercase + string.digits, k=6))

        if uname != "" and room_name != "":
            return redirect(f'{room_name}/')
    return render(request, 'index.html', {})


@login_required
def room(request, room_name):
    uname = request.session.get('user_name')

    if uname != None and uname != "":
        return render(request, 'chatroom.html', {
            "user_name": request.session.get('user_name'),
            "room_name": room_name
        })
    else:
        return redirect('/app')
