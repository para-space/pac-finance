import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { COMMON_DEPLOY_PARAMS, MARKET_NAME } from "../../helpers/env";
import {
  ConfigNames,
  eNetwork,
  getPool,
  loadPoolConfig,
  waitForTx,
  NativeYieldDistribute,
  IReserveParams,
  getReserveAddresses,
  getAToken,
  Native_Yield_Distribute,
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
  const { ReservesConfig } = poolConfig;
  const reservesAddresses = await getReserveAddresses(poolConfig, network);

  for (const [assetSymbol, { nativeYield }] of Object.entries(
    ReservesConfig
  ) as [string, IReserveParams][]) {
    if (!nativeYield) {
      console.log(`skip deploy NativeYieldDistribute for ${assetSymbol}`);
    }
    const { aTokenAddress } = await poolProxy.getReserveData(
      reservesAddresses[assetSymbol]
    );

    console.log("- Deployment of NativeYieldDistribute for", assetSymbol);
    const distributeContract = await deploy(Native_Yield_Distribute, {
      from: deployer,
      contract: "NativeYieldDistribute",
      args: [aTokenAddress, reservesAddresses[assetSymbol]],
      ...COMMON_DEPLOY_PARAMS,
    });

    console.log(
      "NativeYieldDistribute deployed at:",
      distributeContract.address
    );

    const aTokenInstance = await getAToken(aTokenAddress);
    await waitForTx(
      await aTokenInstance.setYieldDistributor(distributeContract.address)
    );
  }
};

func.tags = ["periphery-post"];

export default func;
