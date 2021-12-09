
# Collab Edit

A collaborative text editor with online file storage, real-time editing and messaging.

Built on WebSockets, with Django and Django Channels.

Comes with a WYSIWYG rich text editor, QuillJS.
## Demo

https://github.com/Swanand01/collab-edit/blob/main/gifs/Capture1.PNG


## Run Locally

Clone the project

```bash
  git clone https://github.com/Swanand01/collab-edit
```

Create a virtual environment and activate it

```bash
  py -m venv venv
```
```bash
  venv\Scripts\activate
```

Install dependencies

```bash
  pip install django channels
```

Go to the cloned project directory

```bash
  cd collab-edit\
```

Run the server

```bash
  python manage.py runserver
```

