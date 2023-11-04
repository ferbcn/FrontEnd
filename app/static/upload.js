let ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
let wsUrl = ws_scheme + '://' + window.location.host + "/websocket";
let socket = new WebSocket(wsUrl);

const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const progressArea = document.querySelector(".progress-area");
const uploadedArea = document.querySelector(".uploaded-area");
const fileInfoText = document.getElementById('file-info-text');
var files = [];

const alertBox = document.getElementById('alert-box');
alertBox.style.display = 'none';

// Websocket functionality
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
    handleDroppedOrSelectedFiles(droppedFiles);
});


// Handle selected files on file input change
fileInput.addEventListener('change', (e) => {
    const selectedFiles = Array.from(e.target.files);
    console.log("change: ", selectedFiles);
    handleDroppedOrSelectedFiles(selectedFiles)
    fileInput.value = "";
});


// listen for custom file select button and simulate click on hidden fileInput element
document.getElementById("drop-area").addEventListener("click", function () {
    fileInput.click();
});

// Clear alertBox when clicked anywhere on the box
document.getElementById("alert-box").addEventListener("click", function () {
    alertBox.style.display='none';
});


// Handles dropped or selected files
function handleDroppedOrSelectedFiles(newFiles){
    console.log(newFiles);
    for (const file of newFiles) {
        if (isFileInArray(file, files)){
            console.log(`File <${file.name}> already uploaded during current session!`);
        }
        else{
            uploadSingleFile(file)
        }
    }
}


function uploadSingleFile(file){

  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/upload");
  // catch network errors
  xhr.onerror = function() {
    console.log('Network error occurred:', xhr.status, xhr.statusText);
    displayAlert("Upload error!")
    uploadedArea.classList.remove("onprogress");
    progressArea.innerHTML = "";
  };

  xhr.upload.addEventListener("progress", ({loaded, total}) =>{
    let fileLoaded = Math.floor((loaded / total) * 100);
    let fileTotal = Math.floor(total / 1000);
    let fileSize;
    (fileTotal < 1024) ? fileSize = fileTotal + " KB" : fileSize = (loaded / (1024*1024)).toFixed(2) + " MB";
    let progressHTML = `<li class="row">
                          <i class="fas fa-file small-file-icon"></i>
                          <div class="content">
                            <div class="details">
                              <span class="name">${file.name} • Uploading</span>
                              <span class="percent">${fileLoaded}%</span>
                            </div>
                            <div class="progress-bar">
                              <div class="progress" style="width: ${fileLoaded}%"></div>
                            </div>
                          </div>
                        </li>`;
    uploadedArea.classList.add("onprogress");
    progressArea.innerHTML = progressHTML;
    if(loaded == total){
      progressArea.innerHTML = "";
      let uploadedHTML = `<li class="row">
                            <i class="fas fa-file small-file-icon"></i>
                            <div class="content upload">
                              <div class="details">
                                <span class="name">${file.name} • Uploaded</span>
                                <span class="size">${fileSize}</span>
                              </div>
                            </div>
                            <i class="fas fa-check small-file-icon"></i>
                          </li>`;
      uploadedArea.classList.remove("onprogress");
      uploadedArea.insertAdjacentHTML("afterbegin", uploadedHTML);
      // push files to main files list
      files.push(file);
      fileInfoText.textContent = files.length + " File(s) uploaded";
    }
  });

  // send form data
  const formData = new FormData();
  formData.append("files", file);
  xhr.send(formData);
}

// Helper functions
function displayAlert(mes) {
    alertBox.style.display='block';
    alertBox.textContent = mes;
    const iconElement = document.createElement('i');
    iconElement.className = 'fa-solid fa-xmark alert-cross';
    alertBox.appendChild(iconElement);
    console.log(mes);
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



