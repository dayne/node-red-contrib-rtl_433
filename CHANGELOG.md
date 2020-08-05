# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic
Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.4] - 2020-08-04
- Added [@ondras](https://github.com/ondras) option to specify additional rtl_433 protocols (the -R option). 
- @ondras also separated individual config items into proper rows for better UI formatting.

## [0.1.3] - 2020-07-28
- Added [@isramos](https://github.com/isramos) frequency option
- Added note about running `rpi-update` to README
- Color flair for `rtl_433` installer helper

## [0.1.2] - 2020-03-01
- Improved and rename the `install-rtl_433-app`. Fixed links in README to the
  script
- Cleaned up package description

## [0.1.1] - 2020-02-19
- Added 'node-red' to `package.js` keywords section to allow this to be discoverable on https://flows.nodered.org
- Cleaned up README and added install instructions for the `rtl_433` tool stack.
- Added `rpi-setup.sh` script to help bootstrap a system into a usable `rtl_433` environment.

## [0.1.0] - 2020-02-17
### Initial Release
- Core functionality for a `rtl_433` node that produces json payload outputs
  from a spawned `rtl_433`.  Restarting & redeploying works as expcted.
- Basic info documentation for node written.
- Ready for testing by others.
