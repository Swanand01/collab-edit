const roomName = JSON.parse(document.getElementById("room-name").textContent);
const userName = JSON.parse(document.getElementById("user-name").textContent);

let languageDropdown = document.getElementById('language');


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
    let language = languageDropdown.options[languageDropdown.selectedIndex].value;

    let version;

    if (language == "python") {
        version = "3.9.4"
    }
    else if (language == "c" | language == "cpp") {
        version = "10.2.0"
    }


    document.querySelector("#output-text").value = "Running..." + "\n";

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "text/plain");
    myHeaders.append("Cookie", "engineerman.sid=s%3AjOc8eeGMoYq0WHTJ5MmKVuSzOHHdRZxA.pdnIbtrx5vDkho62y1WSEgB7ASyJ8y7%2Fh%2FCr6yvu4OM");

    var raw = JSON.stringify({
        "language": language,
        "version": version,
        "files": [
            {
                "content": code
            }
        ]
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("https://emkc.org/api/v2/piston/execute", requestOptions)
        .then(response => response.json())
        .then(result => {
            document.querySelector("#output-text").value = result.run.output + "\n";
            chatSocket.send(
                JSON.stringify({
                    event: "RUN",
                    user_name: userName,
                    message: result.run.output,
                })
            );
        })
        .catch(error => {
            document.querySelector("#output-text").value = error + "\n";
        });

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

languageDropdown.addEventListener('change', function () {
    var lang = this.value;
    console.log('You selected: ', lang);
    chatSocket.send(
        JSON.stringify({
            event: "LANG_CHANGE",
            user_name: userName,
            message: lang
        })
    );
});

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
        if (data.user_name != userName) {
            document.querySelector("#output-text").value = data.message + "\n";
        }
    } else if (data.event == "LANG_CHANGE") {
        if (data.user_name != userName) {
            document.getElementById("language").value = data.message;
        }
    } else {
        document.querySelector("#chat-text").value += data.message + "\n";
    }

};
