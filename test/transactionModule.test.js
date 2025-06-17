const TransactionModule = artifacts.require("TransactionModule");
const UserRegistration = artifacts.require("UserRegistration");
const Pricing = artifacts.require("Pricing");

contract("TransactionModule", (accounts) => {
  let transactionModule;
  let userRegistration;
  let pricing;

  const user1 = accounts[0];
  const user2 = accounts[1];

  beforeEach(async () => {
    // Розгортання контрактів UserRegistration та Pricing
    userRegistration = await UserRegistration.new();
    pricing = await Pricing.new();

    // Розгортання контракту TransactionModule
    transactionModule = await TransactionModule.new(userRegistration.address, pricing.address);
  });

  it("should record a transaction", async () => {
    await pricing.setBasePrice("ProductA", web3.utils.toWei("100", "ether"));
    await pricing.updatePurchaseData(web3.utils.toWei("150", "ether"), "ProductA", { from: user1 });

    // Запис транзакції
    await transactionModule.recordTransaction(web3.utils.toWei("150", "ether"), "ProductA", { from: user1 });

    const transactions = await transactionModule.getTransactions(user1);

    assert.equal(transactions.length, 1, "Transaction was not recorded");
    assert.equal(transactions[0].user, user1, "User is not correct");
    assert.equal(transactions[0].amount.toString(), web3.utils.toWei("150", "ether"), "Amount is not correct");
    assert.equal(transactions[0].productType, "ProductA", "Product type is not correct");
    assert.equal(transactions[0].confirmed, false, "Transaction is already confirmed");
  });

  it("should confirm a transaction", async () => {
    await pricing.setBasePrice("ProductA", web3.utils.toWei("100", "ether"));
    await pricing.updatePurchaseData(web3.utils.toWei("150", "ether"), "ProductA", { from: user1 });

    // Запис транзакції
    await transactionModule.recordTransaction(web3.utils.toWei("150", "ether"), "ProductA", { from: user1 });

    const transactionsBefore = await transactionModule.getTransactions(user1);
    const transactionIndex = 0;

    // Підтвердження транзакції
    await transactionModule.confirmTransaction(transactionIndex, { from: user1 });

    const transactionsAfter = await transactionModule.getTransactions(user1);
    const confirmedTransaction = transactionsAfter[transactionIndex];

    assert.equal(confirmedTransaction.confirmed, true, "Transaction was not confirmed");
  });

  it("should not confirm a non-existing transaction", async () => {
    try {
      await transactionModule.confirmTransaction(0, { from: user1 });
      assert.fail("Non-existing transaction was confirmed");
    } catch (error) {
      assert.include(error.message, "Transaction does not exist", "Error message is incorrect");
    }
  });

  it("should check the transaction confirmation status", async () => {
    await pricing.setBasePrice("ProductA", web3.utils.toWei("100", "ether"));
    await pricing.updatePurchaseData(web3.utils.toWei("150", "ether"), "ProductA", { from: user1 });

    // Запис транзакції
    await transactionModule.recordTransaction(web3.utils.toWei("150", "ether"), "ProductA", { from: user1 });

    const transactionIndex = 0;

    // Перевірка статусу підтвердження
    const isConfirmedBefore = await transactionModule.isTransactionConfirmed(user1, transactionIndex);
    assert.equal(isConfirmedBefore, false, "Transaction status should be false before confirmation");

    // Підтвердження транзакції
    await transactionModule.confirmTransaction(transactionIndex, { from: user1 });

    const isConfirmedAfter = await transactionModule.isTransactionConfirmed(user1, transactionIndex);
    assert.equal(isConfirmedAfter, true, "Transaction status should be true after confirmation");
  });
});

