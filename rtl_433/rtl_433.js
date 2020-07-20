module.exports = function(RED) {

	let spawn = require("child_process").spawn;
	// let child = spawn("rtl_433 -F json");

	// https://stackoverflow.com/a/20392392
	function tryParseJSON(jsonString) {
		try {
			let o = JSON.parse(jsonString);

			// Handle non-exception-throwing cases:
			// Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
			// but... JSON.parse(null) returns null, and typeof null === "object",
			// so we must check for that, too. Thankfully, null is falsey, so this suffices:
			if (o && typeof o === "object") {
				return o;
			}
		} catch (e) {}

		return false;
	};

	function runRtl433(node) {
		let line = "";
		// node.status({fill: "grey", shape: "ring", text: "no command rtl_433"});
		// node.log("runRtl433(): launched");
		try {
			node.child = spawn(node.cmd, node.args);
			logVerbose(node.cmd + " " + JSON.stringify(node.args));

			node.status({
				fill: "green",
				shape: "dot",
				text: "listening"
			});
			node.running = true;
			node.log("runRtl433(): node.running = true");

			node.child.stdout.on("data", function(data) {
				// node.log("runRtl433(): node.child.stdout data: " + data);  // debug only
				// only send lines that are parsable JSON data
				logVerbose("out: " + data);
				line += data.toString();
				let bits = line.split("\n");
				// node.log("rtl_433: bits.length = " + bits.length);

				while (bits.length > 1) {
					let b = bits.shift();
					// node.log(b); // debugging only
					let o = tryParseJSON(b);

					if (o) {
						lastmsg.payload = o

						if (JSON.stringify(lastmsg.payload) !== JSON.stringify(o)) { // some sensors send the same message multiple times - skip dups
							// node.log("rtl_433: send message:        " + JSON.stringify(o));
							node.send([lastmsg, null, null]);
						}

					} else {
						// not JSON
						logVerbose("rtl_433 STDOUT: " + o);
						node.warn('Received non json message from rtl_433 subprocess');
					}

				}

				line = bits[0];
			});

			node.child.stderr.on("data", function(data) {
				node.log("rtl_433 STDERR:  " + data);
			});

			node.child.on('close', function(code, signal) {
				logVerbose(`rtl_433 ret: ${code}:${signal}`);
				node.running = false;
				node.child = null;
				let rc = code;

				if (code === null) {
					rc = signal;
				}

				node.send([null, null, {
					payload: rc
				}]);
				node.status({
					fill: "red",
					shape: "ring",
					text: "stopped"
				});
			});

			node.child.on('error', function(err) {

				switch (err.errno) {
					case "ENOENT":
						node.warn('Command not found' + node.cmd);
						break;

					case "EACCES":
						node.warn('Command not executable' + node.cmd);
						break;

					default:
						node.log("error: " + err);
						node.debug("rtl_433 error: " + err);
				}

				node.status({
					fill: "red",
					shape: "ring",
					text: "error"
				});
			});
		} catch (err) {

			switch (err.errno) {
				case "ENOENT":
					node.warn('Command not found' + node.cmd);
					break;

				case "EACCES":
					node.warn('Command not executable' + node.cmd);
					break;

				default:
					node.log("error: " + err);
					node.debug("rtl_433 error: " + err);
			}

			node.status({
				fill: "red",
				shape: "ring",
				text: "error"
			});
			node.running = false;
		}
	}

	function logVerbose(string) {
		if (RED.settings.verbose) {
			node.log(string)
		}
	}

	function Rtl433Node(config) {
		RED.nodes.createNode(this, config);
		this.running = false;
		this.cmd = "rtl_433";
		this.args = ["-F", "json"];
		this.op = "lines"
		this.autorun = true;
		let lastmsg = {};

		if (this.redo === true) {
			let loop = setInterval(function() {
				if (!this.running) {
					this.warn("Restarting : " + this.cmd);
					runRtl433();
				}
			}, 10000); // Restart after 10 secs if required
		}

		this.on("close", function(done) {
			clearInterval(loop);

			if (this.child != null) {
        let tout = setTimeout(function() {
					this.child.kill("SIGKILL"); // if it takes more than 3 sec kill it anyway
					done();
				}, 3000);

				this.child.on("exit", function() {
					clearTimeout(tout);
					done();
				});

				this.child.kill(this.closer);
				logVerbose(this.cmd + " stopped");
			} else {
				setTimeout(done, 100); // Why?
			}

			this.status({});
		});

		if (this.autorun) {
			runRtl433(this);
		}

		//node.on("input", function(msg) {
		//  node.send(msg);
		//});
	}

	RED.nodes.registerType("rtl_433", Rtl433Node);
}
