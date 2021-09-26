from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import redirect, render
import string
import random
from django.contrib.auth.decorators import login_required
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


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
        print("UN:"+uname+"RN"+room_name)
        if uname != "" and room_name != "":
            return redirect(f'{room_name}/')
    return render(request, 'index.html', {})


def demo(request):
    return render(request, 'demo.html')


@login_required
def room(request, room_name):
    uname = request.session.get('user_name')
    channel_layer = get_channel_layer()
    print(channel_layer)

    if request.method == 'POST':
        f = request.FILES['file']
        with open('app/upload/'+f.name, 'wb+') as destination:
            for chunk in f.chunks():
                destination.write(chunk)

        print("BEFORE ASYNC")
        try:
            async_to_sync(channel_layer.group_send)(
                "chat_%s" % room_name,
                {
                    'type': 'chatroom_message',
                    'event': "MSG",
                    'user_name': uname,
                    'message': destination.name,
                }
            )
        except Exception as e:
            print(e)
        print("AFTER ASYNC")

    if uname != None and uname != "":
        return render(request, 'chatroom.html', {
            "user_name": request.session.get('user_name'),
            "room_name": room_name
        })
    else:
        return redirect('/app')
