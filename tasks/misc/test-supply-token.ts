import { task } from "hardhat/config";
import {
  getAaveOracle,
  getFaucet,
  getMintableERC20,
  getPool,
  getPoolAddressesProvider, getPoolConfiguratorProxy,
  getUiPoolDataProvider,
} from "../../helpers";
import { parseEther } from "ethers/lib/utils";

task(`test-supply-token`, `Test supply token`).setAction(async (_, hre) => {
  const usdm = "0xC84C18773439cff10DC4A100D46E482A5a02aeFF";
  const stone = "0x3357Ec831c77B31952E1318931CE44101fc0774a";
  //const weth = "0x73104Ac1Fb5A46E2b57a68c0a4d88ae130Da7e19";

  const { deployer, poolAdmin } = await hre.getNamedAccounts();
  const testSigner = await hre.ethers.getSigner(deployer);
  const poolAdminSinger = await hre.ethers.getSigner(poolAdmin);

  // const faucet = await getFaucet();
  // await faucet.connect(testSigner).setPermissioned(false);

  const poolConfigure = await getPoolConfiguratorProxy();
  await poolConfigure.connect(testSigner).setReserveBorrowing("0xB184CD1293468B3316f1fC23b54FFb12730ab1d4", true);

  const poolProxy = await getPool();
  const dataProvider = await getUiPoolDataProvider();
  const addressProvider = await getPoolAddressesProvider();
  const reserveData = await dataProvider.getReservesData(
    addressProvider.address
  );
  console.log("reserveData:", JSON.stringify(reserveData));



/*
  const amount = parseEther("100");
  await faucet.connect(testSigner).mint(usdm, deployer, amount);
  await faucet.connect(testSigner).mint(stone, deployer, amount);
  const testUSDC = await getMintableERC20(usdm);
  const testWBTC = await getMintableERC20(stone);

  console.log("----------0");

  await testUSDC.connect(testSigner).approve(poolProxy.address, amount);
  await testWBTC.connect(testSigner).approve(poolProxy.address, amount);

  console.log("----------1");
  await poolProxy.connect(testSigner).supply(usdm, amount, deployer, 0);
  console.log("----------2");
  await poolProxy.connect(testSigner).supply(stone, amount, deployer, 0);
  console.log("----------3");

  const addressProvider = await getPoolAddressesProvider();
  // const dataProvider = await getUiPoolDataProvider(
  //   "0x4077463997B53f22fc10d26d8654437C4E15a5F5"
  // );

  const userData = await dataProvider.getUserReservesData(
    addressProvider.address,
    deployer
  );
  console.log("userData:", JSON.stringify(userData));

  const oracle = await getAaveOracle();
  const usdmPrice = await oracle.getAssetPrice(usdm);
  const stonePrice = await oracle.getAssetPrice(stone);
  console.log("usdmPrice:", usdmPrice.toString());
  console.log("stonePrice:", stonePrice.toString());

  const accData = await poolProxy.getUserAccountData(deployer);
  console.log("accData:", JSON.stringify(accData));

  await poolProxy.connect(testSigner).borrow(usdm, 5, 2, 0, deployer);*/
});
