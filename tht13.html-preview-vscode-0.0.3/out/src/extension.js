"use strict";
var vscode_1 = require("vscode");
var path = require("path");
var fileUrl = require("file-url");
function activate(context) {
    var previewUri;
    var provider;
    var registration;
    vscode_1.workspace.onDidChangeTextDocument(function (e) {
        if (e.document === vscode_1.window.activeTextEditor.document) {
            provider.update(previewUri);
        }
    });
    vscode_1.workspace.onDidChangeTextDocument(function (e) {
        if (e.document === vscode_1.window.activeTextEditor.document) {
            provider.update(previewUri);
        }
    });
    function sendHTMLCommand(displayColumn) {
        var previewTitle = "Preview: '" + path.basename(vscode_1.window.activeTextEditor.document.fileName) + "'";
        provider = new HtmlDocumentContentProvider();
        registration = vscode_1.workspace.registerTextDocumentContentProvider("html-preview", provider);
        previewUri = vscode_1.Uri.parse("html-preview://preview/" + previewTitle);
        return vscode_1.commands.executeCommand("vscode.previewHtml", previewUri, displayColumn).then(function (success) {
        }, function (reason) {
            console.warn(reason);
            vscode_1.window.showErrorMessage(reason);
        });
    }
    var previewToSide = vscode_1.commands.registerCommand("html.previewToSide", function () {
        var displayColumn;
        switch (vscode_1.window.activeTextEditor.viewColumn) {
            case vscode_1.ViewColumn.One:
                displayColumn = vscode_1.ViewColumn.Two;
                break;
            case vscode_1.ViewColumn.Two:
            case vscode_1.ViewColumn.Three:
                displayColumn = vscode_1.ViewColumn.Three;
                break;
        }
        return sendHTMLCommand(displayColumn);
    });
    var preview = vscode_1.commands.registerCommand("html.preview", function () {
        return sendHTMLCommand(vscode_1.window.activeTextEditor.viewColumn);
    });
    context.subscriptions.push(preview, previewToSide, registration);
}
exports.activate = activate;
var SourceType;
(function (SourceType) {
    SourceType[SourceType["SCRIPT"] = 0] = "SCRIPT";
    SourceType[SourceType["STYLE"] = 1] = "STYLE";
})(SourceType || (SourceType = {}));
var HtmlDocumentContentProvider = (function () {
    function HtmlDocumentContentProvider() {
        this._onDidChange = new vscode_1.EventEmitter();
    }
    HtmlDocumentContentProvider.prototype.provideTextDocumentContent = function (uri) {
        return this.createHtmlSnippet();
    };
    Object.defineProperty(HtmlDocumentContentProvider.prototype, "onDidChange", {
        get: function () {
            return this._onDidChange.event;
        },
        enumerable: true,
        configurable: true
    });
    HtmlDocumentContentProvider.prototype.update = function (uri) {
        this._onDidChange.fire(uri);
    };
    HtmlDocumentContentProvider.prototype.createHtmlSnippet = function () {
        var editor = vscode_1.window.activeTextEditor;
        if (editor.document.languageId !== "html" && editor.document.languageId !== "jade") {
            return this.errorSnippet("Active editor doesn't show a HTML or Jade document - no properties to preview.");
        }
        return this.preview(editor);
    };
    HtmlDocumentContentProvider.prototype.errorSnippet = function (error) {
        return "\n                <body>\n                    " + error + "\n                </body>";
    };
    HtmlDocumentContentProvider.prototype.createLocalSource = function (file, type) {
        var source_path = fileUrl(path.join(__dirname, "..", "..", "static", file));
        switch (type) {
            case SourceType.SCRIPT:
                return "<script src=\"" + source_path + "\"></script>";
            case SourceType.STYLE:
                return "<link href=\"" + source_path + "\" rel=\"stylesheet\" />";
        }
    };
    HtmlDocumentContentProvider.prototype.fixLinks = function (document, documentPath) {
        return document.replace(new RegExp("((?:src|href)=[\'\"])((?!http|\\/).*?)([\'\"])", "gmi"), function (subString, p1, p2, p3) {
            return [
                p1,
                fileUrl(path.join(path.dirname(documentPath), p2)),
                p3
            ].join("");
        });
    };
    HtmlDocumentContentProvider.prototype.preview = function (editor) {
        var doc = editor.document;
        return this.createLocalSource("header_fix.css", SourceType.STYLE) + this.fixLinks(doc.getText(), doc.fileName);
    };
    return HtmlDocumentContentProvider;
}());
//# sourceMappingURL=extension.js.map