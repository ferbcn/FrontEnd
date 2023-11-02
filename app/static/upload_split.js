document.addEventListener("DOMContentLoaded", function () {

    const fileList = document.getElementById("file-list");
    const clearFilesBtn = document.getElementById("clear-files");
    const dragDropArea = document.getElementById("drag-drop-area");
    const fileInput = document.getElementById("file-input");
    const sendFilesBtn = document.getElementById("send-files");

    const files = [];

    // Function to add a file to the list
    function addFileToList(file) {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="file-name" data-file="${file.name}">${file.name}
            <span class="file-remove" data-file="${file.name}">&times;</span></div>
        `;
        fileList.appendChild(li);
    }

    // Function to remove a file from the list
    function removeFileFromList(e) {
        const fileName = e.target.getAttribute('data-file');
        const fileToRemove = fileList.querySelector(`[data-file="${fileName}"]`);
        console.log("File removed: " + fileToRemove)
        fileToRemove.remove();
    }

    // Event listeners
    fileInput.addEventListener("change", function (e) {
        const selectedFiles = Array.from(e.target.files);
        selectedFiles.forEach((file) => {
            files.push(file);
            addFileToList(file);
        });
        fileInput.value = "";
    });

    dragDropArea.addEventListener("dragover", function (e) {
        e.preventDefault();
        e.stopPropagation();
        dragDropArea.style.border = "2px dashed #0074d9";
    });

    dragDropArea.addEventListener("dragleave", function () {
        dragDropArea.style.border = "2px dashed #ccc";
    });

    dragDropArea.addEventListener("drop", function (e) {
        e.preventDefault();
        e.stopPropagation();
        dragDropArea.style.border = "2px dashed #ccc";
        const droppedFiles = Array.from(e.dataTransfer.files);
        droppedFiles.forEach((file) => {
            files.push(file);
            addFileToList(file);
        });
    });

    fileList.addEventListener("click", function (e) {
        if (e.target.classList.contains("file-remove")) {
            removeFileFromList(e);
        }
    });

    clearFilesBtn.addEventListener("click", function () {
        clearAllFiles();
    });

    sendFilesBtn.addEventListener("click", function () {
        // Create a FormData object and append files to it
        const formData = new FormData();
        console.log(files);
        /*
        files.forEach((file, index) => {
            formData.append(`file${index}`, file);
        });
        */
        files.forEach((file, index) => {
            formData.append("files", file);
        });

        // Send a POST request using the fetch API
        fetch("/upload", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                // Handle the response data as needed
                console.log(data);
                clearAllFiles()

            })
            .catch((error) => {
                console.error("Error:", error);
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

    // function that clears all files in the backend and frontend list
    function clearAllFiles(){
        files.length = 0;
        fileList.innerHTML = "";
    }

});


