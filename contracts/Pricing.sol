// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract Pricing {
    struct Purchase {
        uint timestamp;  // Час покупки
        uint amount;     // Сума покупки
        string product;  // Тип продукту
    }

    struct User {
        uint lastPurchaseTimestamp; // Час останньої покупки
        uint purchaseFrequency;     // Частота покупок
        uint totalSpent;            // Загальна сума витрат
        string cohort;              // Когорта користувача
        string tariffPlan;          // Тарифний план користувача
        uint productVariety;        // Різноманітність покупок
        Purchase[] purchaseHistory; // Історія покупок
    }

    // Маппінг для зберігання даних користувачів
    mapping(address => User) private users;

    // Маппінг для зберігання персоналізованих цін
    mapping(address => mapping(string => uint)) private userPrices;

    // Маппінг для базових цін для різних категорій продуктів
    mapping(string => uint) private basePrices;

    // Ринкові фактори для динамічної зміни цін
    uint private marketActivityFactor = 100;
    mapping(string => uint) private totalProductActivity;
    mapping(string => uint) private productBuyersCount;

    // Події
    event UserPriceUpdated(address indexed user, string productType, uint newPrice);
    event UserCohortUpdated(address indexed user, string cohort);
    event UserTariffPlanUpdated(address indexed user, string tariffPlan);
    event MarketActivityUpdated(string productType, uint activity, uint buyers);

    // Функція для встановлення базових цін на продукти
    function setBasePrice(string memory _productType, uint _price) external {
        basePrices[_productType] = _price;
    }

    // Функція для оновлення даних про покупку користувача
    function updatePurchaseData(uint _purchaseAmount, string memory _productType) external {
        User storage user = users[msg.sender];

        // Оновлення часу останньої покупки
        user.lastPurchaseTimestamp = block.timestamp;

        // Оновлення частоти покупок та загальної суми витрат
        user.purchaseFrequency += 1;
        user.totalSpent += _purchaseAmount;

        // Оновлення різноманітності покупок
        updateProductVariety(user, _productType);

        // Додавання запису в історію покупок
        user.purchaseHistory.push(Purchase(block.timestamp, _purchaseAmount, _productType));

        // Оновлення персоналізованої ціни
        uint newPrice = calculatePrice(msg.sender, _productType);
        userPrices[msg.sender][_productType] = newPrice;

        // Оновлення тарифного плану
        string memory userTariffPlan = assignTariffPlan(msg.sender);
        user.tariffPlan = userTariffPlan;

        // Оновлення когорти
        string memory userCohort = assignCohort(msg.sender);
        user.cohort = userCohort;

        // Оновлення ринкової активності
        totalProductActivity[_productType] += _purchaseAmount;
        productBuyersCount[_productType] += 1;

        emit UserPriceUpdated(msg.sender, _productType, newPrice);
        emit UserTariffPlanUpdated(msg.sender, userTariffPlan);
        emit UserCohortUpdated(msg.sender, userCohort);
        emit MarketActivityUpdated(_productType, totalProductActivity[_productType], productBuyersCount[_productType]);
    }

    // Функція для обчислення персоналізованої ціни
    function calculatePrice(address user, string memory _productType) public view returns (uint) {
        User memory userData = users[user];

        uint basePrice = basePrices[_productType];
        require(basePrice > 0, "Base price for this product type is not set");

        uint recencyScore = block.timestamp - userData.lastPurchaseTimestamp;
        uint frequencyScore = userData.purchaseFrequency;
        uint monetaryScore = userData.totalSpent;
        uint diversityScore = userData.productVariety;

        uint recencyFactor = calculateRecencyFactor(recencyScore);
        uint frequencyFactor = calculateFrequencyFactor(frequencyScore);
        uint monetaryFactor = calculateMonetaryFactor(monetaryScore);
        uint diversityFactor = calculateDiversityFactor(diversityScore);

        return basePrice * recencyFactor * frequencyFactor * monetaryFactor * diversityFactor / 1000;
    }

    function calculateRecencyFactor(uint recencyScore) internal pure returns (uint) {
        return recencyScore < 7 days ? 3 : recencyScore < 30 days ? 2 : 1;
    }

    function calculateFrequencyFactor(uint frequencyScore) internal pure returns (uint) {
        return frequencyScore > 10 ? 3 : frequencyScore > 5 ? 2 : 1;
    }

    function calculateMonetaryFactor(uint monetaryScore) internal pure returns (uint) {
        return monetaryScore > 5000 ether ? 1 : monetaryScore > 1000 ether ? 2 : 3;
    }

    function calculateDiversityFactor(uint diversityScore) internal pure returns (uint) {
        return diversityScore > 5 ? 3 : diversityScore > 2 ? 2 : 1;
    }

    // Функція для визначення тарифного плану користувача на основі RFM-D аналізу
    function assignTariffPlan(address user) public view returns (string memory) {
        User memory userData = users[user];

        // Призначення тарифного плану на основі RFM-D
        if (userData.totalSpent > 5000 ether && userData.purchaseFrequency > 10 && userData.productVariety > 5) {
            return "Premium";  // Преміум тариф
        } else if (userData.totalSpent > 1000 ether) {
            return "Standard"; // Стандартний тариф
        } else if (userData.purchaseFrequency > 5) {
            return "Frequent"; // Тариф для частих покупців
        } else {
            return "Basic"; // Базовий тариф
        }
    }

    // Функція для визначення когорти користувача
    function assignCohort(address user) public view returns (string memory) {
        User memory userData = users[user];

        // Призначення когорти на основі витрат, частоти покупок і різноманітності покупок
        if (userData.totalSpent > 5000 ether && userData.purchaseFrequency > 10 && userData.productVariety > 5) {
            return "HighSpender";  // Високий витрачений і різноманітний покупець
        } else if (userData.totalSpent > 1000 ether) {
            return "FrequentBuyer"; // Частий покупець
        } else {
            return "LowSpender"; // Низький витрачений
        }
    }

    // Оновлення різноманітності покупок
    function updateProductVariety(User storage user, string memory _productType) internal {
        bool isNewProduct = true;
        for (uint i = 0; i < user.purchaseHistory.length; i++) {
            if (keccak256(bytes(user.purchaseHistory[i].product)) == keccak256(bytes(_productType))) {
                isNewProduct = false;
                break;
            }
        }

        if (isNewProduct) {
            user.productVariety += 1;
        }
    }

    // Оновлена функція корисності
    function calculateUtility(address user, string memory _productType) public view returns (uint) {
        User memory userData = users[user];

        // Базова ціна продукту
        uint basePrice = basePrices[_productType];
        require(basePrice > 0, "Base price for this product type is not set");

        // Динамічний коефіцієнт на основі ринкової активності
        uint averageActivity = totalProductActivity[_productType] / (productBuyersCount[_productType] > 0 ? productBuyersCount[_productType] : 1);
        uint dynamicFactor = (marketActivityFactor * averageActivity) / 100;

        // Спадна корисність із врахуванням часу та частоти покупок
        uint diminishingUtility = (basePrice * 10) / (10 + userData.purchaseFrequency);

        // Часовий фактор, що враховує потреби користувача (корисність з часом може зменшуватися)
        uint timeDecayFactor = (block.timestamp - userData.lastPurchaseTimestamp) / 365 days; // Зменшення корисності з кожним роком без взаємодії

        // Загальна корисність
        uint utility = diminishingUtility + dynamicFactor - timeDecayFactor;

        return utility;
    }

    // Функція для розрахунку персоналізованих знижок на основі когорти
    function calculateDiscount(address user, string memory _productType) public view returns (uint) {
        User memory userData = users[user];
        string memory cohort = userData.cohort;

        uint basePrice = basePrices[_productType];
        require(basePrice > 0, "Base price for this product type is not set");

        uint discount;

        if (keccak256(bytes(cohort)) == keccak256(bytes("HighSpender"))) {
            discount = basePrice * 20 / 100; // 20% знижки для HighSpender
        } else if (keccak256(bytes(cohort)) == keccak256(bytes("FrequentBuyer"))) {
            discount = basePrice *15 / 100; // 15% знижки для FrequentBuyer
        } else if (keccak256(bytes(cohort)) == keccak256(bytes("LowSpender"))) {
            discount = basePrice * 10 / 100; // 10% знижки для LowSpender
        } else {
            discount = basePrice * 5 / 100; // 5% стандартна знижка
        }

        return discount;
    }

    // Функція для отримання персоналізованої ціни користувача для конкретного продукту
    function getUserPrice(address user, string memory _productType) external view returns (uint) {
        return userPrices[user][_productType];
    }

    // Функція для отримання базової ціни для конкретного продукту
    function getBasePrice(string memory _productType) external view returns (uint) {
        return basePrices[_productType];
    }

    function getUserPurchaseHistory(address user) external view returns (Purchase[] memory) {
        return users[user].purchaseHistory;
    }
}