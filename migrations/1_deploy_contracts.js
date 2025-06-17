const UserRegistration = artifacts.require("UserRegistration");
const Pricing = artifacts.require("Pricing");
const TransactionModule = artifacts.require("TransactionModule");

module.exports = async function (deployer) {
  console.log("Deploying contracts...");

  // Деплоїмо UserRegistration
  await deployer.deploy(UserRegistration);
  const userRegistration = await UserRegistration.deployed();
  console.log("UserRegistration deployed at:", userRegistration.address);

  // Деплоїмо Pricing
  await deployer.deploy(Pricing);
  const pricing = await Pricing.deployed();
  console.log("Pricing deployed at:", pricing.address);

  // Деплоїмо TransactionModule з правильними адресами
  await deployer.deploy(TransactionModule, userRegistration.address, pricing.address);
  const transactionModule = await TransactionModule.deployed();
  console.log("TransactionModule deployed at:", transactionModule.address);

  console.log("Contracts deployed successfully.");
};
