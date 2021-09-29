const roomName = JSON.parse(document.getElementById("room-name").textContent);
const userName = JSON.parse(document.getElementById("user-name").textContent);

const chatSocket = new WebSocket(
    "ws://" + window.location.host + "/ws/app/" + roomName + "/"
);

var editorDom = document.querySelector("#editor");
var editor = ace.edit(editorDom, {
    mode: "ace/mode/javascript",
    selectionStyle: "text",
    enableLiveAutocompletion: false,
    enableLiveAutocompletion: true,
    //enableSnippets: true
});
editor.session.setOption("useWorker", false);

const keystrokeDetector = document.querySelector("#keystroke-detector");


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


document.querySelector("#run").onclick = function (e) {
    let code = editor.getSession().getValue();
    let languageDropdown = document.getElementById('language');
    let language = languageDropdown.options[languageDropdown.selectedIndex].value;

    chatSocket.send(
        JSON.stringify({
            event: "RUN",
            user_name: userName,
            message: code,
            language: language
        })
    );

    document.querySelector("#output-text").value = "Running..." + "\n";

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


keystrokeDetector.addEventListener("keyup", function (e) {

    chatSocket.send(
        JSON.stringify({
            event: "CODE",
            user_name: userName,
            message: editor.getSession().getValue(),
        })
    );

})


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
            editor.getSession().setValue(data.message);
        }
    } else if (data.event == "RUN") {
        document.querySelector("#output-text").value = data.message + "\n";

    } else {
        document.querySelector("#chat-text").value += data.message + "\n";
    }

};
