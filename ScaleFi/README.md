# ScaleFi

[![Build Status](https://travis-ci.org/upscaletech/ScaleFi.svg?branch=master)](https://travis-ci.org/upscaletech/ScaleFi)

ScaleFi has been created to help businesses scale with data driven, coin allocation in their accounts and portfolios. Additionally, through the machine learning alrogithmn risk reduction is optimized for the user.


## Future

We aim to build

`decentralized credit rating`
`collecting mechanism - external - internal`
`payment channels`

## Dependencies

This project uses Node.js version 8.10.0 - 8.11.3.

If you are running multiple versions of Node.js, consider using Node Version Manager (nvm). nvm is an easy way to configure and manage different Node.js versions to work with your projects.

## Getting Started?

A Makefile is provided for easy setup of the environment.

Some pre-requisites are required in order to utilize the Makefile.

Assuming you have npm already, Install hardhat

`make install hardhat`

`make install_deps`

## Running ETH Bridge

`npx ethereum-bridge -a 9 -H 127.0.0.1 -p 9545 --dev`

## Tests

Start hardhat and its development blockchain with

`make start_console`

Run the example migrations as well as the accompanying tests inside the hardhat console

```
hardhat(develop)> migrate --reset
hardhat(develop)> test

```
