const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("EnergyTradingContract", function () {
  let contract, owner, buyer, seller, other;

  beforeEach(async function () {
    [owner, buyer, seller, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("EnergyTradingContract");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("sets correct token name and symbol", async function () {
      expect(await contract.name()).to.equal("EnergyToken");
      expect(await contract.symbol()).to.equal("ENERGY");
    });

    it("sets deployer as owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("starts in Normal circuit breaker state", async function () {
      const state = await contract.getContractState();
      expect(state.state).to.equal(0);
    });

    it("starts with zero supply", async function () {
      expect(await contract.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("mints tokens to caller", async function () {
      const amount = ethers.parseEther("100");
      await contract.connect(seller).mintEnergyTokens(amount);
      expect(await contract.balanceOf(seller.address)).to.equal(amount);
    });

    it("emits EnergyTokenMinted event", async function () {
      const amount = ethers.parseEther("100");
      await expect(contract.connect(seller).mintEnergyTokens(amount))
        .to.emit(contract, "EnergyTokenMinted")
        .withArgs(seller.address, amount, anyValue);
    });

    it("rejects minting 0 tokens", async function () {
      await expect(
        contract.connect(seller).mintEnergyTokens(0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("rejects minting over 1000 tokens", async function () {
      await expect(
        contract.connect(seller).mintEnergyTokens(ethers.parseEther("1001"))
      ).to.be.revertedWith("Minting amount too large");
    });

    it("emits AnomalyDetected for large minting (>500)", async function () {
      const amount = ethers.parseEther("501");
      await expect(contract.connect(seller).mintEnergyTokens(amount))
        .to.emit(contract, "AnomalyDetected")
        .withArgs("LargeMinting", seller.address, amount, anyValue);
    });

    it("does not emit anomaly for normal minting", async function () {
      await expect(
        contract.connect(seller).mintEnergyTokens(ethers.parseEther("100"))
      ).to.not.emit(contract, "AnomalyDetected");
    });
  });

  describe("Trading", function () {
    const tradeAmount = ethers.parseEther("10");
    const tradePrice = ethers.parseEther("0.5");
    const totalCost = (tradeAmount * tradePrice) / ethers.parseEther("1");

    beforeEach(async function () {
      await contract.connect(seller).mintEnergyTokens(ethers.parseEther("100"));
    });

    it("executes a valid trade", async function () {
      await contract.connect(buyer).tradeEnergy(
        seller.address, tradeAmount, tradePrice, { value: totalCost }
      );
      expect(await contract.balanceOf(buyer.address)).to.equal(tradeAmount);
      expect(await contract.balanceOf(seller.address)).to.equal(
        ethers.parseEther("90")
      );
    });

    it("transfers ETH to seller", async function () {
      await expect(
        contract.connect(buyer).tradeEnergy(
          seller.address, tradeAmount, tradePrice, { value: totalCost }
        )
      ).to.changeEtherBalance(seller, totalCost);
    });

    it("emits EnergyTradeExecuted event", async function () {
      await expect(
        contract.connect(buyer).tradeEnergy(
          seller.address, tradeAmount, tradePrice, { value: totalCost }
        )
      ).to.emit(contract, "EnergyTradeExecuted")
        .withArgs(buyer.address, seller.address, tradeAmount, tradePrice, anyValue);
    });

    it("rejects trade with incorrect payment", async function () {
      await expect(
        contract.connect(buyer).tradeEnergy(
          seller.address, tradeAmount, tradePrice, { value: 0 }
        )
      ).to.be.revertedWith("Incorrect payment amount");
    });

    it("rejects self-trade", async function () {
      await expect(
        contract.connect(seller).tradeEnergy(
          seller.address, tradeAmount, tradePrice, { value: totalCost }
        )
      ).to.be.revertedWith("Cannot trade with yourself");
    });

    it("rejects trade with zero address", async function () {
      await expect(
        contract.connect(buyer).tradeEnergy(
          ethers.ZeroAddress, tradeAmount, tradePrice, { value: totalCost }
        )
      ).to.be.revertedWith("Invalid seller address");
    });

    it("rejects trade when seller has insufficient balance", async function () {
      const bigAmount = ethers.parseEther("200");
      const cost = (bigAmount * tradePrice) / ethers.parseEther("1");
      await expect(
        contract.connect(buyer).tradeEnergy(
          seller.address, bigAmount, tradePrice, { value: cost }
        )
      ).to.be.revertedWith("Seller has insufficient balance");
    });

    it("rejects trade below minimum amount", async function () {
      const tiny = ethers.parseEther("0.5");
      const cost = (tiny * tradePrice) / ethers.parseEther("1");
      await expect(
        contract.connect(buyer).tradeEnergy(
          seller.address, tiny, tradePrice, { value: cost }
        )
      ).to.be.revertedWith("Trade amount too small");
    });

    it("rejects trade above maximum amount", async function () {
      await contract.connect(seller).mintEnergyTokens(ethers.parseEther("1000"));
      const big = ethers.parseEther("1001");
      const cost = (big * tradePrice) / ethers.parseEther("1");
      await expect(
        contract.connect(buyer).tradeEnergy(
          seller.address, big, tradePrice, { value: cost }
        )
      ).to.be.revertedWith("Trade amount too large");
    });

    it("enforces rate limit between trades", async function () {
      await contract.connect(buyer).tradeEnergy(
        seller.address, tradeAmount, tradePrice, { value: totalCost }
      );
      await expect(
        contract.connect(buyer).tradeEnergy(
          seller.address, tradeAmount, tradePrice, { value: totalCost }
        )
      ).to.be.revertedWith("Rate limit: 1 trade per minute");
    });

    it("allows trade after rate limit window", async function () {
      await contract.connect(buyer).tradeEnergy(
        seller.address, tradeAmount, tradePrice, { value: totalCost }
      );
      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine");
      await expect(
        contract.connect(buyer).tradeEnergy(
          seller.address, tradeAmount, tradePrice, { value: totalCost }
        )
      ).to.not.be.reverted;
    });

    it("tracks daily volume", async function () {
      await contract.connect(buyer).tradeEnergy(
        seller.address, tradeAmount, tradePrice, { value: totalCost }
      );
      const state = await contract.getContractState();
      expect(state.dailyVolume_).to.equal(tradeAmount);
    });

    it("emits anomaly for suspicious volume", async function () {
      const largeAmount = ethers.parseEther("501");
      await contract.connect(seller).mintEnergyTokens(ethers.parseEther("600"));
      const cost = (largeAmount * tradePrice) / ethers.parseEther("1");
      await expect(
        contract.connect(buyer).tradeEnergy(
          seller.address, largeAmount, tradePrice, { value: cost }
        )
      ).to.emit(contract, "AnomalyDetected")
        .withArgs("SuspiciousVolume", buyer.address, largeAmount, anyValue);
    });

    it("emits anomaly for unusual price", async function () {
      const highPrice = ethers.parseEther("3");
      const cost = (tradeAmount * highPrice) / ethers.parseEther("1");
      await expect(
        contract.connect(buyer).tradeEnergy(
          seller.address, tradeAmount, highPrice, { value: cost }
        )
      ).to.emit(contract, "AnomalyDetected")
        .withArgs("UnusualPrice", buyer.address, highPrice, anyValue);
    });
  });

  describe("Circuit Breaker", function () {
    it("allows owner to pause", async function () {
      await contract.triggerCircuitBreaker(1, "Security threat");
      const state = await contract.getContractState();
      expect(state.state).to.equal(1);
    });

    it("emits CircuitBreakerTriggered event", async function () {
      await expect(contract.triggerCircuitBreaker(1, "Test"))
        .to.emit(contract, "CircuitBreakerTriggered")
        .withArgs(1, "Test", anyValue);
    });

    it("blocks trading when paused", async function () {
      await contract.connect(seller).mintEnergyTokens(ethers.parseEther("100"));
      await contract.triggerCircuitBreaker(1, "Test");

      const amount = ethers.parseEther("10");
      const price = ethers.parseEther("0.5");
      const cost = (amount * price) / ethers.parseEther("1");
      await expect(
        contract.connect(buyer).tradeEnergy(
          seller.address, amount, price, { value: cost }
        )
      ).to.be.reverted;
    });

    it("blocks minting when paused", async function () {
      await contract.triggerCircuitBreaker(1, "Test");
      await expect(
        contract.connect(seller).mintEnergyTokens(ethers.parseEther("10"))
      ).to.be.reverted;
    });

    it("resumes trading after unpause", async function () {
      await contract.connect(seller).mintEnergyTokens(ethers.parseEther("100"));
      await contract.triggerCircuitBreaker(1, "Pause");
      await contract.triggerCircuitBreaker(0, "Resume");

      const amount = ethers.parseEther("10");
      const price = ethers.parseEther("0.5");
      const cost = (amount * price) / ethers.parseEther("1");
      await expect(
        contract.connect(buyer).tradeEnergy(
          seller.address, amount, price, { value: cost }
        )
      ).to.not.be.reverted;
    });

    it("blocks trading in emergency state", async function () {
      await contract.connect(seller).mintEnergyTokens(ethers.parseEther("100"));
      await contract.triggerCircuitBreaker(2, "Emergency");

      const amount = ethers.parseEther("10");
      const price = ethers.parseEther("0.5");
      const cost = (amount * price) / ethers.parseEther("1");
      await expect(
        contract.connect(buyer).tradeEnergy(
          seller.address, amount, price, { value: cost }
        )
      ).to.be.revertedWith("Contract is in emergency state");
    });

    it("rejects non-owner circuit breaker trigger", async function () {
      await expect(
        contract.connect(other).triggerCircuitBreaker(1, "Hack")
      ).to.be.reverted;
    });
  });

  describe("Admin Functions", function () {
    it("allows owner to update thresholds", async function () {
      const newVolume = ethers.parseEther("1000");
      await contract.updateThresholds(newVolume, 10);
      expect(await contract.suspiciousVolumeThreshold()).to.equal(newVolume);
      expect(await contract.rapidTradeThreshold()).to.equal(10);
    });

    it("allows owner to reset daily volume", async function () {
      await contract.connect(seller).mintEnergyTokens(ethers.parseEther("100"));
      const amount = ethers.parseEther("10");
      const price = ethers.parseEther("0.5");
      const cost = (amount * price) / ethers.parseEther("1");
      await contract.connect(buyer).tradeEnergy(
        seller.address, amount, price, { value: cost }
      );

      await contract.resetDailyVolume();
      const state = await contract.getContractState();
      expect(state.dailyVolume_).to.equal(0);
    });

    it("rejects non-owner threshold update", async function () {
      await expect(
        contract.connect(other).updateThresholds(100, 10)
      ).to.be.reverted;
    });
  });

  describe("User Stats", function () {
    it("returns correct user stats after trade", async function () {
      await contract.connect(seller).mintEnergyTokens(ethers.parseEther("100"));
      const amount = ethers.parseEther("10");
      const price = ethers.parseEther("0.5");
      const cost = (amount * price) / ethers.parseEther("1");
      await contract.connect(buyer).tradeEnergy(
        seller.address, amount, price, { value: cost }
      );

      const stats = await contract.getUserStats(buyer.address);
      expect(stats.balance_).to.equal(amount);
      expect(stats.userDailyVolume_).to.equal(amount);
      expect(stats.userTradeCount_).to.equal(1);
    });
  });
});
