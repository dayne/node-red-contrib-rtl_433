module.exports = function(RED) {
	let spawn = require("child_process").spawn;
	// let child = spawn("rtl_433 -F json");

	// https://stackoverflow.com/a/20392392
	function tryParseJSON(jsonString) {
		try {
			let o = JSON.parse(jsonString);

			if (o && typeof o === "object") {
				return o;
			}
		} catch (e) {}

		return false;
	}

	function logVerbose(string, node) {
		if (RED.settings.verbose) {
			node.log(string)
		}
	}

	function runRtl433(node) {
		let line = "";
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
				// only send lines that are parsable JSON data
				logVerbose("out: " + data);
				line += data.toString();
				let lines = line.split("\n");

				while (lines.length > 1) {
					let l = lines.shift();
					node.log(l)
					let chirp = tryParseJSON(l);
					node.log(JSON.stringify(chirp))

					if (chirp) {
						/*
						Some sensors send triplicate messages to ensure data delivery.
						RTL_433 should probably handle these triplicate messages but it doesnt so we have to.
						Really there should be proper checking of the triplicate messages but a lazy workaround
						is to just drop any messages that are the same as the last line. Additionally some
						sensors provide a sequence_num attribute that tells what message in the triplicate sequence
						the message is. This has to be deleted before checking for equality.
						*/
						delete chirp.sequence_num;

						if (JSON.stringify(node.lastmsg) !== JSON.stringify(chirp)) {
							node.send([{
								payload: chirp
							}, null, null]);
						}

						node.lastmsg = chirp;
					} else {
						// not JSON
						logVerbose("rtl_433 STDOUT: " + o);
						node.warn('Received non json message from rtl_433 subprocess');
					}

				}

				line = lines[0];
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

	function Rtl433Node(config) {
		RED.nodes.createNode(this, config);
		this.running = false;
		this.cmd = "rtl_433";
		this.args = ["-F", "json"];
		if (config.frequency) {
			this.args.push("-f", config.frequency)
		}
		this.op = "lines"
		this.autorun = true;
		this.lastmsg = {};
		let node = this

		if (node.redo === true) {
			let loop = setInterval(function() {
				if (!node.running) {
					node.warn("Restarting : " + node.cmd);
					runRtl433();
				}
			}, 10000); // Restart after 10 secs if required
		}

		node.on("close", function(done) {
			clearInterval(loop);

			if (node.child != null) {
				let tout = setTimeout(function() {
					node.child.kill("SIGKILL"); // if it takes more than 3 sec kill it anyway
					done();
				}, 3000);

				node.child.on("exit", function() {
					clearTimeout(tout);
					done();
				});

				node.child.kill(node.closer);
				logVerbose(node.cmd + " stopped");
			} else {
				setTimeout(done, 100);
			}

			node.status({});
		});

		if (node.autorun) {
			runRtl433(node);
		}
	}

	RED.nodes.registerType("rtl_433", Rtl433Node);
}
