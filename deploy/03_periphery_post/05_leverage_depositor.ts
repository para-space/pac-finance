import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { COMMON_DEPLOY_PARAMS, MARKET_NAME } from "../../helpers/env";
import { WRAPPED_NATIVE_TOKEN_PER_NETWORK } from "../../helpers/constants";
import {
  ConfigNames,
  eNetwork,
  getPool,
  isTestnetMarket,
  LEVERAGE_DEPOSITOR,
  loadPoolConfig,
  TESTNET_TOKEN_PREFIX,
} from "../../helpers";

const func: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
  ...hre
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const network = (
    process.env.FORK ? process.env.FORK : hre.network.name
  ) as eNetwork;

  const poolProxy = await getPool();
  const poolConfig = loadPoolConfig(MARKET_NAME as ConfigNames);

  let wrappedNativeTokenAddress;

  // Local networks that are not live or testnet, like hardhat network,
  // will deploy a WETH9 contract as mockup for testing deployments
  if (isTestnetMarket(poolConfig)) {
    wrappedNativeTokenAddress = (
      await deployments.get(
        `${poolConfig.WrappedNativeTokenSymbol}${TESTNET_TOKEN_PREFIX}`
      )
    ).address;
  } else {
    if (!WRAPPED_NATIVE_TOKEN_PER_NETWORK[network]) {
      throw `Missing Wrapped native token for network: ${network}, fill the missing configuration at ./helpers/constants.ts`;
    }
    wrappedNativeTokenAddress = WRAPPED_NATIVE_TOKEN_PER_NETWORK[network];
  }

  const LeverageDepositor = await deploy(LEVERAGE_DEPOSITOR, {
    from: deployer,
    contract: "LeverageDepositor",
    args: [poolProxy.address, wrappedNativeTokenAddress],
    ...COMMON_DEPLOY_PARAMS,
  });

  console.log("LeverageDepositor deployed at:", LeverageDepositor.address);
};

func.tags = ["periphery-post"];

export default func;
