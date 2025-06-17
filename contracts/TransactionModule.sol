// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./UserRegistration.sol";
import "./Pricing.sol";

contract TransactionModule {
    UserRegistration private userRegistration;
    Pricing private pricing;

    // Структура для зберігання інформації про транзакцію
    struct Transaction {
        address user;        // Користувач, який здійснив транзакцію
        uint amount;         // Сума транзакції
        string productType;  // Тип продукту
        uint timestamp;      // Час транзакції
        bool confirmed;      // Статус підтвердження транзакції
    }

    // Маппінг для зберігання транзакцій користувачів
    mapping(address => Transaction[]) public userTransactions;

    // Подія для запису транзакції
    event TransactionRecorded(address indexed user, uint amount, string productType, uint timestamp);
    // Подія для підтвердження транзакції
    event TransactionConfirmed(address indexed user, uint amount, string productType, uint timestamp);

    // Ініціалізація контрактів UserRegistration та Pricing
    constructor(address _userRegistrationAddress, address _pricingAddress) {
        userRegistration = UserRegistration(_userRegistrationAddress);
        pricing = Pricing(_pricingAddress);
    }


    // Запис транзакції
    function recordTransaction(uint _amount, string memory _productType) external {
        
        uint userPrice = pricing.getUserPrice(msg.sender, _productType);
        
        // Перевірка, чи достатньо коштів для транзакції на основі персоналізованої ціни
        require(_amount >= userPrice, "Amount is less than personalized price");

        // Створення нового запису транзакції
        Transaction memory newTransaction = Transaction({
            user: msg.sender,
            amount: _amount,
            productType: _productType,
            timestamp: block.timestamp,
            confirmed: false
        });
        
        // Додавання транзакції в маппінг
        userTransactions[msg.sender].push(newTransaction);
        
        // Випуск події для запису транзакції
        emit TransactionRecorded(msg.sender, _amount, _productType, block.timestamp);
    }

    // Підтвердження транзакції
    function confirmTransaction(uint _transactionIndex) external {
        // Перевірка, чи існує транзакція для користувача
        require(_transactionIndex < userTransactions[msg.sender].length, "Transaction does not exist");

        // Отримання транзакції
        Transaction storage transaction = userTransactions[msg.sender][_transactionIndex];

        // Перевірка, чи не була транзакція вже підтверджена
        require(!transaction.confirmed, "Transaction already confirmed");

        // Оновлення статусу підтвердження
        transaction.confirmed = true;

        // Випуск події для підтвердження транзакції
        emit TransactionConfirmed(msg.sender, transaction.amount, transaction.productType, transaction.timestamp);
    }

    // Отримання транзакцій користувача
    function getTransactions(address _user) external view returns (Transaction[] memory) {
        return userTransactions[_user];
    }

    // Перевірка статусу підтвердження транзакції
    function isTransactionConfirmed(address _user, uint _transactionIndex) external view returns (bool) {
        require(_transactionIndex < userTransactions[_user].length, "Transaction does not exist");
        return userTransactions[_user][_transactionIndex].confirmed;
    }
}
