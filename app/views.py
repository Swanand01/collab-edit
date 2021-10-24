from django.shortcuts import redirect, render
import string
import random
from django.contrib.auth.decorators import login_required
from .models import CustomUser, Document
from .admin import CustomUserCreationForm


def register(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('/login')
    else:
        form = CustomUserCreationForm()

    context = {"form": form}
    return render(request, 'register.html', context)


@login_required
def index(request):
    uname = str(request.user)
    request.session['user_name'] = uname
    user = CustomUser.objects.get(user_name=uname)

    documents = Document.objects.filter(owner=user)

    if request.method == "POST":

        file_name = request.POST.get('file_name')
        file_id = ''.join(random.choices(
            string.ascii_letters + string.digits, k=24))

        d = Document(owner=user, name=file_name, document_id=file_id)
        d.save()

        if uname != "":
            return redirect(f'{file_id}/')
    return render(request, 'index.html', {"documents": documents, "user_name": request.session.get('user_name')})


@login_required
def room(request, file_id):
    uname = request.session.get('user_name') 

    doc = Document.objects.get(document_id=file_id)
    content = doc.content
    filename = doc.name

    if request.method == "POST":
            file_name = request.POST.get("file_name")
            doc.name = file_name
            doc.save()

            return render(request, 'chatroom.html', {
            "user_name": request.session.get('user_name'),
            "file_id": file_id,
            "filename": file_name,
            "content": content
        })

    if uname != None and uname != "":
        return render(request, 'chatroom.html', {
            "user_name": request.session.get('user_name'),
            "file_id": file_id,
            "filename": filename,
            "content": content
        })
    else:
        return redirect('/app')
