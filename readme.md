# DeFi Data On-Chain Collector

A collection of services and adapters to collect data core metrics from decentralized applications across blockchains, mainly DeFi data.
These data are collected by reading on-chain smart contracts and query histirical event logs on blockchains, avoid using external source or APIs.

Here are main steps we are going to do:
- Collect raw blockchain data from smart contracts.
- Transform them into data metrics (fees, total value locked, volumes, prices, ...).
- Save transformed data into database (using MongoDB) as datasets.
- Serve datasets via http API enpoints.
