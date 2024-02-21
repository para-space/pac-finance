import { task } from "hardhat/config";

task("verify-contract", "verify contract")
  .addParam("contractKey", "The Id of the contract to verify")
  .setAction(async ({ contractKey }, hre) => {
    const allDeployments = await hre.deployments.all();
    try {
      await hre.run("verify:verify", {
        address: allDeployments[contractKey].address,
        constructorArguments: allDeployments[contractKey].args,
      });
    } catch (error) {
      console.log("Error during verification", error);
    }
  });
