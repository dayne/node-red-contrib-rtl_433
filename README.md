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

You will need a working version of the `rtl_433` tool in your environment and validate it runs correctly.

```
rtl_433 -F json
```

### Install the node

Run the following command in your Node-RED user directory - typically
`~/.node-red`
```
npm i node-red-contrib-rtl_433
```

## Usage

I'll explain after I validate this works in a reasonable way and I write the
help page.

For now understand this is a focused node-red node that is derived heavily from
the node-red-daemon node at https://github.com/node-red/node-red-nodes/blob/master/utility/daemon/daemon.js

https://nodered.org/docs/creating-nodes/
* `npm install <location of node module>`

https://nodered.org/docs/creating-nodes/appearance
* https://fontawesome.com/v4.7.0/icons/
* Hrrm: https://klarsys.github.io/angular-material-icons/

hints:
* https://stackoverflow.com/questions/14332721/node-js-spawn-child-process-and-get-terminal-output-live
* https://github.com/nodejs/help/issues/1668
