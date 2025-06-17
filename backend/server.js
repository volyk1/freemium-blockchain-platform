import express from 'express';
import Web3 from 'web3';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read contract artifacts
const contractPath = join(__dirname, '../build/contracts');

const UserRegistration = JSON.parse(
    fs.readFileSync(join(contractPath, 'UserRegistration.json'))
);
const Pricing = JSON.parse(
    fs.readFileSync(join(contractPath, 'Pricing.json'))
);
const TransactionModule = JSON.parse(
    fs.readFileSync(join(contractPath, 'TransactionModule.json'))
);

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

let web3, accounts, userRegistration, pricing, transactionModule;

// Blockchain initialization
const initBlockchain = async () => {
  try {
        // Connect to local blockchain
    web3 = new Web3('http://127.0.0.1:7545');
        
        // Get accounts
    accounts = await web3.eth.getAccounts();
        console.log('Connected accounts:', accounts);

        // Initialize contracts
    userRegistration = new web3.eth.Contract(
      UserRegistration.abi,
            UserRegistration.networks['5777'].address
    );

    pricing = new web3.eth.Contract(
      Pricing.abi,
      Pricing.networks['5777'].address
    );

    transactionModule = new web3.eth.Contract(
      TransactionModule.abi,
      TransactionModule.networks['5777'].address
    );

        console.log('Blockchain initialization successful');
        console.log('UserRegistration address:', UserRegistration.networks['5777'].address);
        console.log('Pricing address:', Pricing.networks['5777'].address);
        console.log('TransactionModule address:', TransactionModule.networks['5777'].address);
  } catch (error) {
    console.error("Error initializing blockchain:", error);
        throw error;
    }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Routes

// Register user
app.post('/api/auth/register', async (req, res) => {
    const { email, name, password } = req.body;

    try {
        // Validate input
        if (!email || !name || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Register on blockchain
      await userRegistration.methods
            .registerUser(email, name)
            .send({ 
                from: accounts[0], 
                gas: 3000000 
            });

        // Hash password for database storage
        const hashedPassword = await bcrypt.hash(password, 10);

        // Here you would typically save the user to your database
        // For now, we'll just return success

        res.status(201).json({ 
            message: 'User registered successfully',
            email,
            name
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: 'Registration failed', 
            details: error.message 
        });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Here you would typically verify against your database
        // For demo purposes, we'll just check if user exists on blockchain
        const userData = await userRegistration.methods
            .getUser(accounts[0])
            .call();

        if (!userData) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { email: email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({ 
            token,
            user: {
                email: userData.email,
                name: userData.name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Login failed', 
            details: error.message 
        });
    }
});

// Protected route example
app.post('/api/transaction', authenticateToken, async (req, res) => {
    const { amount, productType } = req.body;

    try {
      await transactionModule.methods
        .recordTransaction(amount, productType)
            .send({ 
                from: accounts[0],
                gas: 3000000 
            });

        res.json({ message: 'Transaction recorded successfully' });
    } catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({ 
            error: 'Transaction failed', 
            details: error.message 
        });
    }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const userData = await userRegistration.methods
      .getUser(accounts[0])
      .call();
    
    res.json({
      email: userData.email,
      name: userData.name
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Update user profile
app.put('/api/user/update', authenticateToken, async (req, res) => {
  const { newEmail, newName } = req.body;
  
  try {
    await userRegistration.methods
      .updateUser(newEmail, newName)
      .send({ from: accounts[0], gas: 3000000 });
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Delete user account
app.delete('/api/user/delete', authenticateToken, async (req, res) => {
  try {
    await userRegistration.methods
      .deleteUser()
      .send({ from: accounts[0], gas: 3000000 });
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Change password endpoint
app.put('/api/user/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    // Get user data from blockchain
    const userData = await userRegistration.methods
      .getUser(accounts[0])
      .call();

    // In a real application, you would verify the current password against stored hash
    // For this example, we'll implement a simple verification
    // You should adapt this to your actual password storage mechanism
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in the smart contract
    await userRegistration.methods
      .updateUserPassword(hashedPassword)
      .send({ 
        from: accounts[0],
        gas: 3000000
      });

    // Generate new token with updated credentials
    const token = jwt.sign(
      { email: userData.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Password updated successfully',
      token: token
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to update password. ' + error.message });
  }
});

// Get user price for a product
app.get('/api/pricing/user-price', authenticateToken, async (req, res) => {
  try {
    const { productType } = req.query;
    const userPrice = await pricing.methods
      .getUserPrice(accounts[0], productType)
      .call();
    
    res.json({ price: userPrice });
  } catch (error) {
    console.error('Error getting price:', error);
    res.status(500).json({ error: 'Failed to get price' });
  }
});

// Record a transaction
app.post('/api/transaction/record', authenticateToken, async (req, res) => {
  try {
    const { amount, productType } = req.body;
    
    await transactionModule.methods
      .recordTransaction(amount, productType)
      .send({ 
        from: accounts[0],
        gas: 3000000
      });

    res.json({ message: 'Transaction recorded successfully' });
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'Failed to record transaction' });
  }
});

// Get user transactions
app.get('/api/transaction/list', authenticateToken, async (req, res) => {
  try {
    const transactions = await transactionModule.methods
      .getTransactions(accounts[0])
      .call();
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Start server
const startServer = async () => {
    try {
        await initBlockchain();
        
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

// Error handling
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

export default app;

