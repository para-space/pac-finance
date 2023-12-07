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
  SymbolPrefix: "Eth", //这个是aToken symbol的prefix，需要再确认这个配置
  ReservesConfig: {
    USDC: strategyUSDC,
    WBTC: strategyWBTC,
    WETH: strategyWETH,
  },
  ReserveAssets: {
    [eParallelNetwork.devL3]: {
      USDC: "0x03419fa2f2307FBD999320CA519c6A7b3049c7f6",
      WBTC: "0xf79EacE85f637421487e0F19e7D948a3F6B1B5C7",
      WETH: "0x73104Ac1Fb5A46E2b57a68c0a4d88ae130Da7e19",
    },
  },
  ChainlinkAggregator: {
    [eParallelNetwork.devL3]: {
      USDC: "0xF88189593343b5BeA7b07B8f3b7089083575a3A9",
      WBTC: "0xcAba99E0E74121D2aE647D23C296CB2884Ea009D",
      WETH: "0x82b0E695a30D94F4CF1eCEa63B2EDbD38Df5328C",
    },
  },
};

export default ParallelMarket;
