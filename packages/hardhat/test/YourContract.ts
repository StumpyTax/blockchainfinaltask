import { expect } from "chai";
import { ethers } from "hardhat";

describe("YourContract", function () {
  // We define a fixture to reuse the same setup in every test.

  describe("Deployment", function () {
    it("Should be right owner", async function () {
      const yourContract = await ethers.deployContract("YourContract");
      expect(await yourContract.owner()).to.equal("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    });
  });

  describe("Operation approved", function () {
    it("Should transfer tokens between accounts", async function () {
      const yourContract = await ethers.deployContract("YourContract");
      expect(await yourContract.getBalance()).to.equal("100000000000000000000000000000000000");

      let id = await yourContract.transfer("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "1", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
      await yourContract.approve(id.value);
      expect(await yourContract.getBalance()).to.equal("99999999999999999999999999999999999")
    });
  });

  describe("Operatoin canceled", function () {
    it("Tokens shouldn't transfer  between accounts", async function () {
      const yourContract = await ethers.deployContract("YourContract");
      expect(await yourContract.getBalance()).to.equal("100000000000000000000000000000000000");

      let id = await yourContract.transfer("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "1", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
      await yourContract.cancel(id.value);
      expect(await yourContract.getBalance()).to.equal("100000000000000000000000000000000000")
    });
  });

});

