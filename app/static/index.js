document.addEventListener("DOMContentLoaded", function() {

    let ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
    let wsUrl = ws_scheme + '://' + window.location.host + "/websocket";
    let socket = new WebSocket(wsUrl);

    let toggleIsOne = true;

    socket.onmessage = (event) => {

        const data_in = event.data;
        const jsonData = JSON.parse(data_in);
        var type = jsonData.type;
        var content = jsonData.content;
        console.log("Message: ", type, content);
    };

    socket.onclose = function(event) {
        console.log('Connection lost!');
    };

    socket.onerror = function(error) {
        console.log('Error: ${error.message}');
    };

    socket.onopen = function(event) {
        console.log('Connection established!');
    };

    // Toggle switch action
    // Preload Image
    let img = new Image();
    img.src = "static/beach.jpg";

    const toggleSwitch = document.getElementById("switch");
        const content = document.querySelector(".content");
        toggleSwitch.addEventListener("click", function () {
            toggleIsOne = toggleIsOne ? false:true;
            //document.getElementById('matrixCanvas').style.opacity = Number(toggleIsOne);
            document.body.style.backgroundImage = img; // specify the image path here

    });

});