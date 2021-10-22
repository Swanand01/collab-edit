Array.from(document.getElementsByClassName("file-cards")).forEach(function (element) {
    element.addEventListener("click", function (event) {
        window.location.href = event.target.querySelector("a").href;
    });
});

document.querySelector("#close-popup-container").addEventListener("click", function (event) {
    event.target.style.display = "none";
    document.querySelector(".create-file-popup").style.display = "none";
});

document.querySelector("#addFile-btn").addEventListener("click", function (event) {
    document.querySelector("#close-popup-container").style.display = "inline-block";
    document.querySelector(".create-file-popup").style.display = "inline-block";
});