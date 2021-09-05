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

You will need a working version of the `rtl_433` tool in your environment and validate it runs correctly.  Detailed instructions for isntallation available from the [merbanan/rtl_433 README](https://github.com/merbanan/rtl_433/blob/master/README.md).

Those on Raspbian, Ubuntu, or Debian based systems could use the following helper script to install it:
```
curl https://raw.githubusercontent.com/dayne/node-red-contrib-rtl_433/master/install-rtl_433-app | bash
```

**`reboot`** after that is completed. 

Test it by running:

```
rtl_433 -F json
```
Success looks like the command running and capturing decoded messages from devices chirping.  If you see data chirping on that command you can close the command using `CONTROL-C`

### Install the node

**recommended**: 
Install the node via the NodeRED palette manager. 
![GUI Pallet Install](https://raw.githubusercontent.com/dayne/node-red-contrib-rtl_433/master/docs/node-red-common-rtl_433-install.gif)

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

The config properties in the node are arguments that are passed directly to the  `rtl_433` daemon. Following options are available:

* `Frequency` - passes a `-f <frequency>` option for specific frequency for `rtl_433` listen on.
* `Device` - passes a `-d` option to select a specific device
* `Protocols` - passes `-R <device>` option to enable only specified device decoding protocol. Multiple protocols can be listed (comma or space separated)
* `Flex decoder` - passes `-X <decoder spec>` to the daemon. This allows to support devices where no hard coded protocol exists
* `Expert` - passes any additional argument to the daemon. Make sure to adhere to the permissible arguments and avoid any additional quoting (`"` or `'`). 
* `Supress duplicate messages` - Some sensors send the same data multiple times. Default is to discard these duplicate values.

For a complete reference of the `rtl_433` options refer to https://github.com/merbanan/rtl_433

Recommended quick start is to drop in the node and connect up to the debug tab
like so:

![Node to Debug Demo](https://raw.githubusercontent.com/dayne/node-red-contrib-rtl_433/master/docs/node-red-common-rtl_433-demo.gif)

### Debugging help

This node is developed/tested on two primary platforms: Ubuntu x86 and Raspbian
on an RPi4. Here are a few notes people have tossed back on making their system
more stable:

#### Raspberry Pi firmware update

If you are using a Raspberry Pi 4 with an older version of Raspian (any releases before July of 2019) and you are getting this error spammed in the console:
```
the USB rtlsdrl:  rtl_sdr_read_reg failed with -7
rtl_sdr_write_reg failed with -7
```

then you need to update the firmware using:

`sudo rpi-update`

#### rtl install failing: `usb_open error -3`

The rtl installer helper app tries to make bootstrapping the `rtl_433`
dependency easy on Debian/Ubuntu/Raspbian system. It is by no means perfect. 

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
* [@ondras](https://github.com/ondras) added option to specify additional rtl_433 protocols (the `-R ` option).
* [@Id405](https://github.com/Id405) de-duplicate chirp code.
* [@deisterhold](https://github.com/deisterhold) added allow specification of
  specific device option.
* [@Sineos](https://github.com/Sineos) added additional options Flex Getting,
  Expert, and Toggle duplicate messages.
