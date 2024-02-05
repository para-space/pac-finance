import { task } from "hardhat/config";
import {
  ACL_MANAGER_ID,
  ACLManager,
  getAaveOracle,
  getFaucet,
  getMintableERC20,
  getMockAggregator,
  getPool,
  getPoolAddressesProvider,
  getPoolConfiguratorProxy,
  getUiPoolDataProvider,
  getWrappedTokenGateway,
  MockAggregator__factory,
  POOL_ADDRESSES_PROVIDER_ID,
  PoolAddressesProvider,
  RESERVES_SETUP_HELPER_ID,
  waitForTx,
} from "../../helpers";
import { parseEther } from "ethers/lib/utils";

task(`test-supply-token`, `Test supply token`).setAction(async (_, hre) => {
  //const weth = "0x73104Ac1Fb5A46E2b57a68c0a4d88ae130Da7e19";

  const { deployer, poolAdmin } = await hre.getNamedAccounts();
  const testSigner = await hre.ethers.getSigner(deployer);
  const poolAdminSinger = await hre.ethers.getSigner(poolAdmin);

  // const faucet = await getFaucet();
  // await faucet.connect(testSigner).setPermissioned(false);

  // const ethGateWay = await getWrappedTokenGateway();
  // await ethGateWay.connect(testSigner).depositETH(deployer, deployer, 0, {
  //   value: parseEther("0.01"),
  // });

  const poolProxy = await getPool();

  // const dataProvider = await getUiPoolDataProvider();
  // const addressProvider = await getPoolAddressesProvider();
  // const reserveData = await dataProvider.getReservesData(
  //   addressProvider.address
  // );
  // console.log("reserveData:", JSON.stringify(reserveData));

  // const oracle = await getAaveOracle();
  // const addressProvider = await getPoolAddressesProvider();
  // const oldOracle = await addressProvider.getPriceOracle();
  // console.log("oldOracle :", oldOracle);
  // console.log("new:", oracle.address);
  // await addressProvider.setPriceOracle(oracle.address);
  // return;

  // const accData = await poolProxy.getUserAccountData(deployer);
  // console.log("accData:", JSON.stringify(accData));
  // const addressProvider = await getPoolAddressesProvider();
  // const uiProvider = await getUiPoolDataProvider();
  // const result = await uiProvider.getReservesData(addressProvider.address);
  // console.log("uiProvider:", uiProvider.address);
  // console.log(JSON.stringify(result));

  //
  // const old = await addressProvider.getPriceOracle();
  // console.log("old:", old);
  // console.log("new:", oracle.address);
  // await addressProvider.setPriceOracle(oracle.address);
  // return;

  //const oracle = await getAaveOracle();
  // const WUSDM = "0xbdAd407F77f44F7Da6684B416b1951ECa461FB07";
  // const STONE = "0xec901da9c68e90798bbbb74c11406a32a70652c3";
  // const WETH = "0x0Dc808adcE2099A9F62AA87D9670745AbA741746";
  // const USDC = "0xb73603c5d87fa094b7314c74ace2e64d165016fb";
  // const TIA = "0x6fae4d9935e2fcb11fc79a64e917fb2bf14dafaa";
  // const WSTETH = "0x2fe3ad97a60eb7c79a976fc18bb5ffd07dd94ba5";
  // const MANTA = "0x95CeF13441Be50d20cA4558CC0a27B601aC544E5";

  // await oracle.setAssetSources(
  //   [WUSDM, STONE, WETH, USDC, TIA, WSTETH],
  //   [
  //     "0x3CcC1944021754Cd31Fa2428F690c1fbfBfd62f4",
  //     "0x05F626b991a3045e5272eEcd8ACa32c762542FcF",
  //     "0x447eBcEa8371bf82269E6734fb71EA026D21A40E",
  //     "0x0CeaCc7fD1177E0d21212C4b7E28BBbF10172192",
  //     "0xF059C4F20b7c8F9136Da6e1302ccc880B633c9FA",
  //     "0x1aF46B75E11c5Fde96c6d4fB01a564B0FE95C029",
  //   ]
  // );
  // const WUSDMsource = await oracle.getSourceOfAsset(WUSDM);
  // console.log("WUSDMsource:", WUSDMsource);
  // const STONEsource = await oracle.getSourceOfAsset(STONE);
  // console.log("STONEsource:", STONEsource);
  // const WETHsource = await oracle.getSourceOfAsset(WETH);
  // console.log("WETHsource:", WETHsource);
  // const USDCsource = await oracle.getSourceOfAsset(USDC);
  // console.log("USDCsource:", USDCsource);
  // const TIAsource = await oracle.getSourceOfAsset(TIA);
  // console.log("TIAsource:", TIAsource);
  // const WSTETHsource = await oracle.getSourceOfAsset(WSTETH);
  // console.log("WSTETHsource:", WSTETHsource);
  // const MANTAsource = await oracle.getSourceOfAsset(MANTA);
  // console.log("MANTAsource:", MANTAsource);

  // const agg = await getMockAggregator(
  //   "0x3CcC1944021754Cd31Fa2428F690c1fbfBfd62f4"
  // );
  // const testPrice = await agg.latestAnswer();
  // console.log("testPrice:", testPrice);

  // const STONEprice = await oracle.getAssetPrice(STONE);
  // const WETHMprice = await oracle.getAssetPrice(WETH);
  // const USDCMprice = await oracle.getAssetPrice(USDC);
  // const TIADMprice = await oracle.getAssetPrice(TIA);
  // const WSTETHprice = await oracle.getAssetPrice(WSTETH);
  //
  // const WUSDMprice = await oracle.getAssetPrice(WUSDM);
  // console.log("WUSDMprice:", WUSDMprice);
  // const STONEprice = await oracle.getAssetPrice(STONE);
  // console.log("STONEprice:", STONEprice);
  // const WETHMprice = await oracle.getAssetPrice(WETH);
  // console.log("WETHMprice:", WETHMprice);
  // const USDCMprice = await oracle.getAssetPrice(USDC);
  // console.log("USDCMprice:", USDCMprice);
  // const TIADMprice = await oracle.getAssetPrice(TIA);
  // console.log("TIADMprice:", TIADMprice);
  // const WSTETHprice = await oracle.getAssetPrice(WSTETH);
  // console.log("WSTETHprice:", WSTETHprice);
  // const MANTAprice = await oracle.getAssetPrice(MANTA);
  // console.log("MANTAprice:", MANTAprice);

  // const amount = "1000000000";
  // const wbtc = "0x9639bB155245515885Df41161824006c6454C6A9";
  // await faucet.connect(testSigner).mint(wbtc, deployer, amount);
  // const testWBTC = await getMintableERC20(wbtc);
  //
  // console.log("----------0");
  // await testWBTC.connect(testSigner).approve(poolProxy.address, amount);
  //
  // console.log("----------1");
  // await poolProxy.connect(testSigner).supply(wbtc, amount, deployer, 0);
  // console.log("----------2");
  //
  // const addressProvider = await getPoolAddressesProvider();
  // const dataProvider = await getUiPoolDataProvider();
  //
  // const userData = await dataProvider.getUserReservesData(
  //   addressProvider.address,
  //   deployer
  // );
  // console.log("userData:", JSON.stringify(userData));

  // const oracle = await getAaveOracle();
  // const usdmPrice = await oracle.getAssetPrice(usdm);
  // const stonePrice = await oracle.getAssetPrice(stone);
  // console.log("usdmPrice:", usdmPrice.toString());
  // console.log("stonePrice:", stonePrice.toString());

  const WETH = "0x4200000000000000000000000000000000000023";
  const USDB = "0x4200000000000000000000000000000000000022";
  const WBTC = "0x9639bB155245515885Df41161824006c6454C6A9";
  let assetData = await poolProxy.connect(poolAdminSinger).getReserveData(WETH);
  console.log("accData:", JSON.stringify(assetData));
  assetData = await poolProxy.connect(poolAdminSinger).getReserveData(USDB);
  console.log("accData:", JSON.stringify(assetData));
  assetData = await poolProxy.connect(poolAdminSinger).getReserveData(WBTC);
  console.log("accData:", JSON.stringify(assetData));
  const accData = await poolProxy
    .connect(poolAdminSinger)
    .getUserAccountData("0x62258b7c541313d490E941C4fc2D4B1056064F4D");
  console.log("accData:", JSON.stringify(accData));

  //await poolProxy.connect(testSigner).borrow(usdm, 5, 2, 0, deployer);*/
});
