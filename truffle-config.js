module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Адреса локального хосту (зазвичай localhost)
      port: 7545,            // Порт Ganache (перевірте у вашій Ganache, за замовчуванням 8545)
      network_id: "*",       // Будь-який network ID
    },
  },

  compilers: {
    solc: {
      version: "0.8.0",      // Версія Solidity (переконайтеся, що вона збігається з вашими контрактами)
    },
  },
};

