
const commands = require("commands.js");
const util = require("util.js");


let client = null;
const disposables = new CompositeDisposable();

async function ensure_executable(rel_path) {
    return new Promise((resolve, reject) => {
        const proc = new Process("/usr/bin/env", {
            args: ["chmod", "755", nova.path.join(nova.extension.path, rel_path)],
            cwd: nova.extension.path
        });
        proc.onDidExit((code) => {
            if(code === 0) {
                resolve(code);
            } else {
                reject(code);
            }
        })
        proc.start();
    })
}

async function async_activate() {
    await ensure_executable("bin/sam");
    await ensure_executable("bin/log-wrapper.sh");

    if(client != null) {
        client.stop();
        client = null;
    }

    var server_settings = {
        type: "stdio",
        path: nova.path.join(nova.extension.path, "bin/sam"),
        args: []
    }

    if(nova.inDevMode()) {
        server_settings.args.push("-l");
        server_settings.args.push("debug");
    }

    client = new LanguageClient(
        "erlang",
        "Erlang Language Server",
        server_settings,
        {
            syntaxes: ["erlang"]
        }
    );

    client.start();

    commands.install_commands(client, disposables);
}

exports.activate = function() {
    // Do work when the extension is activated
    return async_activate().catch((err) => {
        console.error("Failed to activate Erlang extension");
        console.error(err);
        nova.workspace.showErrorMessage(err);
    }).then(() => {
      console.log("Erlang extension has been activated.");
    });
};

exports.deactivate = function() {
    // Clean up state before the extension is deactivated
    if(client != null) {
        client.stop();
    }
    client = null;
    disposables.dispose();
};

// Done here for access to activate/deactivate
disposables.add(nova.commands.register(
        "erlang.language_server.restart",
        util.wrap_command(async () => {
            console.log("Deactivating...");
            setTimeout(async () => {
                console.log("Activating...");
                await async_activate();
            }, 1000)
        })
    ));


disposables.add(nova.commands.register(
    "erlang.language_server.check",
    util.wrap_command(async () => {
        if(client == null) {
            nova.workspace.showWarningMessage("LanguageClient is null.");
            return;
        }
        if(!client.running) {
            nova.workspace.showWarningMessage("LanguageClient is not running.");
            return;
        }
        const params = {
            command: "server-info"
        }

        try {
            const response = await client.sendRequest(
                "workspace/executeCommand",
                params
            );
            if(response == []) {
                nova.workspace.showWarningMessage("LanuageClient is running.");
            }
        } catch(err) {
            console.log("Error checking language server: " + JSON.stringify(err));
        }
    })
));
