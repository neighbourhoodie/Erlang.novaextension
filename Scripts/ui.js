
const util = require("util.js");


let disposables = null;


function notify(title, body, timeout) {
    if(!timeout) {
        timeout = 2000
    }
    try {
        let req = new NotificationRequest();
        req.title = nova.localize(title);
        req.body = nova.localize(body);
        req.actions = [];
        nova.notifications.add(req);
        setTimeout(() => {
            nova.notifications.cancel(req.identifier);
        }, timeout);
    } catch(err) {
        console.log(err);
    }
}


function show_locations_tree(name, locations) {
    show_tree(locations_tree_provider(name, locations));
}


function locations_tree_provider(name, locations) {
    const files = new Map();
    for(var i = 0; i < locations.length; i++) {
        var path = util.clean_path(locations[i].uri);
        if(!files.has(path)) {
            files.set(path, []);
        }
        files.get(path).push(locations[i]);
    }
    for(let uri of files.keys()) {
       files.get(uri).sort((a, b) => {
           if(a.range.start.line != b.range.start.line) {
               return a.range.start.line - b.range.start.line;
           }
           return a.range.start.character - b.range.start.character;
       })
    };

    return {
        getChildren(element) {
            
            if(element == null) {
                return Array.from(files.keys());
            } else if(typeof element === "string") {
                return files.get(element) || [];
            }

            return [];
        },

        getTreeItem(element) {
            let item = null;
            if(typeof element === "string") {
                item = new TreeItem(
                        util.clean_path(element),
                        TreeItemCollapsibleState.Expanded
                    );
                item.path = element;
            } else {
                item = new TreeItem(name, TreeItemCollapsibleState.None);
                item.descriptiveText = "Line: " + element.range.start.line;
            }

            item.command = "erlang.show_result";

            return item;
        },

        async onSelect(element) {
            if(typeof element !== "string") {
                console.log(JSON.stringify(element));
                await util.show_location(element);
            }
        },
    };
}

function show_symbols_tree(symbols) {
    show_tree(symbols_tree_provider(symbols))
}

function symbols_tree_provider(symbols) {
    const names = {
        1: "File",
        2: "Module",
        3: "Namespace",
        4: "Package",
        5: "Class",
        6: "Method",
        7: "Property",
        8: "Field",
        9: "Constructor",
        10: "Enum",
        11: "Interface",
        12: "Function",
        13: "Variable",
        14: "Constant",
        15: "String",
        16: "Number",
        17: "Boolean",
        18: "Array",
        19: "Object",
        20: "Key",
        21: "Null",
        22: "Enum Member",
        23: "Struct",
        24: "Event",
        25: "Operator",
        26: "TypeParameter"
    };
        
    return {
        getChildren(element) {
            if(element == null) {
                return symbols;
            }
            return [];
        },

        getTreeItem(element) {
            let item = new TreeItem(names[element.kind], TreeItemCollapsibleState.None);
            item.descriptiveText = element.name;
            item.command = "erlang.show_result";
            return item;
        },

        async onSelect(element) {
            if(typeof element !== "string") {
                console.log(JSON.stringify(element));
                await util.show_location(element.location);
            }
        },
    };
}

function show_tree(provider) {
    if(disposables != null) {
        disposables.dispose();
    }

    const new_disposables = new CompositeDisposable();

    const tree = new TreeView("erlang.sidebar.search_results", {
        dataProvider: provider,
    });
    new_disposables.add(tree);

    // can't figure out how to force open the view, but if most usage is from the sidebar directly it's okay?
    if(!tree.visible) {
        notify("Search results updated in Erlang sidebar.");
    }

    command = nova.commands.register(
            "erlang.show_result",
            util.wrap_command(async () => {
                await Promise.all(tree.selection.map(provider.onSelect));
            })
        );

    new_disposables.add(command);
    disposables = new_disposables;
}


exports.notify = notify;
exports.show_locations_tree = show_locations_tree;
exports.show_symbols_tree = show_symbols_tree;
