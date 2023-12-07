import { task } from "hardhat/config";
import {
  ConfigNames,
  eNetwork,
  ICommonConfiguration,
  loadPoolConfig,
  ORACLE_ID,
  POOL_ADDRESSES_PROVIDER_ID
} from "../../helpers";
import {parseUnits} from "ethers/lib/utils";
import {COMMON_DEPLOY_PARAMS, MARKET_NAME} from "../../helpers/env";

task(
  `deploy-UiIncentiveDataProvider`,
  `Deploys the UiIncentiveDataProvider contract`
).setAction(async (_, hre) => {
  if (!hre.network.config.chainId) {
    throw new Error("INVALID_CHAIN_ID");
  }

  console.log(`\n- UiIncentiveDataProvider deployment`);
  const { deployer } = await hre.getNamedAccounts();
  // const artifact = await hre.deployments.deploy("UiIncentiveDataProviderV3", {
  //   from: deployer,
  // });

  const { address: addressesProviderAddress } = await hre.deployments.get(
      POOL_ADDRESSES_PROVIDER_ID
  );
  const poolConfig = await loadPoolConfig(MARKET_NAME as ConfigNames);
  const { OracleQuoteUnit } = poolConfig as ICommonConfiguration;
  const artifact = await hre.deployments.deploy(ORACLE_ID, {
    from: deployer,
    args: [
      addressesProviderAddress,
      [],
      [],
      "0xB3Da38dB811E502a320305CE58Fb1f773595A9e4",
      "0x73104Ac1Fb5A46E2b57a68c0a4d88ae130Da7e19",
      parseUnits("1", OracleQuoteUnit),
    ],
    ...COMMON_DEPLOY_PARAMS,
    contract: "AaveOracle",
  });

  console.log("ORACLE_ID deployed at:", artifact.address);
  console.log(`\tFinished UiIncentiveDataProvider deployment`);
});
