var initSketch = false;

var codeEditor = {
  allCode: null,
  appendCode: function (toAppend) {
    // if the same code doesnt already exist
    if (this.allCode.indexOf(toAppend) === -1) {
      var sketchDOM = $(this.allCode);

      // find the fabPreview element
      var srcIndex = _.findIndex(sketchDOM, function (elem) {
        return elem.id === "fabPreview";
      });
      var src = sketchDOM[srcIndex].text;
      var newSrc = src + "\n" + toAppend + "\n";

      this.allCode = this.allCode.replace(src, newSrc);
    }
  },
};

// Initialize CodeMirror editor
var editor = CodeMirror(document.getElementById("code"), {
  theme: "paraiso-light",
  mode: { name: "javascript", globalVars: true },
  styleActiveLine: true,
  lineNumbers: true,
  lineWrapping: false,
  autoCloseBrackets: true,
  // styleSelectedText: true,
  // extraKeys: {
  //   "Tab": "indentMore"
  // }
});

// initialize the editor
if (sessionStorage.getItem("fabPreview")) {
  console.log("sessionstorage"); // this is run when you refresh the page
  codeEditor.allCode = sessionStorage.getItem("fabPreview");
  editor.setValue(codeEditor.allCode);
  hideHTMLFromEditor();
} else {
  console.log("else"); // this is run the first time its opened
  $.get("js/fabPreview.html", function (data) {
    sessionStorage.setItem("fabPreview", data);
    codeEditor.allCode = data;
    editor.setValue(data);
    hideHTMLFromEditor();
  });
}

function hideHTMLFromEditor() {
  var options = {
    collapsed: true,
    inclusiveLeft: true,
    inclusiveRight: true,
  };
  // hide the head of <html><body><script>
  editor.markText({ line: 0, ch: 0 }, { line: 0 }, options); // do not specify ch for the end point so the whole line is hidden
  // hide closing tags </script></html>
  editor.markText(
    { line: editor.lastLine(), ch: 0 },
    { line: editor.lastLine() },
    options
  );
}

function updatePreview() {
  var previewFrame = document.getElementById("preview");
  var preview =
    previewFrame.contentDocument || previewFrame.contentWindow.document;
  var fullCode = editor.getValue();

  if (!initSketch) {
    // write fabPreview.html to the iframe
    preview.open();
    preview.write(fullCode);
    preview.close();
    initSketch = true;
    var userCode = fullCode.split(
      /<script id='fabPreview'>let fab;|<\/script><\/body><\/html>/
    )[1];
    var beautified = js_beautify(userCode, { indent_size: 2 });
    editor.setValue(beautified);
    flashCode();
    evaluateJs(userCode);
  } else {
    evaluateJs(fullCode);
    evaluateJs("_once = false;");
    var beautified = js_beautify(fullCode, { indent_size: 2 });
    var scrollPos = editor.getScrollInfo();
    editor.setValue(beautified);
    flashCode();
    editor.scrollTo(scrollPos["left"], scrollPos["top"]); // preserve scroll location after flashing
  }
}

//run the code in the editor for the first time
setTimeout(updatePreview, 200);
hideHTMLFromEditor();

// functionality inspired from hydra, credit: https://github.com/hydra-synth/hydra/blob/aeea1cd794f9943356a5079b4911e9f8c3278bdc/frontend/web-editor/src/views/editor/editor.js#L122
function flashCode(start, end) {
  console.log("flash code!");
  // highlight the code when you run it
  if (!start) start = { line: editor.firstLine(), ch: 0 };
  if (!end) end = { line: editor.lastLine() + 1, ch: 0 };
  var marker = editor.markText(start, end, { className: "styled-background" });
  setTimeout(() => marker.clear(), 300);
}
