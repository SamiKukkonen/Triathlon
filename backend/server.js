// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcryptjs for password hashing
const axios = require('axios');
const cors = require('cors'); // Import CORS middleware
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;
const uri = `mongodb+srv://samsokukkonen:${process.env.MONGODB_PASSWORD}@cluster0.pukkv2v.mongodb.net/Triathlon?retryWrites=true&w=majority&appName=Cluster0`;

// Connect to MongoDB database
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));

// Define Item Schema
const itemSchema = new mongoose.Schema({
  type: String,
  distance: Number,
  date: { type: Date, default: Date.now }
}, { 
  // Exclude "__v" and "_id" fields from query results
  versionKey: false
});

// Create Item model
const Item = mongoose.model('Item', itemSchema);

// Define User Schema with hashed password
const userSchema = new mongoose.Schema({
  username: String,
  password: String // Hashed password will be stored
});

// Middleware to hash password before saving user to the database
userSchema.pre('save', async function(next) {
  try {
    // Check if password is modified
    if (!this.isModified('password')) {
      return next();
    }

    // Generate salt
    const salt = await bcrypt.genSalt(10);

    // Hash password with the salt
    const hashedPassword = await bcrypt.hash(this.password, salt);

    // Replace plain password with hashed password
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Create User model
const User = mongoose.model('User', userSchema);

// Middleware to parse JSON requests
app.use(express.json());

// CORS middleware
app.use(cors());

app.use(express.static('build'))

// Route to create a new item
app.post('/activities', async (req, res) => {
  try {
    const { type, distance } = req.body;
    const newItem = new Item({ type, distance });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get all items
app.get('/activities', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    console.error('Error getting items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to create a new user
app.post('/users', async (req, res) => {
  try {
    const { username, password } = req.body;
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to check login status
app.post('/check-login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Query the database to find a user with the provided username
    const user = await User.findOne({ username });

    // If user exists, compare the provided password with the hashed password in the database
    if (user && await bcrypt.compare(password, user.password)) {
      // If password is correct, send a success response
      res.status(200).json({ loggedIn: true });
    } else {
      // If user does not exist or password is incorrect, send an unauthorized response
      res.status(401).json({ loggedIn: false });
    }
  } catch (error) {
    // If an error occurs during the database query, send an internal server error response
    console.error('Error checking login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
