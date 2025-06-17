const UserRegistration = artifacts.require("UserRegistration");

contract("UserRegistration", accounts => {
  let contract;

  beforeEach(async () => {
    contract = await UserRegistration.new();
  });

  // Тест на реєстрацію користувача
  it("should register a new user", async () => {
    const email = "user@example.com";
    const name = "John Doe";
    const result = await contract.registerUser(email, name, { from: accounts[0] });

    assert.equal(result.logs.length, 1, "One event should be emitted");
    const event = result.logs[0];
    assert.equal(event.event, "UserRegistered", "Event should be UserRegistered");
    assert.equal(event.args.userAddress, accounts[0], "Event should have correct user address");
    assert.equal(event.args.email, email, "Event should have correct email");
    assert.equal(event.args.name, name, "Event should have correct name");

    const user = await contract.getUser(accounts[0]);
    assert.equal(user.userId.toString(), "1", "User ID should be 1");
    assert.equal(user.email, email, "Email should match");
    assert.equal(user.name, name, "Name should match");
  });

  // Тест на оновлення даних користувача
  it("should update user information", async () => {
    const email = "user@example.com";
    const name = "John Doe";
    await contract.registerUser(email, name, { from: accounts[0] });

    const newEmail = "newuser@example.com";
    const newName = "Jane Doe";
    const result = await contract.updateUser(newEmail, newName, { from: accounts[0] });

    assert.equal(result.logs.length, 1, "One event should be emitted");
    const event = result.logs[0];
    assert.equal(event.event, "UserUpdated", "Event should be UserUpdated");
    assert.equal(event.args.userAddress, accounts[0], "Event should have correct user address");
    assert.equal(event.args.newEmail, newEmail, "Event should have correct new email");
    assert.equal(event.args.newName, newName, "Event should have correct new name");

    const user = await contract.getUser(accounts[0]);
    assert.equal(user.email, newEmail, "Email should be updated");
    assert.equal(user.name, newName, "Name should be updated");
  });

  // Тест на видалення користувача
  it("should delete a user", async () => {
    const email = "user@example.com";
    const name = "John Doe";
    await contract.registerUser(email, name, { from: accounts[0] });

    const result = await contract.deleteUser({ from: accounts[0] });

    assert.equal(result.logs.length, 1, "One event should be emitted");
    const event = result.logs[0];
    assert.equal(event.event, "UserDeleted", "Event should be UserDeleted");
    assert.equal(event.args.userAddress, accounts[0], "Event should have correct user address");

    try {
      await contract.getUser(accounts[0]);
      assert.fail("User should be deleted and not found");
    } catch (error) {
      assert(error.message.includes("User does not exist"), "Error should contain 'User does not exist'");
    }
  });

  // Тест на перевірку реєстрації з порожнім імейлом
  it("should not allow registration with an empty email", async () => {
    try {
      await contract.registerUser("", "John Doe", { from: accounts[0] });
      assert.fail("Registration with empty email should fail");
    } catch (error) {
      assert(error.message.includes("Email must be at least 5 characters long"), "Error message should match");
    }
  });

  // Тест на перевірку реєстрації з порожнім ім'ям
  it("should not allow registration with empty name", async () => {
    try {
      await contract.registerUser("user@example.com", "", { from: accounts[0] });
      assert.fail("Registration with empty name should fail");
    } catch (error) {
      assert(error.message.includes("Name cannot be empty"), "Error message should match");
    }
  });

  // Тест на реєстрацію з вже зареєстрованим email
  it("should not allow registration with already registered email", async () => {
    const email = "user@example.com";
    const name = "John Doe";
    await contract.registerUser(email, name, { from: accounts[0] });

    try {
      await contract.registerUser(email, "Jane Doe", { from: accounts[1] });
      assert.fail("Registration with already registered email should fail");
    } catch (error) {
      assert(error.message.includes("Email is already registered"), "Error message should match");
    }
  });
});


