import {
  eBlastNetwork, eMantaNetwork,
  IAaveConfiguration,
} from "../../helpers/types";
import {
  strategyUSDB,
  strategyWETH,
} from "./reservesConfigs";
import { CommonsConfig } from "../aave/commons";
// ----------------
// POOL--SPECIFIC PARAMS
// ----------------

export const BlastMarket: IAaveConfiguration = {
  ...CommonsConfig,
  ProviderId: 30,
  WrappedNativeTokenSymbol: "WETH",
  MarketId: "BLAST Aave Market",
  ATokenNamePrefix: "Parallel",
  StableDebtTokenNamePrefix: "Parallel",
  VariableDebtTokenNamePrefix: "Parallel",
  OracleQuoteCurrency: "ETH",
  OracleQuoteUnit: "8",
  SymbolPrefix: " ",
  ReservesConfig: {
    WETH: strategyWETH,
    USDB: strategyUSDB,
  },
  ReserveAssets: {
    [eBlastNetwork.main]: {
      WETH: "0x4200000000000000000000000000000000000023",
      USDB: "0x4200000000000000000000000000000000000022",
    },
    [eBlastNetwork.testnet]: {
      WETH: "0x4200000000000000000000000000000000000023",
      USDB: "0x4200000000000000000000000000000000000022",
    },
  },
  ChainlinkAggregator: {
    [eBlastNetwork.testnet]: {
      WETH: "0x73104Ac1Fb5A46E2b57a68c0a4d88ae130Da7e19",
      USDB: "0x03419fa2f2307FBD999320CA519c6A7b3049c7f6",
    },
  },
};

export default BlastMarket;
