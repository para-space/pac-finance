import { parseEther } from "ethers/lib/utils";
import { makeSuite, TestEnv } from "./utils/make-suite";
import {
  advanceTimeAndBlock,
  evmRevert,
  evmSnapshot,
  MAX_UINT_AMOUNT,
} from "../helpers";
import { ethers } from "hardhat";
const { expect } = require("chai");
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

makeSuite("Yield Distribute Test", (testEnv: TestEnv) => {
  let snapId: string;
  before(async () => {
    const {
      weth,
      poolWrapper,
      deployer,
      aWETH,
      users: [user1, user2],
      wethYieldDistribute,
    } = testEnv;

    await weth.connect(user1.signer).deposit({ value: parseEther("1") });
    await weth
      .connect(user1.signer)
      .approve(poolWrapper.address, MAX_UINT_AMOUNT);

    await weth.connect(user2.signer).deposit({ value: parseEther("1") });
    await weth
      .connect(user2.signer)
      .approve(poolWrapper.address, MAX_UINT_AMOUNT);

    await weth.connect(deployer.signer).deposit({ value: parseEther("100") });
    await weth
      .connect(deployer.signer)
      .approve(wethYieldDistribute.address, MAX_UINT_AMOUNT);

    await aWETH
      .connect(user1.signer)
      .approve(poolWrapper.address, MAX_UINT_AMOUNT);
  });

  beforeEach(async () => {
    snapId = await evmSnapshot();
  });
  afterEach(async () => {
    await evmRevert(snapId);
  });

  it("test yield distribution", async () => {
    const {
      weth,
      poolWrapper,
      deployer,
      aWETH,
      users: [user1, user2],
      wethYieldDistribute,
    } = testEnv;

    //data check before start
    expect(await wethYieldDistribute.currentRound()).to.be.eq("1");
    expect(await wethYieldDistribute.currentRoundTotalPoint()).to.be.eq("0");

    await poolWrapper
      .connect(user1.signer)
      .supplyERC20(weth.address, parseEther("1"), user1.address);

    //advance block and settle round 1
    await advanceTimeAndBlock(1000);
    await wethYieldDistribute
      .connect(deployer.signer)
      .distributeYield(parseEther("1"));

    //check data for round 1
    expect(await wethYieldDistribute.currentRound()).to.be.eq("2");
    expect(
      await wethYieldDistribute.getUserRoundPoint(user1.address, 1)
    ).to.be.closeTo(parseEther("1000"), parseEther("10"));
    expect(
      await wethYieldDistribute.getPendingYield(user1.address)
    ).to.be.closeTo(parseEther("1"), parseEther("0.001"));

    //advance block and settle round 2
    await advanceTimeAndBlock(1000);
    await wethYieldDistribute
      .connect(deployer.signer)
      .distributeYield(parseEther("1"));

    //check data for round 2
    expect(await wethYieldDistribute.currentRound()).to.be.eq("3");
    expect(
      await wethYieldDistribute.getUserRoundPoint(user1.address, 1)
    ).to.be.closeTo(parseEther("1000"), parseEther("10"));
    expect(
      await wethYieldDistribute.getUserRoundPoint(user1.address, 2)
    ).to.be.closeTo(parseEther("1000"), parseEther("10"));
    expect(
      await wethYieldDistribute.getPendingYield(user1.address)
    ).to.be.closeTo(parseEther("2"), parseEther("0.001"));

    await poolWrapper
      .connect(user2.signer)
      .supplyERC20(weth.address, parseEther("1"), user2.address);

    //advance block and settle round 3
    await advanceTimeAndBlock(1000);
    await wethYieldDistribute
      .connect(deployer.signer)
      .distributeYield(parseEther("1"));

    //check data for round 3
    expect(await wethYieldDistribute.currentRound()).to.be.eq("4");
    expect(
      await wethYieldDistribute.getUserRoundPoint(user1.address, 1)
    ).to.be.closeTo(parseEther("1000"), parseEther("10"));
    expect(
      await wethYieldDistribute.getUserRoundPoint(user1.address, 2)
    ).to.be.closeTo(parseEther("1000"), parseEther("10"));
    expect(
      await wethYieldDistribute.getUserRoundPoint(user1.address, 3)
    ).to.be.closeTo(parseEther("1000"), parseEther("10"));
    expect(
      await wethYieldDistribute.getPendingYield(user1.address)
    ).to.be.closeTo(parseEther("2.5"), parseEther("0.001"));
    expect(
      await wethYieldDistribute.getUserRoundPoint(user2.address, 3)
    ).to.be.closeTo(parseEther("1000"), parseEther("10"));
    expect(
      await wethYieldDistribute.getPendingYield(user2.address)
    ).to.be.closeTo(parseEther("0.5"), parseEther("0.001"));

    //advance block and check
    await advanceTimeAndBlock(1000);
    expect(
      await wethYieldDistribute.getUserRoundPoint(user1.address, 4)
    ).to.be.eq("0");

    //user1 claim
    await wethYieldDistribute.connect(user1.signer).claimYield();
    expect(await weth.balanceOf(user1.address)).to.be.closeTo(
      parseEther("2.5"),
      parseEther("0.001")
    );

    //settle round 4
    await wethYieldDistribute
      .connect(deployer.signer)
      .distributeYield(parseEther("1"));
    expect(
      await wethYieldDistribute.getPendingYield(user1.address)
    ).to.be.closeTo(parseEther("0.5"), parseEther("0.001"));
    expect(
      await wethYieldDistribute.getPendingYield(user2.address)
    ).to.be.closeTo(parseEther("1"), parseEther("0.001"));

    await wethYieldDistribute.connect(user1.signer).claimYield();
    expect(await weth.balanceOf(user1.address)).to.be.closeTo(
      parseEther("3"),
      parseEther("0.001")
    );
    await wethYieldDistribute.connect(user2.signer).claimYield();
    expect(await weth.balanceOf(user2.address)).to.be.closeTo(
      parseEther("1"),
      parseEther("0.001")
    );

    expect(await weth.balanceOf(wethYieldDistribute.address)).to.be.closeTo(
      parseEther("0"),
      parseEther("0.001")
    );

    await aWETH.connect(user2.signer).transfer(user1.address, parseEther("1"));
    //advance block and settle round 5
    await advanceTimeAndBlock(1000);
    await wethYieldDistribute
      .connect(deployer.signer)
      .distributeYield(parseEther("1"));

    //check data for round 5
    expect(
      await wethYieldDistribute.getPendingYield(user1.address)
    ).to.be.closeTo(parseEther("1"), parseEther("0.01"));
    expect(
      await wethYieldDistribute.getPendingYield(user2.address)
    ).to.be.closeTo(parseEther("0"), parseEther("0.01"));

    await poolWrapper
      .connect(user1.signer)
      .withdrawERC20(weth.address, parseEther("1"), user2.address);
    await poolWrapper
      .connect(user2.signer)
      .supplyERC20(weth.address, parseEther("1"), user2.address);

    //advance block and settle round 6
    await advanceTimeAndBlock(1000);
    await wethYieldDistribute
      .connect(deployer.signer)
      .distributeYield(parseEther("1"));

    //check data for round 6
    expect(
      await wethYieldDistribute.getPendingYield(user1.address)
    ).to.be.closeTo(parseEther("1.5"), parseEther("0.01"));
    expect(
      await wethYieldDistribute.getPendingYield(user2.address)
    ).to.be.closeTo(parseEther("0.5"), parseEther("0.01"));
  });

  it("test rescue token", async () => {
    const { weth, deployer, wethYieldDistribute } = testEnv;

    await weth
      .connect(deployer.signer)
      .transfer(wethYieldDistribute.address, parseEther("1"));

    await wethYieldDistribute
      .connect(deployer.signer)
      .rescueToken(weth.address, deployer.address, parseEther("1"));
  });

  it("revert test", async () => {
    const { weth, deployer, wethYieldDistribute, users } = testEnv;

    await expect(
      wethYieldDistribute
        .connect(users[1].signer)
        .rescueToken(weth.address, deployer.address, parseEther("5"))
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(
      wethYieldDistribute
        .connect(users[1].signer)
        .distributeYield(parseEther("1"))
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
