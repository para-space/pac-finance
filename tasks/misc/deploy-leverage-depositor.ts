import { task } from "hardhat/config";
import {
  eNetwork,
  getPool,
  LEVERAGE_DEPOSITOR,
  WRAPPED_NATIVE_TOKEN_PER_NETWORK,
} from "../../helpers";
import { COMMON_DEPLOY_PARAMS } from "../../helpers/env";

task(`deploy-leverage-depositor`, `deploy leverage depositor`).setAction(
  async (_, hre) => {
    const network = (
      process.env.FORK ? process.env.FORK : hre.network.name
    ) as eNetwork;

    const { deploy } = hre.deployments;
    const { deployer } = await hre.getNamedAccounts();

    const poolProxy = await getPool();
    const wrappedNativeTokenAddress = WRAPPED_NATIVE_TOKEN_PER_NETWORK[network];

    console.log("- Deployment of LeverageDepositor contract");
    const LeverageDepositor = await deploy(LEVERAGE_DEPOSITOR, {
      from: deployer,
      contract: "LeverageDepositor",
      args: [poolProxy.address, wrappedNativeTokenAddress],
      ...COMMON_DEPLOY_PARAMS,
    });

    console.log("LeverageDepositor deployed at:", LeverageDepositor.address);
  }
);
