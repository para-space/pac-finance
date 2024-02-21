import { task } from "hardhat/config";
import {
  eNetwork,
  getPool,
  PAC_POOL_WRAPPER,
  WRAPPED_NATIVE_TOKEN_PER_NETWORK,
} from "../../helpers";
import { COMMON_DEPLOY_PARAMS } from "../../helpers/env";

task(`deploy-pac-pool-wrapper`, `deploy pac pool wrapper`).setAction(
  async (_, hre) => {
    const network = (
      process.env.FORK ? process.env.FORK : hre.network.name
    ) as eNetwork;

    const { deploy } = hre.deployments;
    const { deployer } = await hre.getNamedAccounts();

    const poolProxy = await getPool();
    const wrappedNativeTokenAddress = WRAPPED_NATIVE_TOKEN_PER_NETWORK[network];

    console.log("- Deployment of LeverageDepositor contract");
    const LeverageDepositor = await deploy(PAC_POOL_WRAPPER, {
      from: deployer,
      contract: "PacPoolWrapper",
      args: [poolProxy.address, wrappedNativeTokenAddress],
      ...COMMON_DEPLOY_PARAMS,
    });

    console.log("PacPoolWrapper deployed at:", LeverageDepositor.address);
  }
);
