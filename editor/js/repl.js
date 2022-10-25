var errorState = {};

errorState = new Proxy({ message: "" }, {
    set(target, prop, val) {
        target[prop] = val;
        errorConsole = window.document.getElementById("error-log");
        (val == "") ? errorConsole.style.display = "none" : errorConsole.style.display = "block";
        errorConsole.innerHTML = val;
    }
});

function evaluateJs(code) {
    // there must be a better way to do this...
    // can't handle code errors which happen in p5 loops (draw, etc) through try/catch-ing the eval()
    // instead, inject try/catch loops here by iterating through the ast
    try {
        var ast = acorn.parse(code, { ecmaVersion: 2020 });
        var codeToEval = ''
        errorState.message = "";
        for (const n in ast['body']) {
            var nodeBody = code.slice(ast['body'][n]['start'], ast['body'][n]['end']);
            if (ast['body'][n]['type'] == 'FunctionDeclaration') {
                functionDeclaration = code.slice(ast['body'][n]['start'], ast['body'][n]['body']['start'] + 1);
                functionBody = code.slice(ast['body'][n]['body']['start'] + 1, ast['body'][n]['end'] - 1);
                nodeBody = functionDeclaration + '\ntry {\n' + functionBody + '\n}\ncatch (e){\nwindow.parent.errorState.message=e.message;\n}\n}\n'
            }
            codeToEval += nodeBody
        }
        document.getElementById('preview').contentWindow.eval(codeToEval);
    }
    catch (e) {
        console.log(e.message);
        errorState.message = e.message;
    }
}
