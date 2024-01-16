import {
  eFantomNetwork,
  eMantaNetwork,
  IAaveConfiguration,
} from "../../helpers/types";
import {
  strategySTONE,
  strategyTIA,
  strategyUSDC,
  strategyWETH,
  strategyWSTETH,
  strategyWUSDM,
} from "./reservesConfigs";
import { CommonsConfig } from "../aave/commons";
// ----------------
// POOL--SPECIFIC PARAMS
// ----------------

export const MantaMarket: IAaveConfiguration = {
  ...CommonsConfig,
  ProviderId: 30,
  WrappedNativeTokenSymbol: "WETH",
  MarketId: "MANTA Aave Market",
  ATokenNamePrefix: "Parallel",
  StableDebtTokenNamePrefix: "Parallel",
  VariableDebtTokenNamePrefix: "Parallel",
  OracleQuoteCurrency: "ETH",
  OracleQuoteUnit: "18",
  SymbolPrefix: " ",
  ReservesConfig: {
    WUSDM: strategyWUSDM,
    STONE: strategySTONE,
    WETH: strategyWETH,
    USDC: strategyUSDC,
    TIA: strategyTIA,
    WSTETH: strategyWSTETH,
  },
  ReserveAssets: {
    [eMantaNetwork.main]: {
      WUSDM: "0xbdAd407F77f44F7Da6684B416b1951ECa461FB07",
      STONE: "0xec901da9c68e90798bbbb74c11406a32a70652c3",
      WETH: "0x0Dc808adcE2099A9F62AA87D9670745AbA741746",
      USDC: "0xb73603c5d87fa094b7314c74ace2e64d165016fb",
      TIA: "0x6fae4d9935e2fcb11fc79a64e917fb2bf14dafaa",
      WSTETH: "0x2fe3ad97a60eb7c79a976fc18bb5ffd07dd94ba5",
    },
  },
  ChainlinkAggregator: {
    [eMantaNetwork.main]: {
      WUSDM: "0x75B3B424fb782dA0e8DCf9E30396001E60e4Cc3B",
      STONE: "0x14CdFdBAc7038196F26fea1c9384ce92363F31CE",
      WETH: "0x14CdFdBAc7038196F26fea1c9384ce92363F31CE",
      USDC: "0x75B3B424fb782dA0e8DCf9E30396001E60e4Cc3B",
      TIA: "0x5e10AE8fF2cB3dBc0492621f2f7f1cCca4be437D",
      WSTETH: "0xd525CE0c2e1925a2FC2a362af0d0aAF1BE5Fb7Dd",
    },
  },
};

export default MantaMarket;
