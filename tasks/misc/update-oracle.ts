import { task } from "hardhat/config";
import {
  ConfigNames,
  eNetwork, getAaveOracle,
  getChainlinkOracles,
  getPairsTokenAggregator, getPoolAddressesProvider,
  getReserveAddresses,
  ICommonConfiguration,
  loadPoolConfig,
  ORACLE_ID,
  POOL_ADDRESSES_PROVIDER_ID,
  ZERO_ADDRESS,
} from "../../helpers";
import { COMMON_DEPLOY_PARAMS, MARKET_NAME } from "../../helpers/env";
import { parseUnits } from "ethers/lib/utils";

task(`update-oracle`, `update new oracle`).setAction(async (_, hre) => {
  if (!hre.network.config.chainId) {
    throw new Error("INVALID_CHAIN_ID");
  }

  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const poolConfig = await loadPoolConfig(MARKET_NAME as ConfigNames);
  const network = (
    process.env.FORK ? process.env.FORK : hre.network.name
  ) as eNetwork;

  const { OracleQuoteUnit } = poolConfig as ICommonConfiguration;

  const { address: addressesProviderAddress } = await hre.deployments.get(
    POOL_ADDRESSES_PROVIDER_ID
  );

  const fallbackOracleAddress = ZERO_ADDRESS;

  const reserveAssets = await getReserveAddresses(poolConfig, network);
  const chainlinkAggregators = await getChainlinkOracles(poolConfig, network);

  const [assets, sources] = getPairsTokenAggregator(
    reserveAssets,
    chainlinkAggregators
  );

  // Deploy AaveOracle
  await deploy(ORACLE_ID, {
    from: deployer,
    args: [
      addressesProviderAddress,
      assets,
      sources,
      fallbackOracleAddress,
      ZERO_ADDRESS,
      parseUnits("1", OracleQuoteUnit),
    ],
    ...COMMON_DEPLOY_PARAMS,
    contract: "AaveOracle",
  });

  console.log(`\tFinished AAVE Oracle deployment`);
});
