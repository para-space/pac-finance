import { parseEther } from "ethers/lib/utils";
import { makeSuite, TestEnv } from "./utils/make-suite";
import { evmRevert, evmSnapshot, MAX_UINT_AMOUNT } from "../helpers";
import { ethers } from "hardhat";

const { expect } = require("chai");

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

makeSuite("Leverage Deposit Test", (testEnv: TestEnv) => {
  let snapId: string;
  before(async () => {
    const { weth, deployer, wrappedTokenGateway } = testEnv;

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

  it("test weth deposit", async () => {
    const { weth, leverageDepositor, deployer, aWETH, debtWETH, poolAdmin } =
      testEnv;

    await weth.connect(deployer.signer).deposit({ value: parseEther("10") });

    expect(await weth.balanceOf(deployer.address)).eq(parseEther("10"));

    await weth
      .connect(deployer.signer)
      .approve(leverageDepositor.address, MAX_UINT_AMOUNT);

    await debtWETH
      .connect(deployer.signer)
      .approveDelegation(leverageDepositor.address, MAX_UINT_AMOUNT);

    await leverageDepositor
      .connect(deployer.signer)
      .leverageDeposit(weth.address, parseEther("10"), parseEther("5"));

    expect(await aWETH.balanceOf(deployer.address)).to.be.closeTo(
      parseEther("25"),
      parseEther("0.1")
    );
    expect(await debtWETH.balanceOf(deployer.address)).to.be.closeTo(
      parseEther("5"),
      parseEther("0.01")
    );
  });

  it("test eth deposit", async () => {
    const { leverageDepositor, deployer, aWETH, debtWETH } = testEnv;

    await debtWETH
      .connect(deployer.signer)
      .approveDelegation(leverageDepositor.address, MAX_UINT_AMOUNT);

    await leverageDepositor
      .connect(deployer.signer)
      .leverageDeposit(ZERO_ADDRESS, parseEther("10"), parseEther("5"), {
        value: parseEther("10"),
      });

    expect(await aWETH.balanceOf(deployer.address)).to.be.closeTo(
      parseEther("25"),
      parseEther("0.1")
    );
    expect(await debtWETH.balanceOf(deployer.address)).to.be.closeTo(
      parseEther("5"),
      parseEther("0.01")
    );
  });

  it("test rescue erc20", async () => {
    const { weth, leverageDepositor, deployer } = testEnv;

    await weth.connect(deployer.signer).deposit({ value: parseEther("10") });

    expect(await weth.balanceOf(deployer.address)).eq(parseEther("10"));

    await weth
      .connect(deployer.signer)
      .transfer(leverageDepositor.address, parseEther("10"));

    await leverageDepositor
      .connect(deployer.signer)
      .rescueERC20(weth.address, deployer.address, parseEther("10"));

    expect(await weth.balanceOf(deployer.address)).eq(parseEther("10"));
  });

  it("revert test", async () => {
    const { weth, leverageDepositor, deployer, users } = testEnv;

    await expect(
      leverageDepositor
        .connect(deployer.signer)
        .leverageDeposit(weth.address, parseEther("10"), "0")
    ).to.be.revertedWithCustomError(leverageDepositor, "ZeroAmount");

    await expect(
      leverageDepositor
        .connect(deployer.signer)
        .leverageDeposit(weth.address, parseEther("10"), parseEther("5"), {
          value: parseEther("10"),
        })
    ).to.be.revertedWithCustomError(leverageDepositor, "InvalidMsgValue");

    await expect(
      leverageDepositor
        .connect(deployer.signer)
        .leverageDeposit(ZERO_ADDRESS, parseEther("10"), parseEther("5"))
    ).to.be.revertedWithCustomError(leverageDepositor, "InvalidMsgValue");

    await expect(
      leverageDepositor
        .connect(deployer.signer)
        .executeOperation(
          ZERO_ADDRESS,
          parseEther("10"),
          parseEther("5"),
          leverageDepositor.address,
          ethers.utils.defaultAbiCoder.encode(
            ["address", "uint256", "uint256"],
            [deployer.address, 0, parseEther("10")]
          )
        )
    ).to.be.revertedWithCustomError(leverageDepositor, "InvalidFlashLoan");

    await expect(
      leverageDepositor
        .connect(users[1].signer)
        .rescueERC20(weth.address, deployer.address, parseEther("5"))
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(
      deployer.signer.sendTransaction({
        to: leverageDepositor.address,
        value: parseEther("5"),
      })
    ).to.be.revertedWithCustomError(leverageDepositor, "ReceiveNotAllowed");
  });
});
