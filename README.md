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

## Stacks Used **

- Defi Ecosystem: We’re targeting the DeFi ecosystem because we want to onboard small businesses who are not familiar with DeFi into the decentralized arena by allowing them to maximize their savings & grow their assets.
- Celo: We’re using Celo to integrate a staking protocol for the users assets in order to give them access to stable currencies, low multi-currency gas fees, phone number mapping & cross chain interoperability.
- Polygon: We’re using polygon to provide us with peer to peer trading between assets, a lending protocol and the ability to save our users assets in their non-custodial wallet.
- Transak: We’re using Transak to implement an on/off ramp integration that will allow us to accept payments from the user by credit card, debit card or bank transfer.
- Figment: We’re using Figment’s DataHub to implement a Polygon & Celo Bridge to allow for interoperability.
- Storj: We’re using Storj to save our users information since we will be managing their non-custodial wallet on our platform. We’ll use polygon to implement a connection to Storj so  every so often we will cycle through the internal storage and have it sent to Storj.
- Coinbase: We’re using Coinbase to allow users to deposit their earned and/or lent assets into their custodial account in order to be used as fiat currency.
