from channels.generic.websocket import AsyncWebsocketConsumer
import json


class ChatRoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = "chat_%s" % self.room_name

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

            elif event == "CODE":
                message = text_data_json['message']
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'code',
                        'event': event,
                        'user_name': user_name,
                        'message': message,
                    }
                )

            elif event == "RUN":
                message = text_data_json['message']

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'code_run',
                        'event': event,
                        'message': message,
                    }
                )

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
            elif event == "LANG_CHANGE":
                message = text_data_json['message']
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'lang_change',
                        'event': event,
                        'user_name': user_name,
                        'message': message,
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

    async def code(self, event_data):
        message = event_data['message']
        user_name = event_data['user_name']
        event = event_data['event']

        await self.send(text_data=json.dumps({
            'event': event,
            'message': message,
            'user_name': user_name,
        }))

    async def code_run(self, event_data):
        output = event_data['message']
        event = event_data['event']

        await self.send(text_data=json.dumps({
            'event': event,
            'message': output,
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

    async def lang_change(self, event_data):
        lang = event_data['message']
        event = event_data['event']

        await self.send(text_data=json.dumps({
            'event': event,
            'message': lang,
        }))
