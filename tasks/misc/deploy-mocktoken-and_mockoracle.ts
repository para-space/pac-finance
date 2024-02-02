import { task } from "hardhat/config";
import {
  ConfigNames,
  configureReservesByHelper,
  eNetwork,
  FAUCET_OWNABLE_ID,
  getParamPerNetwork,
  getReserveAddresses,
  getTreasuryAddress,
  IAaveConfiguration,
  initReservesByHelper,
  isProductionMarket,
  ITokenAddress,
  loadPoolConfig,
  MOCK_CHAINLINK_AGGREGATORS_PRICES,
  POOL_ADDRESSES_PROVIDER_ID,
  POOL_DATA_PROVIDER,
  savePoolTokens,
  TESTNET_PRICE_AGGR_PREFIX,
  TESTNET_TOKEN_PREFIX,
} from "../../helpers";
import {
  COMMON_DEPLOY_PARAMS,
  MARKET_NAME,
  PERMISSIONED_FAUCET,
} from "../../helpers/env";
import Bluebird from "bluebird";

task(`deploy-mock-asset`, `deploy mock asset and mock oracle`).setAction(
  async (_, hre) => {
    const network = (
      process.env.FORK ? process.env.FORK : hre.network.name
    ) as eNetwork;

    const { deploy } = hre.deployments;
    const { deployer, incentivesEmissionManager, incentivesRewardsVault } =
      await hre.getNamedAccounts();
    const poolConfig = await loadPoolConfig(MARKET_NAME as ConfigNames);

    if (isProductionMarket(poolConfig)) {
      console.log(
        "[Deployment] Skipping testnet token setup at production market"
      );
      // Early exit if is not a testnet market
      return;
    }
    // Deployment of FaucetOwnable helper contract
    // TestnetERC20 is owned by Faucet. Faucet is owned by defender relayer.
    console.log("- Deployment of FaucetOwnable contract");
    const faucetOwnable = await deploy(FAUCET_OWNABLE_ID, {
      from: deployer,
      contract: "Faucet",
      args: [deployer, PERMISSIONED_FAUCET],
      ...COMMON_DEPLOY_PARAMS,
    });

    console.log(
      `- Setting up testnet tokens for "${MARKET_NAME}" market at "${network}" network`
    );

    const reservesConfig = poolConfig.ReservesConfig;
    const reserveSymbols = Object.keys(reservesConfig);
    const assetAddress =
      getParamPerNetwork<ITokenAddress>(poolConfig.ReserveAssets, network) ||
      {};
    const oracleAddress =
      getParamPerNetwork<ITokenAddress>(
        poolConfig.ChainlinkAggregator,
        network
      ) || {};

    if (reserveSymbols.length === 0) {
      console.warn(
        "Market Config does not contain ReservesConfig. Skipping testnet token setup."
      );
      return;
    }

    // 0. Deployment of ERC20 mintable tokens for testing purposes
    await Bluebird.each(reserveSymbols, async (symbol) => {
      if (!reservesConfig[symbol]) {
        throw `[Deployment] Missing token "${symbol}" at ReservesConfig`;
      }

      if (assetAddress[symbol]) {
        console.log(`skip deploy mock token for ${symbol}`);
      } else {
        if (symbol == poolConfig.WrappedNativeTokenSymbol) {
          console.log("Deploy of WETH9 mock");
          await deploy(
            `${poolConfig.WrappedNativeTokenSymbol}${TESTNET_TOKEN_PREFIX}`,
            {
              from: deployer,
              contract: "WETH9Mock",
              args: [
                poolConfig.WrappedNativeTokenSymbol,
                poolConfig.WrappedNativeTokenSymbol,
                faucetOwnable.address,
              ],
              ...COMMON_DEPLOY_PARAMS,
            }
          );
        } else {
          console.log("Deploy of TestnetERC20 contract", symbol);
          await deploy(`${symbol}${TESTNET_TOKEN_PREFIX}`, {
            from: deployer,
            contract: "TestnetERC20",
            args: [
              symbol,
              symbol,
              reservesConfig[symbol].reserveDecimals,
              faucetOwnable.address,
            ],
            ...COMMON_DEPLOY_PARAMS,
          });
        }
      }

      if (oracleAddress[symbol]) {
        console.log(`skip deploy mock oracle for ${symbol}`);
      } else {
        const price = MOCK_CHAINLINK_AGGREGATORS_PRICES[symbol];
        if (!price) {
          throw `[ERROR] Missing mock price for asset ${symbol} at MOCK_CHAINLINK_AGGREGATORS_PRICES constant located at src/constants.ts`;
        }
        console.log("Deploy of MockAggregator contract for", symbol);
        await deploy(`${symbol}${TESTNET_PRICE_AGGR_PREFIX}`, {
          args: [price],
          from: deployer,
          ...COMMON_DEPLOY_PARAMS,
          contract: "MockAggregator",
        });
      }
    });
  }
);
