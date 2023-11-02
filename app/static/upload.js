let ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
let wsUrl = ws_scheme + '://' + window.location.host + "/websocket";
let socket = new WebSocket(wsUrl);

const alertBox = document.getElementById('alert-box');
alertBox.style.display = 'none';

socket.onmessage = (event) => {
    const data_in = event.data;
    const jsonData = JSON.parse(data_in);
    var type = jsonData.type;
    var content = jsonData.content;
    console.log("Message: ", type, content);
    // Do stuff here: read message, or do things
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

const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const fileInfoText = document.getElementById('file-info-text');

var files = [];

// Prevent the default behaviour for the non-drop area
window.addEventListener("dragover",function(e){
        e = e || event;
        e.preventDefault();
    },false);
window.addEventListener("drop",function(e){
    e = e || event;
    e.preventDefault();
},false);

// Handle dropped files
dropArea.addEventListener('drop', (e) => {
    dropArea.classList.remove('active');
    const droppedFiles = e.dataTransfer.files;
    // add files to drop area
    handleFiles(droppedFiles);
});

// Handle file input change
fileInput.addEventListener('change', (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
    fileInput.value = "";
});


 // listen for custom file select button and simulate click on hidden fileInput element
document.getElementById("chooseButton").addEventListener("click", function () {
    fileInput.click();
});

// send files to endpoint
document.getElementById("uploadButton").addEventListener("click", function () {
    // Check for missing files
    if (files.length === 0) {
        displayAlert("Please select one or more files.");
        return;
    }
    // Prepare form data
    const formData = new FormData();
    console.log("Sending " + files.length + " file(s)...");
    files.forEach((file, index) => {
        formData.append("files", file);
    });
    fetch("/upload", {
        method: "POST",
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            //console.log(data);
            clearList();
            let type = data.type;
            let content = data.content;
            if (type === "alert"){
                let mes = `${content.length} File(s) uploaded successfully!`;
                displayAlert(mes);
            }
        })
        .catch(error => {
            console.error("Error uploading files:", error);
            displayAlert("Error Uploading File(s)!");
        });
});

function displayAlert(mes) {
    alertBox.style.display='block';
    alertBox.textContent = mes;
    const iconElement = document.createElement('i');
    iconElement.className = 'fa-solid fa-xmark alert-cross';
    // Append the <i> element to the target <div>
    alertBox.appendChild(iconElement);
    console.log(mes);
}

document.getElementById("alert-box").addEventListener("click", function () {
    alertBox.style.display='none';
});


function clearList(){
    fileList.innerHTML = '';
    files = [];
    fileInfoText.textContent = files.length + " File(s) selected";
}

// Function to check if a file object is present in the array
function isFileInArray(fileToFind, array) {
    return array.some(file => file.name === fileToFind.name && file.size === fileToFind.size);
}

function truncateFileName(fileName, maxLength) {
  if (fileName.length > maxLength) {
    return fileName.slice(0, maxLength) + '...';
  }
  return fileName;
}

// Add dropped or menu selected files to list
function handleFiles(newFiles) {
    for (const file of newFiles) {
        if (!isFileInArray(file, files)){
            console.log(file);
            console.log("Adding " + newFiles.length + " file(s)...");
            // push files to main files list
            files.push(file);

            // add html elements on the display list
            const listItem = document.createElement('li');
            listItem.classList.add('file-item');
            // this goes below:
            listItem.innerHTML = `
                <div class="file-container" "file-name" title="${file.name}" data-file="${file.name}">
                    <i class="fa-solid fa-file small-file-icon"></i>
                    ${truncateFileName(file.name, 50)} (${(file.size/1000000).toFixed(1)}MB)
                    <span class="file-remove" data-file="${file.name}">&times;</span>
                </div>
            `;
            fileList.appendChild(listItem);

            // custom remove button for each item
            const removeButton = listItem.querySelector('.file-remove');
            removeButton.addEventListener('click', (e) => {
                const fileName = e.target.getAttribute('data-file');
                const fileToRemove = fileList.querySelector(`[data-file="${fileName}"]`);
                console.log("File removed: " + fileName)
                fileToRemove.remove();
                // remove item from virtual list
                files = files.filter(file => file.name !== fileName);
                fileInfoText.textContent = files.length + " File(s) selected";
                console.log(files);
            });
        }
    }
    fileInfoText.textContent = files.length + " File(s) selected";
}



