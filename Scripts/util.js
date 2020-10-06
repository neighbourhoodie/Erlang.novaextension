
exports.openFile = async function(uri) {
    const newEditor = await nova.workspace.openFile(uri);
    if(newEditor) {
        return newEditor;
    }

    // Bug work around copied from nova-typescript
    console.warn("Retry open file: ", uri);
    return await nova.workspace.openFile(uri);
}


// https://stackoverflow.com/a/6969486
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function mk_escaped(path) {
    return new RegExp("^" + escapeRegExp("file://" + path));
}

const file_prefix = mk_escaped("")
const home_prefix = mk_escaped(nova.environment["HOME"]);
const vol_prefix = mk_escaped("/Volumes/Macintosh HD");


exports.clean_path = (path) => {
    const workspace_prefix = mk_escaped(nova.workspace.path);
    path = decodeURIComponent(path);
    return (
        path
            .replace(vol_prefix, "file://")
            .replace(workspace_prefix, ".")
            .replace(home_prefix, "~")
            .replace(file_prefix, "")
    );
}


exports.show_location = async function(location) {
    const editor = await exports.openFile(location.uri);
    if(!editor) {
        nova.workspace.showErrorMessage("Failed to open: " + uri);
        return;
    }

    var range = exports.toNovaRange(editor.document, location.range);
    editor.selectedRange = range;
    editor.scrollToPosition(range.start);
}


exports.wrap_command = (command) => {
    return async function wrapped(...args) {
        try {
            await command(...args);
        } catch (err) {
            nova.workspace.showErrorMessage(err);
        }
    };
}


// Conversions borrowed from nova-typescript
exports.toLSPRange = (document, range) => {
    const contents = document.getTextInRange(new Range(0, document.length));
    const lines = contents.split(document.eol);
    
    let start = null;
    let chars = 0;
    
    for(let idx = 0; idx < lines.length; idx++) {
        const len = lines[idx].length + document.eol.length;

        if(!start && chars + len > range.start) {
            start = {
                line: idx,
                character: range.start - chars
            }
        }

        if(start && chars + len > range.end) {
            return {
                start: start,
                end: {
                    line: idx,
                    character: range.end - chars
                }
            }
        }

        chars += len;
      }
      return null;
}

exports.toNovaRange = (document, range) => {
    const contents = document.getTextInRange(new Range(0, document.length));
    const lines = contents.split(document.eol);

    let chars = 0;
    let start = 0;
    let end = 0;

    console.log("Range: " + JSON.stringify(range));

    for(let idx = 0; idx < lines.length; idx++) {
        if(range.start.line == idx) {
            start = chars + range.start.character;
        }

        if(range.end.line == idx) {
            end = chars + range.end.character;
            console.log("Creating: " + start + ":" + end);
            return new Range(start, end);
        }

        chars += lines[idx].length + document.eol.length;
    }

    console.log("Creating: " + start + ":" + start);
    return new Range(start, start);
}