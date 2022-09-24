module.exports = function (RED) {
  var spawn = require('child_process').spawn
  // var child = spawn("rtl_433 -F json");

  // https://stackoverflow.com/a/20392392
  function tryParseJSON (jsonString) {
    try {
      var o = JSON.parse(jsonString)

      // Handle non-exception-throwing cases:
      // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
      // but... JSON.parse(null) returns null, and typeof null === "object",
      // so we must check for that, too. Thankfully, null is falsey, so this suffices:
      if (o && typeof o === 'object') {
        return o
      }
    } catch (e) { }

    return false
  };

  function Rtl433Node (config) {
    RED.nodes.createNode(this, config)
    this.running = false
    this.cmd = 'rtl_433'
    this.args = ['-F', 'json']
    if (config.device) {
      this.args.push('-d', config.device)
    }
    if (config.frequency) {
      this.args.push('-f', config.frequency)
    }
    if (config.protocols) {
      config.protocols.split(/[\s,]+/).forEach(p => this.args.push('-R', p))
    }
    if (config.flexgetter) {
      // The spawn args do their own quoting
      // Having quotes around the -X argument
      // will throw an error in the rtl_433 daemon
      const firstChar = config.flexgetter.charAt(0)
      const lastChar = config.flexgetter.charAt(config.flexgetter.length - 1)
      if ((firstChar === '\'' || firstChar === '\"') && (lastChar === '\'' || lastChar === '\"')) {
        this.args.push('-X', config.flexgetter.slice(1, -1))
      } else {
        this.args.push('-X', config.flexgetter)
      }
    }
    if (config.expert) {
      this.args = this.args.concat(config.expert.split(' '));
    }
    this.op = 'lines'
    this.autorun = true
    var node = this
    var lastmsg = {}

    function runRtl433 () {
      let line = ''
      // node.status({fill:"grey", shape:"ring", text:"no command rtl_433"});
      // node.log("runRtl433(): launched");
      try {
        node.child = spawn(node.cmd, node.args)
        if (RED.settings.verbose) { node.log(node.cmd + ' ' + JSON.stringify(node.args)) }
        node.status({ fill: 'green', shape: 'dot', text: 'listening' })
        node.running = true
        node.log('runRtl433(): node.running = true')

        node.child.stdout.on('data', function (data) {
          // node.log("runRtl433(): node.child.stdout data: "+data);  // debug only
          // only send lines that are parsable JSON data
          if (RED.settings.verbose) { node.log('out: ' + data) }
          line += data.toString()
          const lines = line.split('\n')

          while (lines.length > 1) {
            const l = lines.shift()
            const chirp = tryParseJSON(l)

            if (chirp && config.supressChirp) {
              // some sensors send multiple messages to ensure data delivery
              // there could be smarter handling of this but for now
              // we'll just drop any messages same as the last. One gotcha is
              // some sensors provide a sequence_num attribute that should
              // be removed before checking for equality.
              delete chirp.sequence_num

              if (JSON.stringify(lastmsg.payload) !== JSON.stringify(chirp)) {
                lastmsg.payload = chirp
                node.send([lastmsg, null, null])
              }
            } else if (chirp && !config.supressChirp) {
              lastmsg.payload = chirp
              node.send([lastmsg, null, null])
            } else {
              // not JSON
              node.log('rtl_433 STDOUT: ' + chirp)
            }
          }
          line = lines[0]
        })

        node.child.stderr.on('data', function (data) {
          node.log('rtl_433 STDERR:  ' + data)
        })

        node.child.on('close', function (code, signal) {
          if (RED.settings.verbose) { node.log('rtl_433 ret: ' + code + ':' + signal) }
          node.running = false
          node.child = null
          var rc = code
          if (code === null) { rc = signal }
          node.send([null, null, { payload: rc }])
          node.status({ fill: 'red', shape: 'ring', text: 'stopped' })
        })

        node.child.on('error', function (err) {
          if (err.errno === 'ENOENT') { node.warn('Command not found') } else if (err.errno === 'EACCES') { node.warn('Command not executable') } else { node.log('error: ' + err) }
          node.status({ fill: 'red', shape: 'ring', text: 'error' })
        })
      } catch (e) {
        if (e.errno === 'ENOENT') { node.warn('Command not found: ' + node.cmd) } else if (e.errno === 'EACCES') { node.warn('Command not executable: ' + node.cmd) } else {
          node.log('error: ' + e)
          node.debug('rtl_433 error: ' + e)
        }
        node.status({ fill: 'red', shape: 'ring', text: 'error' })
        node.running = false
      }
    }

    if (node.redo === true) {
      var loop = setInterval(function () {
        if (!node.running) {
          node.warn('Restarting : ' + node.cmd)
          runRtl433()
        }
      }, 10000) // Restart after 10 secs if required
    }

    node.on('close', function (done) {
      clearInterval(loop)
      if (node.child != null) {
        var tout
        node.child.on('exit', function () {
          if (tout) { clearTimeout(tout) }
          done()
        })
        tout = setTimeout(function () {
          node.child.kill('SIGKILL') // if it takes more than 3 sec kill it anyway
          done()
        }, 3000)
        node.child.kill(node.closer)
        if (RED.settings.verbose) { node.log(node.cmd + ' stopped') }
      } else { setTimeout(function () { done() }, 100) }
      node.status({})
    })

    if (this.autorun) { runRtl433() }

    // node.on("input", function(msg) {
    //  node.send(msg);
    // });
  }
  RED.nodes.registerType('rtl_433', Rtl433Node)
}
