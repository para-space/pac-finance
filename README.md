# Special Note

We would like to first acknowledge that PAC Finance is originally a fork of the Aave v3 codebase. We are grateful for the foundation provided by Aave and are committed to contributing to the ongoing development and innovation within the DeFi ecosystem.


# Pac Finance Deployments

This Node.js repository contains the configuration and deployment scripts for the Pac Finance protocol core and periphery contracts. The repository makes use of `hardhat` and `hardhat-deploy` tools to facilitate the deployment of Pac Finance protocol.

## Requirements

- Node.js >= 16
- Alchemy key
  - If you use a custom RPC node, you can change the default RPC provider URL at [./helpers/hardhat-config-helpers.ts:25](./helpers/hardhat-config-helpers.ts).
- Etherscan API key _(Optional)_

## Getting Started

1. Install Node.JS dependencies:

   ```
   npm i
   ```

2. Compile contracts before running any other command, to generate Typechain TS typings:

   ```
   npm run compile
   ```

## How to deploy Pac Finance in testnet network

To deploy Pac Finance in a Testnet network, copy the `.env.example` into a `.env` file, and fill the environment variables `MNEMONIC`, and `ALCHEMY_KEY`.

```
cp .env.example .env
```

Edit the `.env` file to fill the environment variables `MNEMONIC`, `ALCHEMY_KEY` and `MARKET_NAME`. You can check all possible pool configurations in this [file](https://github.com/aave/aave-v3-deploy/blob/09e91b80aff219da80f35a9fc55dafc5d698b574/helpers/market-config-helpers.ts#L95).

```
nano .env
```

Run the deployments scripts and specify which network & aave market configs you wish to deploy.

```
HARDHAT_NETWORK=goerli npx hardhat deploy
```

## How to deploy Pac Finance in fork network

You can use the environment variable `FORK` with the network name to deploy into a fork.

```
FORK=main MARKET_NAME=Aave npx hardhat deploy
```

## How to integrate in your Hardhat project

You can install the `@aave/deploy-v3` package in your Hardhat project to be able to import deployments with `hardhat-deploy` and build on top of Aave in local or testnet network.

To make it work, you must install the following packages in your project:

```
npm i --save-dev @aave/deploy-v3 @aave/core-v3 @aave/periphery-v3
```

Then, proceed to load the deploy scripts adding the `externals` field in your Hardhat config file at `hardhat.config.js|ts`.

```
# Content of hardhat.config.ts file

export default hardhatConfig: HardhatUserConfig = {
   {...},
   external: {
    contracts: [
      {
        artifacts: 'node_modules/@aave/deploy-v3/artifacts',
        deploy: 'node_modules/@aave/deploy-v3/dist/deploy',
      },
    ],
  },
}
```

After all is configured, you can run `npx hardhat deploy` to run the scripts or you can also run it programmatically in your tests using fixtures:

```
import {getPoolAddressesProvider} from '@aave/deploy-v3';

describe('Tests', () => {
   before(async () => {
      // Set the MARKET_NAME env var
      process.env.MARKET_NAME = "Aave"

      // Deploy Pac Finance contracts before running tests
      await hre.deployments.fixture(['market', 'periphery-post']);`
   })

   it('Get Pool address from AddressesProvider', async () => {
      const addressesProvider = await getPoolAddressesProvider();

      const poolAddress = await addressesProvider.getPool();

      console.log('Pool', poolAddress);
   })
})

```

## How to verify your contract deployments

```
npx hardhat --network XYZ etherscan-verify --api-key YZX
```

## Project Structure

| Path                  | Description                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| deploy/               | Main deployment scripts dir location                                                                                            |
| ├─ 00-core/           | Core deployment, only needed to run once per network.                                                                           |
| ├─ 01-periphery_pre/  | Periphery contracts deployment, only need to run once per network.                                                              |
| ├─ 02-market/         | Market deployment scripts, depends of Core and Periphery deployment.                                                            |
| ├─ 03-periphery_post/ | Periphery contracts deployment after market is deployed.                                                                        |
| deployments/          | Artifacts location of the deployments, contains the addresses, the abi, solidity input metadata and the constructor parameters. |
| markets/              | Directory to configure Aave markets                                                                                             |
| tasks/                | Hardhat tasks to setup and review market configs                                                                                |
| helpers/              | Utility helpers to manage configs and deployments                                                                               |
