## node-red-contrib-rtl\_433 

A [Node-RED](https://nodered.org/) node that runs an instance of the
[rtl\_433](https://github.com/merbanan/rtl_433) tool.  `rtl_433` is a program to
decode traffic from devices that are broadcasting on 433.9 MHz, like temperature
sensors, door senors, tv remotes, garage door openers and such.

This is similiar to, and based on, the
[node-red-node-daemon](https://github.com/node-red/node-red-nodes/tree/master/utility/daemon)
that runs and monitors a long running system command.

This node calls out to the `rtl_433` command at start time and then pipes all
the 433 MHz messages that are captured and decoded as valid JSON messages.

The goal is to reduce the effort needed to integrate the power of the `rtl_433` tool into
nodeRED. 

## Install

###  Install the `rtl_433`

You will need a working version of the `rtl_433` tool in your environment and validate it runs correctly.  Those on Raspbian, Ubuntu, or Debian based systems should be safe to use the following helper script to do this work:

```
curl https://github.com/dayne/node-red-contrib-rtl_433/master/install-rtl_433-app | bash
```

After that completes and you reboot you should be able to run:
```
rtl_433 -F json
```

Success looks like the command running and capturing decoded messages from devices chirping.

### Install the node

Run the following command in your Node-RED user directory - typically
`~/.node-red`

Example:
```
cd ~/.node-red
npm i node-red-contrib-rtl_433
```

### Usage

Install the node and then start writing flows. More examples later once folks contribute them.

### Credits

This node is derived from the [`node-red-daemon`](https://github.com/node-red/node-red-nodes/blob/master/utility/daemon/daemon.js) node and focused on the specific command `rtl_433` usage.
