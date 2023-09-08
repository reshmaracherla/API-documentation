const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;
const secretKey = 'mysecretkey';

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(res => console.log("mongodb connected"))
  .catch(err => console.log(err))

// Create a User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String, },
  full_name: { type: String,  },
  age: { type: String,  },
  gender: { type: String,  },
  email: { type: String,  },
});
const User = mongoose.model('User', userSchema);

app.use(bodyParser.json());

// Route for user signup
app.post('/signup', async (req, res) => {
  const { username, password, full_name, age, gender, email } = req.body;

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    const token = jwt.sign({ id: User.id, username: User.username }, secretKey);

     console.log(token);
     console.log("my name is khan");
    
    const newUser = new User({ username, password, full_name, age, gender, email });
    await newUser.save();
    res.newUser
    return res.status(201).json({ message: 'User created successfully', newUser ,token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred' });
  }
  
});
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
});

function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }

    req.user = decoded;
    next();
  });
}



const Product = mongoose.model('Product', productSchema);
// Create a new product
app.post('/products', verifyToken, async (req, res) => {
  try {
    const { name, price } = req.body;
    const newProduct = new Product({ name, price });
    await newProduct.save();
    res.newProduct
    return res.status(201).json({ message: 'Product created successfully', newProduct });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred' });
  }
});
// Get all products
app.get('/products', verifyToken, async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json({"status":"success",products});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred' });
  }
});
// Update a product
app.put('/products/:productId', verifyToken, async (req, res) => {
  try {
    const productId = req.params.productId;
    const { name, price } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(productId, { name, price }, { new: true });
    return res.status(201).json({ "status": "success","message": "Data updated successfully."});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred' });
  }
});
// Delete a product
app.delete('/products/:productId', verifyToken, async (req, res) => {
  try {
    const productId = req.params.productId;
    await Product.findByIdAndDelete(productId);
    return res.status(200).json({ "status": "success","message": "Data deleted successfully."});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred' });
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});