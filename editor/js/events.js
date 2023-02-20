window.addEventListener("keydown", handleKeyPress);

function handleKeyPress(event) {
  let keyCode = event.code;

  if (keyCode === "Enter" && event.shiftKey && event.metaKey) {
    event.preventDefault();
    evaluateJs("_fab.print();");
  } else if (keyCode === "Enter" && event.shiftKey) {
    event.preventDefault();
    updatePreview();
  } else if (keyCode === "Slash" && event.metaKey) {
    editor.toggleComment();
  }
}

async function setPrinter(p) {
  let response = await fetch("printers/" + p + ".json");
  let settings = await response.text();
  evaluateJs(`_fab.configure(${settings});`);
}

async function setTemplate(f) {
  let response = await fetch("js/examples/" + f + ".js");
  let responseText = await response.text();
  editor.setValue(responseText);

  updatePreview();
}

function saveSketch() {
  var sketchContents = editor.getValue();
  var sketchBlob = new Blob([sketchContents], { type: "text/plain" });
  var downloadLink = document.createElement("a");
  downloadLink.download = "fab.js";
  downloadLink.innerHTML = "Download File";
  if (window.webkitURL != null) {
    downloadLink.href = window.webkitURL.createObjectURL(sketchBlob);
  } else {
    downloadLink.href = window.URL.createObjectURL(sketchBlob);
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
  }
  downloadLink.click();
}

document
  .getElementById("file-upload")
  .addEventListener("change", handleFileSelect, false);

function handleFileSelect(event) {
  const reader = new FileReader();
  reader.onload = handleFileLoad;
  reader.readAsText(event.target.files[0]);
}

function handleFileLoad(event) {
  console.log(event.target.result);
  editor.setValue(event.target.result);
}

function showInfoModal() {
  var modal = document.getElementById("info-modal");
  var span = document.getElementsByClassName("close")[0];
  modal.style.display = "block";

  span.onclick = function () {
    modal.style.display = "none";
  };
}
