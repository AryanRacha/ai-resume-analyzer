const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("file-input");
const filePreview = document.getElementById("file-preview");

// Prevent default drag behaviors
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, (e) => e.preventDefault());
  dropArea.addEventListener(eventName, (e) => e.stopPropagation());
});

dropArea.addEventListener("dragover", () => {
  dropArea.classList.add("highlight");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("highlight");
});

dropArea.addEventListener("drop", (e) => {
  dropArea.classList.remove("highlight");
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    // Set dropped file to the input programmatically
    const dt = new DataTransfer();
    dt.items.add(files[0]);
    fileInput.files = dt.files;

    showPreview(files[0]);
  }
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) showPreview(file);
});

function showPreview(file) {
  const sizeKB = (file.size / 1024).toFixed(1);
  filePreview.innerHTML = `
      <div class="file-box">
        <div>📄 <strong>${file.name}</strong></div>
        <div>${sizeKB} KB</div>
      </div>
    `;
}
