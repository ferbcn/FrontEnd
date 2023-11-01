const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');

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

    handleFiles(droppedFiles);
    // Add the dropped files to the file input
    // Life could be so easy as // fileInput.files.add = droppedFiles;
    // But no way to concat easier?

    // Create a new array to store both the existing and dropped files
    const combinedFiles = Array.from(fileInput.files);
    // Append the dropped files to the combinedFiles array
    for (let i = 0; i < droppedFiles.length; i++) {
        combinedFiles.push(droppedFiles[i]);
    }
    // Create a new FileList object from the combinedFiles array
    const newFileList = new DataTransfer();
    combinedFiles.forEach((file) => {
        newFileList.items.add(file);
    });
    // Set the newFileList as the new files for the file input
    fileInput.files = newFileList.files;

});

// Handle file input change
fileInput.addEventListener('change', (e) => {
    const files = fileInput.files;
    handleFiles(files);
});

// Add dropped files to list
function handleFiles(files) {
    for (const file of files) {
        const listItem = document.createElement('li');
        listItem.classList.add('file-item');
        listItem.innerHTML = `
            <div class="file-name" data-file="${file.name}">${file.name}
            <span class="file-remove" data-file="${file.name}">&times;</span></div>
        `;
        fileList.appendChild(listItem);

        const removeButton = listItem.querySelector('.file-remove');
        removeButton.addEventListener('click', (e) => {
            const fileName = e.target.getAttribute('data-file');
            const fileToRemove = fileList.querySelector(`[data-file="${fileName}"]`);
            console.log("File removed: " + fileToRemove)
            fileToRemove.remove();
        });
        fileInput.files = fileList.files;
    }
}


function clearList(){
    let fileList = document.getElementById("file-list");
    while (fileList.firstChild) {
        fileList.removeChild(fileList.firstChild);
    }
    fileInput.value = '';
}

// send files to endpoint
document.getElementById("uploadButton").addEventListener("click", function () {
    const files = fileInput.files;

    // let files = document.getElementById("file-list");
    // Check for missing files
    if (files.length === 0) {
        alert("Please select one or more files.");
        return;
    }
    // Prepare form data
    const formData = new FormData();
    let filenames = "";
    for (let i = 0; i < files.length; i++) {
        console.log("Sending files...")
        let file = files[i];
        console.log(file);
        filenames += file.name+"\n";
        formData.append("files", file);
    }
    // alert("Uploading file(s) :\n____________________\n"+filenames);
    fetch("/upload", {
        method: "POST",
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            alert(files.length + " file(s) uploaded successfully.");
            clearList();
        })
        .catch(error => {
            console.error("Error uploading files:", error);
            // alert("An error occurred while uploading files.");
        });
});