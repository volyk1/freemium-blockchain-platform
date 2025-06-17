// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract UserRegistration {
    struct User {
        uint256 userId; // Унікальний ідентифікатор користувача
        string email;
        string name;
        string passwordHash; // Add this field
    }

    mapping(address => User) private users; // Зберігаємо користувачів за їхньою адресою
    mapping(string => bool) private registeredEmails; // Перевірка на унікальність email
    uint256 private nextUserId = 1; // Лічильник для генерації унікальних ідентифікаторів

    event UserRegistered(address indexed userAddress, uint256 userId, string email, string name);
    event UserUpdated(address indexed userAddress, string newEmail, string newName);
    event UserDeleted(address indexed userAddress);
    event PasswordUpdated(address indexed userAddress);

    // Реєстрація нового користувача
    function registerUser(string memory _email, string memory _name)
        external
        returns (bool success)
    {
        require(bytes(_email).length >= 5, "Email must be at least 5 characters long");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(!registeredEmails[_email], "Email is already registered");
        require(users[msg.sender].userId == 0, "User is already registered");

        uint256 userId = nextUserId++; // Генеруємо унікальний ідентифікатор

        users[msg.sender] = User(userId, _email, _name, ""); // Initialize passwordHash
        registeredEmails[_email] = true;

        emit UserRegistered(msg.sender, userId, _email, _name);
        return true;
    }

    // Оновлення даних користувача
    function updateUser(string memory _newEmail, string memory _newName)
        external
        returns (bool success)
    {
        require(users[msg.sender].userId > 0, "User does not exist");
        require(bytes(_newEmail).length >= 5, "Email must be at least 5 characters long");
        require(bytes(_newName).length > 0, "Name cannot be empty");

        // Якщо email змінюється, перевірити його унікальність
        if (keccak256(bytes(users[msg.sender].email)) != keccak256(bytes(_newEmail))) {
            require(!registeredEmails[_newEmail], "New email is already registered");
            registeredEmails[users[msg.sender].email] = false; // Вивільнити старий email
            registeredEmails[_newEmail] = true; // Зареєструвати новий email
        }

        // Оновлення даних користувача
        users[msg.sender].email = _newEmail;
        users[msg.sender].name = _newName;

        emit UserUpdated(msg.sender, _newEmail, _newName);
        return true;
    }

    // Видалення користувача
    function deleteUser() external returns (bool success) {
        require(users[msg.sender].userId > 0, "User does not exist");

        // Видаляємо дані користувача
        registeredEmails[users[msg.sender].email] = false; // Вивільнити email
        delete users[msg.sender]; // Видалити користувача

        emit UserDeleted(msg.sender);
        return true;
    }

    // Отримання даних користувача за адресою
    function getUser(address _userAddress)
        external
        view
        returns (
            uint256 userId,
            string memory email,
            string memory name,
            string memory passwordHash
        )
    {
        require(users[_userAddress].userId > 0, "User does not exist");
        User memory user = users[_userAddress];
        return (user.userId, user.email, user.name, user.passwordHash);
    }

    // Update password
    function updateUserPassword(string memory _newPasswordHash) 
        external 
        returns (bool success) 
    {
        require(users[msg.sender].userId > 0, "User does not exist");
        
        // Update password hash
        users[msg.sender].passwordHash = _newPasswordHash;
        
        // Emit event
        emit PasswordUpdated(msg.sender);
        
        return true;
    }
}

