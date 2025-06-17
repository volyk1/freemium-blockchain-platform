const Pricing = artifacts.require("Pricing");

contract("Pricing", (accounts) => {
  let pricingContract;

  const user1 = accounts[0];
  const user2 = accounts[1];

  beforeEach(async () => {
    pricingContract = await Pricing.new();
  });

  it("should set the base price for a product", async () => {
    await pricingContract.setBasePrice("ProductA", web3.utils.toWei("100", "ether"));
    
    const basePrice = await pricingContract.getBasePrice("ProductA");
    
    assert.equal(basePrice.toString(), web3.utils.toWei("100", "ether"));
  });

  it("should update the purchase data for a user", async () => {
    await pricingContract.setBasePrice("ProductA", web3.utils.toWei("100", "ether"));

    // Оновлення покупки користувача
    await pricingContract.updatePurchaseData(web3.utils.toWei("150", "ether"), "ProductA", { from: user1 });
    
    const userPrice = await pricingContract.getUserPrice(user1, "ProductA");

    // Перевірка персоналізованої ціни після покупки
    assert.isTrue(userPrice > 0);
  });

  it("should calculate personalized price based on user data", async () => {
    await pricingContract.setBasePrice("ProductA", web3.utils.toWei("100", "ether"));

    // Користувач здійснює покупку
    await pricingContract.updatePurchaseData(web3.utils.toWei("150", "ether"), "ProductA", { from: user1 });

    // Розрахунок персоналізованої ціни
    const userPrice = await pricingContract.calculatePrice(user1, "ProductA");

    assert.isTrue(userPrice > 0);
  });

  it("should assign the correct cohort to a user", async () => {
    await pricingContract.setBasePrice("ProductA", web3.utils.toWei("100", "ether"));

    // Користувач здійснює покупку
    await pricingContract.updatePurchaseData(web3.utils.toWei("2000", "ether"), "ProductA", { from: user1 });

    // Перевірка когорти
    const cohort = await pricingContract.assignCohort(user1);
    
    assert.equal(cohort, "FrequentBuyer");
  });

  it("should apply the correct discount based on user cohort", async () => {
    await pricingContract.setBasePrice("ProductA", web3.utils.toWei("100", "ether"));

    // Користувач здійснює покупку
    await pricingContract.updatePurchaseData(web3.utils.toWei("2000", "ether"), "ProductA", { from: user1 });

    // Розрахунок знижки
    const discount = await pricingContract.calculateDiscount(user1, "ProductA");
    
    assert.isTrue(discount > 0);
  });

  it("should calculate the utility score correctly", async () => {
    await pricingContract.setBasePrice("ProductA", web3.utils.toWei("100", "ether"));

    // Користувач здійснює покупки
    await pricingContract.updatePurchaseData(web3.utils.toWei("500", "ether"), "ProductA", { from: user1 });

    // Розрахунок корисності
    const utility = await pricingContract.calculateUtility(user1, "ProductA");

    assert.isTrue(utility > 0);
  });
});

