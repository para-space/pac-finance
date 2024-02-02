import { task } from "hardhat/config";
import {
  ConfigNames,
  configureReservesByHelper,
  eNetwork,
  getReserveAddresses,
  getTreasuryAddress,
  IAaveConfiguration,
  initReservesByHelper,
  loadPoolConfig,
  POOL_ADDRESSES_PROVIDER_ID,
  POOL_DATA_PROVIDER,
  savePoolTokens,
} from "../../helpers";
import { MARKET_NAME } from "../../helpers/env";

task(`add-new-asset`, `add new asset from market config`).setAction(
  async (_, hre) => {
    const network = (
      process.env.FORK ? process.env.FORK : hre.network.name
    ) as eNetwork;
    const { deployer } = await hre.getNamedAccounts();

    const poolConfig = (await loadPoolConfig(
      MARKET_NAME as ConfigNames
    )) as IAaveConfiguration;

    const addressProviderArtifact = await hre.deployments.get(
      POOL_ADDRESSES_PROVIDER_ID
    );

    const {
      ATokenNamePrefix,
      StableDebtTokenNamePrefix,
      VariableDebtTokenNamePrefix,
      SymbolPrefix,
      ReservesConfig,
      RateStrategies,
    } = poolConfig;

    // Deploy Reserves ATokens

    const treasuryAddress = await getTreasuryAddress(poolConfig, network);
    const incentivesController = await hre.deployments.get("IncentivesProxy");
    const reservesAddresses = await getReserveAddresses(poolConfig, network);

    if (Object.keys(reservesAddresses).length == 0) {
      console.warn("[WARNING] Skipping initialization. Empty asset list.");
      return;
    }

    await initReservesByHelper(
      ReservesConfig,
      reservesAddresses,
      ATokenNamePrefix,
      StableDebtTokenNamePrefix,
      VariableDebtTokenNamePrefix,
      SymbolPrefix,
      deployer,
      treasuryAddress,
      incentivesController.address
    );
    hre.deployments.log(`[Deployment] Initialized all reserves`);

    await configureReservesByHelper(ReservesConfig, reservesAddresses);

    // Save AToken and Debt tokens artifacts
    const dataProvider = await hre.deployments.get(POOL_DATA_PROVIDER);
    await savePoolTokens(reservesAddresses, dataProvider.address);

    hre.deployments.log(`[Deployment] Configured all reserves`);
  }
);
