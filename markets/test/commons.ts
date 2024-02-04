import { parseUnits } from "ethers/lib/utils";
import { ZERO_ADDRESS } from "../../helpers/constants";
import {
  ICommonConfiguration,
  eEthereumNetwork,
  eArbitrumNetwork,
  TransferStrategy,
  AssetType,
} from "../../helpers/types";
import {
  rateStrategyStableOne,
  rateStrategyStableTwo,
  rateStrategyVolatileOne,
} from "./rateStrategies";
// ----------------
// PROTOCOL GLOBAL PARAMS
// ----------------

export const CommonsConfig: ICommonConfiguration = {
  MarketId: "Testnet Aave Market",
  ATokenNamePrefix: "Testnet",
  StableDebtTokenNamePrefix: "Testnet",
  VariableDebtTokenNamePrefix: "Testnet",
  SymbolPrefix: "Test",
  ProviderId: 0,
  OracleQuoteCurrencyAddress: ZERO_ADDRESS,
  OracleQuoteCurrency: "USD",
  OracleQuoteUnit: "8",
  WrappedNativeTokenSymbol: "WETH",
  ChainlinkAggregator: {},
  ReserveFactorTreasuryAddress: {},
  FallbackOracle: {},
  ReservesConfig: {},
  IncentivesConfig: {
    enabled: {
      [eEthereumNetwork.hardhat]: true,
    },
    rewards: {},
    rewardsOracle: {},
    incentivesInput: {},
  },
  EModes: {},
  FlashLoanPremiums: {
    total: 0.0001e4,
    protocol: 0,
  },
  RateStrategies: {
    rateStrategyVolatileOne,
    rateStrategyStableOne,
    rateStrategyStableTwo,
  },
};
