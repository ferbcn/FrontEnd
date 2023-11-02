const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');

var files = [];

// Prevent the default behavior for the drop area
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('active');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('active');
});

// Handle dropped files
dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
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


// Add dropped or menu selected files to list
function handleFiles(newFiles) {
    for (const file of newFiles) {
        console.log("Adding " + newFiles.length + " file(s)...");
        // push files to main files list
        files.push(file);

        // add html elements on the display list
        const listItem = document.createElement('li');
        listItem.classList.add('file-item');
        // this goes below:
        listItem.innerHTML = `
            <div class="file-name" data-file="${file.name}">${file.name}
            <span class="file-remove" data-file="${file.name}">&times;</span></div>

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
            console.log(files);
        });
    }
}


function clearList(){
    fileList.innerHTML = "";
    files = [];
}

// send files to endpoint
document.getElementById("uploadButton").addEventListener("click", function () {
    // Check for missing files
    if (files.length === 0) {
        alert("Please select one or more files.");
        return;
    }
    // Prepare form data
    const formData = new FormData();
    let filenames = "";
    console.log("Sending " + files.length + " file(s)...");
    files.forEach((file, index) => {
        filenames += file.name+"\n";
        formData.append("files", file);
    });
    // alert("Uploading file(s) :\n____________________\n"+filenames);
    fetch("/upload", {
        method: "POST",
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            alert(files.length + " file(s) uploaded successfully.");
            clearList();
        })
        .catch(error => {
            console.error("Error uploading files:", error);
            // alert("An error occurred while uploading files.");
        });
});

// avoid loading files (default browser behaviour) when drag&drop action is out of drop area (
window.addEventListener("dragover",function(e){
        e = e || event;
        e.preventDefault();
    },false);
window.addEventListener("drop",function(e){
    e = e || event;
    e.preventDefault();
},false);
