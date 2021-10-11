const roomName = JSON.parse(document.getElementById("room-name").textContent);
const userName = JSON.parse(document.getElementById("user-name").textContent);

let languageDropdown = document.getElementById('language');


const chatSocket = new WebSocket(
    "ws://" + window.location.host + "/ws/app/" + roomName + "/"
);

var quill = new Quill('#editor', {
    theme: 'snow'
});

quill.on('text-change', function (delta, oldDelta, source) {
    if (source !== 'user') return
    console.log(delta);
    chatSocket.send(
        JSON.stringify({
            event: "CODE",
            user_name: userName,
            message: delta,
        })
    );

});

document.querySelector("#submit").onclick = function (e) {
    const messageInputDom = document.querySelector("#input");
    const message = messageInputDom.value;

    if (message != "") {
        chatSocket.send(
            JSON.stringify({
                event: "MSG",
                user_name: userName,
                message: message,
            })
        );
    }
    messageInputDom.value = "";
};


window.onbeforeunload = function (e) {
    chatSocket.send(
        JSON.stringify({
            event: "CLOSE",
            user_name: userName,
        })
    );
    chatSocket.close();
};

chatSocket.onopen = function (event) {
    chatSocket.send(
        JSON.stringify({
            event: "OPEN",
            user_name: userName,
        })
    );
};



chatSocket.onmessage = function (e) {

    const data = JSON.parse(e.data);

    if (data.event == "MSG") {
        if (data.user_name == userName) {
            document.querySelector("#chat-text").value +=
                "You" + ": " + data.message + "\n";
        } else {
            document.querySelector("#chat-text").value +=
                data.user_name + ": " + data.message + "\n";
        }
    } else if (data.event == "CODE") {
        if (data.user_name != userName) {
            quill.updateContents(data.message);
        }
    } else {
        document.querySelector("#chat-text").value += data.message + "\n";
    }

};
