const fileId = JSON.parse(document.getElementById("file_id").textContent);
const userName = JSON.parse(document.getElementById("user-name").textContent);
let content = JSON.parse(document.getElementById("content").textContent);

const chatSocket = new WebSocket(
    "ws://" + window.location.host + "/ws/app/" + fileId + "/"
);

var quill = new Quill('#editor', {
    theme: 'snow'
});

if (content != "") {
    quill.setContents(JSON.parse(content));
}

const resize_ob = new ResizeObserver(function (entries) {
    let rect = entries[0].contentRect;
    let height = rect.height;
    console.log("toolbar h", height);
    document.querySelector("#editor").style.height = `${document.querySelector(".editor-container").clientHeight - height - 16}px`;
});

// start observing for resize
resize_ob.observe(document.querySelector(".ql-toolbar"));

let revealChat = document.getElementById("chat");
let flag = true;

let saveButton = document.getElementById("save");

const messageInputDom = document.querySelector("#message-box");

function sendMessage() {
    const message = messageInputDom.value;
    if (message != "") {
        chatSocket.send(
            JSON.stringify({
                event: "MSG",
                user_name: userName,
                message: message,
            })
        );
        messageInputDom.value = "";
    }
}

function saveDocument() {
    content = quill.getContents()
    chatSocket.send(
        JSON.stringify({
            event: "SAVE",
            user_name: userName,
            message: content,
        })
    );
}

quill.on('text-change', function (delta, oldDelta, source) {
    if (source !== 'user') return
    chatSocket.send(
        JSON.stringify({
            event: "TEXT_CHANGE",
            user_name: userName,
            message: delta,
        })
    );
});

document.querySelector("#submit").onclick = sendMessage

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
            document.querySelector("#chat-text").innerHTML += "<br>" + "You" + ": " + data.message + "\n";
        } else {
            document.querySelector("#chat-text").innerHTML +=
                "<br>" + data.user_name + ": " + data.message + "\n";
        }
    } else if (data.event == "TEXT_CHANGE") {
        if (data.user_name != userName) {
            quill.updateContents(data.message);
        }
    } else {
        document.querySelector("#chat-text").innerHTML += "<br>" + data.message + "\n";
    }

};


revealChat.addEventListener("click", function () {
    let b = document.getElementsByTagName("body")[0];
    if (flag) {
        b.style.gridTemplateColumns = "1fr 0";
        document.getElementsByClassName("message-container")[0].style.display = "flex";
        document.getElementsByClassName("editor-container")[0].style.maxWidth = "100vw"
        flag = !flag;
    }
    else {
        b.style.gridTemplateColumns = "2fr 1fr";
        document.getElementsByClassName("message-container")[0].style.display = "";
        document.getElementsByClassName("editor-container")[0].style.maxWidth = "";
        flag = !flag;
    }

});

document.querySelector("#message-box").addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        sendMessage();
    }
});


saveButton.onclick = saveDocument;

