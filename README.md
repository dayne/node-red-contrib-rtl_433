# node-red-contrib-rtl\_433 

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
curl
https://raw.githubusercontent.com/dayne/node-red-contrib-rtl_433/master/install-rtl_433-app
| bash
```

After that completes and you reboot you should be able to run:
```
rtl_433 -F json
```

Success looks like the command running and capturing decoded messages from devices chirping.

### Install the node

**recommended**: 
Install the node via the NodeRED palette manager.

**Local clone**: 
If you want to hack on the code you can clone this repository locally you can clone project
and install it into your local Node-RED user directory, which is typically `~/.node-red`.

Example:
```
cd ~/projects
git clone https://github.com/dayne/node-red-contrib-rtl_433
cd ~/.node-red
npm i ~/projects/node-red-contrib-rtl_433
```

## Usage

Install the node and then start writing flows. More examples later once folks contribute them.

* `config.frequency` can be used to pass a specific frequency for `rtl_433` listen on.


### Debugging help

This node is developed/tested on two primary platforms: Ubuntu x86 and Raspbian
on an RPi4. Here are a few notes people have tossed back on making their system
more stable:

#### Raspberry Pi firmware update

If you are getting:
```
rtl_sdr_read_reg failed with -7
rtl_sdr_write_reg failed with -7
```
Spammed in the console then it is reccomended to update the raspberry pi firmware with:

`sudo rpi-update` 

#### rtl install failing: `usb_open error -3`

The rtl installer helper app tries to make bootstrapping the `rtl_433`
dependancy easy on Debian/Ubuntu/Raspbian system. It is by no means perfect. 

```
usb_open error -3
Please fix the device permissions, e.g. by installing the udev rules file
rtl-sdr.rules
```

A possible fix is to copy https://github.com/keenerd/rtl-sdr/blob/master/rtl-sdr.rules
to /etc/udev/rules.d/rtl-sdr.rules and rebooting the pi.

More debug discussion on this with @isramos at [issue #4](https://github.com/dayne/node-red-contrib-rtl_433/issues/2)

## Credits

This node is derived from the [`node-red-daemon`](https://github.com/node-red/node-red-nodes/blob/master/utility/daemon/daemon.js) node and focused on the specific command `rtl_433` usage.

* [@isramos](https://github.com/isramos) added ability for user to enter the
  frequency.  Allows use of the rtl_433 tool for alternative fequencies(i.e.
  Honeywell 55800C2W running at 345Mhz)

