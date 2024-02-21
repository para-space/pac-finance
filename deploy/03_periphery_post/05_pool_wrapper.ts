import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { COMMON_DEPLOY_PARAMS, MARKET_NAME } from "../../helpers/env";
import { WRAPPED_NATIVE_TOKEN_PER_NETWORK } from "../../helpers/constants";
import {
  ConfigNames,
  eNetwork,
  getPool,
  isTestnetMarket,
  PAC_POOL_WRAPPER,
  loadPoolConfig,
  TESTNET_TOKEN_PREFIX, GAS_REFUND, PacPoolWrapper, waitForTx,
} from "../../helpers";
import {ethers} from "hardhat";

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

  const LeverageDepositor = await deploy(PAC_POOL_WRAPPER, {
    from: deployer,
    contract: "PacPoolWrapper",
    args: [poolProxy.address, wrappedNativeTokenAddress],
    ...COMMON_DEPLOY_PARAMS,
  });

  console.log("PacPoolWrapper deployed at:", LeverageDepositor.address);

  const gasRefund = await deploy(GAS_REFUND, {
    from: deployer,
    contract: "GasRefund",
    args: [LeverageDepositor.address],
    ...COMMON_DEPLOY_PARAMS,
  });
  console.log("gasRefund deployed at:", gasRefund.address);

  const poolWrapper = (await ethers.getContractAt(
    LeverageDepositor.abi,
    LeverageDepositor.address
  )) as PacPoolWrapper;

  await waitForTx(await poolWrapper.setGasRefund(gasRefund.address));
};

func.tags = ["periphery-post"];

export default func;
