import { task } from "hardhat/config";
import {
  getMintableERC20,
  getPool,
} from "../../helpers";

task(`test-supply-token`, `Test supply token`).setAction(async (_, hre) => {
  const usdc = "0x03419fa2f2307FBD999320CA519c6A7b3049c7f6";
  const wbtc = "0xf79EacE85f637421487e0F19e7D948a3F6B1B5C7";
  //const weth = "0x73104Ac1Fb5A46E2b57a68c0a4d88ae130Da7e19";

  const { deployer, poolAdmin } = await hre.getNamedAccounts();
  const testSigner = await hre.ethers.getSigner(deployer);
  const poolAdminSinger = await hre.ethers.getSigner(poolAdmin);

  const poolProxy = await getPool();
  const testUSDC = await getMintableERC20(usdc);
  await testUSDC.connect(testSigner)["mint(address,uint256)"](deployer, 100);
  await testUSDC.connect(testSigner).approve(poolProxy.address, 100);
  const testWBTC = await getMintableERC20(wbtc);
  await testWBTC.connect(testSigner)["mint(address,uint256)"](deployer, 100);
  await testWBTC.connect(testSigner).approve(poolProxy.address, 100);

  await poolProxy.connect(testSigner).supply(usdc, 100, deployer, 0);
  await poolProxy.connect(testSigner).supply(wbtc, 100, poolAdmin, 0);

  await poolProxy.connect(poolAdminSinger).borrow(usdc, 5, 2, 0, poolAdmin);
});
