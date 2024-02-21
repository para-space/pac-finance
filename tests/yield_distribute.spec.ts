import { parseEther } from "ethers/lib/utils";
import { makeSuite, TestEnv } from "./utils/make-suite";
import { evmRevert, evmSnapshot, MAX_UINT_AMOUNT } from "../helpers";
import { ethers } from "hardhat";
const { expect } = require("chai");
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

makeSuite("Pac Pool Wrapper Test", (testEnv: TestEnv) => {
  let snapId: string;
  before(async () => {
    const { weth, deployer, wrappedTokenGateway, aWETH } = testEnv;

    await wrappedTokenGateway
      .connect(deployer.signer)
      .depositETH(weth.address, deployer.address, 0, {
        value: parseEther("10"),
      });
  });

  beforeEach(async () => {
    snapId = await evmSnapshot();
  });
  afterEach(async () => {
    await evmRevert(snapId);
  });

  it("test erc20 operation", async () => {
    const { weth, poolWrapper, deployer, aWETH, debtWETH } = testEnv;

    await weth.connect(deployer.signer).deposit({ value: parseEther("10") });

    await weth
      .connect(deployer.signer)
      .approve(poolWrapper.address, MAX_UINT_AMOUNT);

    await debtWETH
      .connect(deployer.signer)
      .approveDelegation(poolWrapper.address, MAX_UINT_AMOUNT);

    await poolWrapper
      .connect(deployer.signer)
      .supplyERC20(weth.address, parseEther("10"), deployer.address);

    expect(await aWETH.balanceOf(deployer.address)).to.be.closeTo(
      parseEther("20"),
      parseEther("0.1")
    );
    expect(await debtWETH.balanceOf(deployer.address)).to.be.closeTo(
      parseEther("0"),
      parseEther("0.01")
    );

    await aWETH
      .connect(deployer.signer)
      .approve(poolWrapper.address, MAX_UINT_AMOUNT);
    await poolWrapper
      .connect(deployer.signer)
      .withdrawERC20(weth.address, parseEther("10"), deployer.address);

    expect(await weth.balanceOf(deployer.address)).closeTo(
      parseEther("10"),
      parseEther("0.1")
    );

    await poolWrapper
      .connect(deployer.signer)
      .borrowERC20(weth.address, parseEther("5"), 2);

    expect(await debtWETH.balanceOf(deployer.address)).to.be.closeTo(
      parseEther("5"),
      parseEther("0.01")
    );
    expect(await weth.balanceOf(deployer.address)).closeTo(
      parseEther("15"),
      parseEther("0.1")
    );

    await poolWrapper
      .connect(deployer.signer)
      .repayERC20(weth.address, parseEther("10"), 2, deployer.address);

    expect(await debtWETH.balanceOf(deployer.address)).to.be.closeTo(
      parseEther("0"),
      parseEther("0.01")
    );
    expect(await weth.balanceOf(deployer.address)).closeTo(
      parseEther("10"),
      parseEther("0.1")
    );
  });

  it("revert test", async () => {
    const { weth, poolWrapper, deployer, users } = testEnv;

    await expect(
      poolWrapper
        .connect(deployer.signer)
        .leverageDeposit(weth.address, parseEther("10"), "0")
    ).to.be.revertedWithCustomError(poolWrapper, "ZeroAmount");

    await expect(
      poolWrapper
        .connect(deployer.signer)
        .leverageDeposit(weth.address, parseEther("10"), parseEther("5"), {
          value: parseEther("10"),
        })
    ).to.be.revertedWithCustomError(poolWrapper, "InvalidMsgValue");

    await expect(
      poolWrapper
        .connect(deployer.signer)
        .leverageDeposit(ZERO_ADDRESS, parseEther("10"), parseEther("5"))
    ).to.be.revertedWithCustomError(poolWrapper, "InvalidMsgValue");

    await expect(
      poolWrapper
        .connect(deployer.signer)
        .executeOperation(
          ZERO_ADDRESS,
          parseEther("10"),
          parseEther("5"),
          poolWrapper.address,
          ethers.utils.defaultAbiCoder.encode(
            ["address", "uint256", "uint256"],
            [deployer.address, 0, parseEther("10")]
          )
        )
    ).to.be.revertedWithCustomError(poolWrapper, "InvalidFlashLoan");

    await expect(
      poolWrapper
        .connect(users[1].signer)
        .rescueERC20(weth.address, deployer.address, parseEther("5"))
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(
      poolWrapper.connect(users[1].signer).setGasRefund(weth.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(
      deployer.signer.sendTransaction({
        to: poolWrapper.address,
        value: parseEther("5"),
      })
    ).to.be.revertedWithCustomError(poolWrapper, "ReceiveNotAllowed");
  });
});
