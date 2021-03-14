
const ui =require("ui.js");
const util = require("util.js");

function register(name, callable) {
    return nova.commands.register(name, callable);
}

exports.install_commands = function(client, disposables) {
    nova.workspace.onDidAddTextEditor((editor) => {
        let document = editor.document;

        if (!["erlang"].includes(document.syntax)) {
            return;
        }

        var ref = editor.onDidSave(() => {
            client.sendNotification("textDocument/didSave", {
                textDocument: {
                    uri: document.uri
                }
            });
        });
    });

    async function go_to_definition(editor) {
        try {
            const range = editor.selectedRange;
            const position = util.toLSPRange(editor.document, range).start;
            if(!position) {
                ui.notify("Not found.", "No text selected.");
                return;
            }
            const params = {
                textDocument: {uri: editor.document.uri},
                position: position
            };

            const response = await client.sendRequest(
                "textDocument/definition",
                params
            );

            //console.log("Response", JSON.stringify(response));

            if(response == null) {
                var text = editor.getTextInRange(range);
                var msg = "Unable to find a definition for '" + text + "'";
                ui.notify("Not Found", msg)
                return;
            }
            console.log("Response", response);
            util.show_location(response);

        } catch(err) {
            console.log(err, err.stack);
        }
    }

    async function show_references(editor) {
        try {
            const range = editor.selectedRange;
            const position = util.toLSPRange(editor.document, range).start;
            if(!position) {
                ui.notify("Not found.", "No text selected.");
                return;
            }

            const params = {
                textDocument: {
                    uri: editor.document.uri
                },
                position: position,
                context: {
                    includeDeclaration: true,
                },
            };

            const response = await client.sendRequest(
                "textDocument/references",
                params
            );

            //console.log("Response", JSON.stringify(response));

            if(response == null) {
                var text = editor.getTextInRange(range);
                var msg = "No references found for '" + text + "'";
                ui.notify("Not Found", msg)
                return;
            }

            ui.show_locations_tree(editor.selectedText, response);

        } catch(err) {
            console.log(err, err.stack);
        }
    }

    async function show_symbols(editor) {
        try {
            const params = {
                textDocument: {
                    uri: editor.document.uri
                }
            };

            const response = await client.sendRequest(
                "textDocument/documentSymbols",
                params
            );

            //console.log("Response", JSON.stringify(response));

            if(response == null) {
                var msg = "No symbols found for '" + editor.document.path + "'";
                ui.notify("Not Found", msg)
                return;
            }

            ui.show_symbols_tree(response);

        } catch(err) {
            console.log(err, err.stack);
        }
    }

    async function format_file(editor) {
        try {
            var insertSpaces = true;
            if(!editor.softTabs) {
                insertSpaces = false;
            }
            const params = {
                textDocument: {
                    uri: editor.document.uri
                },
                options: {
                    tabSize: editor.tabLength,
                    insertSpaces: insertSpaces
                }
            };

            const response = await client.sendRequest(
                "textDocument/formatting",
                params
            );

            // console.log("Response", JSON.stringify(response));

            if(response == null) {
                var msg = "Failed to reformat file.";
                ui.notify("Formatting Failed", msg)
                return;
            }

            await editor.edit((edit) => {
               for(var i = 0; i < response.length; i++) {
                   edit.replace(new Range(0, editor.document.length), response[i].newText);
                   // edit.delete(new Range(0, editor.document.length));
                   // edit.insert(0, response[i].newText);
               }
            });

        } catch(err) {
            console.log(err, err.stack);
        }
    }

    async function test_command(editor) {
        const range = editor.selectedRange;
        console.log("Selected: " + range.start + ":" + range.end);
        const position = util.toLSPRange(editor.document, range);
        console.log("Location: " + JSON.stringify(position));
    }

    disposables.add(register("erlang.go_to_definition", util.wrap_command(go_to_definition)));
    disposables.add(register("erlang.show_references", util.wrap_command(show_references)));
    disposables.add(register("erlang.show_symbols", util.wrap_command(show_symbols)));
    disposables.add(register("erlang.format_file", util.wrap_command(format_file)));
    disposables.add(register("erlang.test_command", util.wrap_command(test_command)));
}

