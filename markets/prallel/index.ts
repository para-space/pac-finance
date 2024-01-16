import { eParallelNetwork, IAaveConfiguration} from "../../helpers/types";
import { strategyUSDC, strategyWBTC, strategyWETH } from "./reservesConfigs";
import { CommonsConfig } from "../aave/commons";
// ----------------
// POOL--SPECIFIC PARAMS
// ----------------

export const ParallelMarket: IAaveConfiguration = {
  ...CommonsConfig,
  ProviderId: 30,
  WrappedNativeTokenSymbol: "WETH",
  MarketId: "Parallel Aave Market",
  ATokenNamePrefix: "Parallel",
  StableDebtTokenNamePrefix: "Parallel",
  VariableDebtTokenNamePrefix: "Parallel",
  OracleQuoteCurrency: "ETH",
  OracleQuoteUnit: "18",
  SymbolPrefix: "Parallel",
  ReservesConfig: {
    USDC: strategyUSDC,
    WBTC: strategyWBTC,
    WETH: strategyWETH,
  },
  ReserveAssets: {
    [eParallelNetwork.devL2]: {
      USDC: "0x5EC703Bfaada5EfFB0740d915e7C3348f4Ce558D",
      WBTC: "0x379F674fF9a97D6500E7f665a68Fa4961ec13575",
      WETH: "0x8fe830A831423EE60d2dF5D290899bafb5E00FDB",
    },
  },
  ChainlinkAggregator: {
    [eParallelNetwork.devL2]: {
      USDC: "0x7c9EA6CAF2C6EEEEA2707f140E2eEa69EBa4353D",
      WBTC: "0xd04f088E91FAf9358a53d84F27bfC8F6CF8F9bE2",
      WETH: "0x0000000000000000000000000000000000000000",
    },
  },
};

export default ParallelMarket;
