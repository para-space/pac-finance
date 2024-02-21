import { parseEther } from "ethers/lib/utils";
import { makeSuite, TestEnv } from "./utils/make-suite";
import { evmRevert, evmSnapshot, MAX_UINT_AMOUNT } from "../helpers";
const { expect } = require("chai");
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

makeSuite("Gas Refund With Pool Wrapper Test", (testEnv: TestEnv) => {
  let snapId: string;

  beforeEach(async () => {
    snapId = await evmSnapshot();
  });
  afterEach(async () => {
    await evmRevert(snapId);
  });

  it("test gas refund", async () => {
    const { weth, poolWrapper, deployer, aWETH, debtWETH, gasRefund } = testEnv;

    await weth.connect(deployer.signer).deposit({ value: parseEther("20") });

    await weth
      .connect(deployer.signer)
      .approve(poolWrapper.address, MAX_UINT_AMOUNT);

    await debtWETH
      .connect(deployer.signer)
      .approveDelegation(poolWrapper.address, MAX_UINT_AMOUNT);

    expect(await gasRefund.gasBalance(deployer.address)).eq("0");

    await poolWrapper
      .connect(deployer.signer)
      .supplyERC20(weth.address, parseEther("20"), deployer.address);

    const balanceAfterSupply = await gasRefund.gasBalance(deployer.address);
    expect(balanceAfterSupply).gt("0");

    await aWETH
      .connect(deployer.signer)
      .approve(poolWrapper.address, MAX_UINT_AMOUNT);
    await poolWrapper
      .connect(deployer.signer)
      .withdrawERC20(weth.address, parseEther("10"), deployer.address);
    const balanceAfterWithdraw = await gasRefund.gasBalance(deployer.address);
    expect(balanceAfterWithdraw).gt(balanceAfterSupply);

    await poolWrapper
      .connect(deployer.signer)
      .borrowERC20(weth.address, parseEther("5"), 2);
    const balanceAfterBorrow = await gasRefund.gasBalance(deployer.address);
    expect(balanceAfterBorrow).gt(balanceAfterWithdraw);

    await poolWrapper
      .connect(deployer.signer)
      .repayERC20(weth.address, parseEther("10"), 2, deployer.address);
    const balanceAfterRepay = await gasRefund.gasBalance(deployer.address);
    expect(balanceAfterRepay).gt(balanceAfterBorrow);

    await deployer.signer.sendTransaction({
      to: gasRefund.address,
      value: parseEther("1"),
    });

    await gasRefund.connect(deployer.signer).claimGas();
    const balance = await deployer.signer.provider!.getBalance(
      gasRefund.address
    );
    expect(balanceAfterRepay).eq(parseEther("1").sub(balance));

    const finalBalance = await gasRefund.gasBalance(deployer.address);
    expect(finalBalance).eq("0");
  });

  it("revert test", async () => {
    const { deployer, users, gasRefund } = testEnv;

    await expect(
      gasRefund
        .connect(deployer.signer)
        .addGasRefund(deployer.address, parseEther("10"), 1)
    ).to.be.revertedWith("only pool wrapper");

    await expect(
      gasRefund.connect(users[1].signer).setRefundRatio(1, 100)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
