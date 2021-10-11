from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Document
import json
from channels.db import database_sync_to_async


class ChatRoomConsumer(AsyncWebsocketConsumer):
    @database_sync_to_async
    def create_chat(self, content):
        print("RECEIVED INSIDE FUNC", content)
        doc = Document.objects.get(
            document_id=self.file_id)
        print(doc.document_id)
        print(doc.name)
        doc.content = content
        doc.save()

    async def connect(self):
        self.file_id = self.scope['url_route']['kwargs']['file_id']
        self.room_group_name = "chat_%s" % self.file_id

        await self.channel_layer.group_add(  # Creates a group (Read docs)
            self.room_group_name,
            self.channel_name
        )

        await self.accept()  # accept the upgrade request

    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            text_data_json = json.loads(text_data)
            event = text_data_json["event"]

            user_name = text_data_json['user_name']

            if event == "MSG":
                message = text_data_json['message']
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chatroom_message',
                        'event': event,
                        'user_name': user_name,
                        'message': message,
                    }
                )

            elif event == "TEXT_CHANGE":
                message = text_data_json['message']
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'text_change',
                        'event': event,
                        'user_name': user_name,
                        'message': message,
                    }
                )
            elif event == "SAVE":
                content = json.dumps(text_data_json['message']['ops'])
                print("RECEIVED:", content)
                await self.create_chat(content)

            elif event == "OPEN":
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'open_chat',
                        'event': event,
                        'user_name': user_name,
                    }
                )
            elif event == "CLOSE":
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'close_conn',
                        'event': event,
                        'user_name': user_name,
                    }
                )

    async def chatroom_message(self, event_data):
        message = event_data['message']
        user_name = event_data['user_name']
        event = event_data['event']

        await self.send(text_data=json.dumps({
            'event': event,
            'user_name': user_name,
            'message': message,
        }))

    async def text_change(self, event_data):
        message = event_data['message']
        user_name = event_data['user_name']
        event = event_data['event']

        await self.send(text_data=json.dumps({
            'event': event,
            'message': message,
            'user_name': user_name,
        }))

    async def open_chat(self, event_data):
        user_name = event_data['user_name']

        await self.send(text_data=json.dumps({
            'message': f"{user_name} has joined.",
        }))

    async def close_conn(self, event_data):
        user_name = event_data['user_name']

        await self.send(text_data=json.dumps({
            'message': f"{user_name} has left.",
        }))
