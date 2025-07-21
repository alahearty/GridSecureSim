const hre = require("hardhat");

async function main() {
  console.log("Deploying Energy Trading Contract...");

  // Get the contract factory
  const EnergyTradingContract = await hre.ethers.getContractFactory("EnergyTradingContract");
  
  // Deploy the contract
  const energyContract = await EnergyTradingContract.deploy();
  
  // Wait for deployment to finish
  await energyContract.deployed();

  console.log("Energy Trading Contract deployed to:", energyContract.address);
  
  // Log deployment information
  console.log("\n=== Deployment Information ===");
  console.log("Contract Address:", energyContract.address);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", await energyContract.signer.getAddress());
  
  // Verify contract on Etherscan (if not on localhost)
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\nWaiting for block confirmations...");
    await energyContract.deployTransaction.wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: energyContract.address,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
  
  // Save deployment info to file
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress: energyContract.address,
    network: hre.network.name,
    deployer: await energyContract.signer.getAddress(),
    deploymentTime: new Date().toISOString(),
    constructorArguments: []
  };
  
  fs.writeFileSync(
    `deployment-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\nDeployment info saved to:", `deployment-${hre.network.name}.json`);
  
  // Update .env file with contract address
  updateEnvFile(energyContract.address);
}

function updateEnvFile(contractAddress) {
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.join(__dirname, '..', '.env');
  
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update or add ENERGY_CONTRACT_ADDRESS
    if (envContent.includes('ENERGY_CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(
        /ENERGY_CONTRACT_ADDRESS=.*/,
        `ENERGY_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nENERGY_CONTRACT_ADDRESS=${contractAddress}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log("Updated .env file with contract address");
  } else {
    console.log("No .env file found. Please add ENERGY_CONTRACT_ADDRESS=" + contractAddress);
  }
}

// Handle errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 