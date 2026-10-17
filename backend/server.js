const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Login = require('./models/loginmodel');
const User = require('./models/usermodel');
const Plant = require('./models/plantmodel');
const Category = require('./models/categorymodel');
const Purchase = require('./models/purchasemodel');
const Review = require('./models/reviewmodel');
const ContactMessage = require('./models/contactmessagemodel');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/plantnursery';
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('connected to mongoDB: ' + MONGO_URI);
    await seedInitialData();
  })
  .catch(err => console.log('mongoDB connection error!', err.message));

// Seed initial essential data if collections are empty
async function seedInitialData() {
  try {
    // 1. Seed Admin user
    const adminExists = await Login.findOne({ username: 'admin' });
    if (!adminExists) {
      await Login.create({
        username: 'admin',
        password: 'admin123',
        usertype: 'admin'
      });
      await User.create({
        name: 'Nursery Administrator',
        email: 'admin@bloomora.com',
        phoneNumber: '+91 98765 43210',
        address: 'Bloomora Botanical Gardens, Green Valley, India',
        username: 'admin'
      });
      console.log('Seeded default admin account (admin / admin123)');
    }

    // 2. Seed Default Categories
    const { initialCategories, plantTemplates } = require('./seedData');

    const resolvePlantImage = (categoryName, plantName) => {
      const name = (plantName || '').toLowerCase();
      if (name.includes('monstera')) return '/images/plant-monstera.jpg';
      if (name.includes('fiddle') || name.includes('lyrata')) return '/images/plant-fiddle.jpg';
      if (name.includes('snake') || name.includes('sansevieria')) return '/images/plant-snake.jpg';
      if (name.includes('peace lily')) return '/images/plant-peacelily.jpg';
      if (name.includes('bonsai') || name.includes('elm')) return '/images/plant-bonsai.jpg';
      if (name.includes('orchid') || name.includes('anthurium') || name.includes('jasmine') || name.includes('hibiscus') || name.includes('florets') || name.includes('rose') || name.includes('violet') || name.includes('ixora') || name.includes('bougainvillea')) return '/images/plant-flowering.jpg';
      if (name.includes('fern')) return '/images/plant-fern.jpg';
      if (name.includes('tulsi') || name.includes('basil') || name.includes('mint') || name.includes('pudina') || name.includes('rosemary') || name.includes('herb')) return '/images/plant-herbs.jpg';
      if (name.includes('palm') || name.includes('tree') || name.includes('pine') || name.includes('yucca') || name.includes('schefflera')) return '/images/plant-palm.jpg';
      if (name.includes('pothos') || name.includes('ivy') || name.includes('trailing') || name.includes('heart') || name.includes('turtle') || name.includes('dischidia') || name.includes('hoya') || name.includes('tradescantia')) return '/images/plant-pothos.jpg';
      if (name.includes('succulent') || name.includes('cactus') || name.includes('echeveria') || name.includes('aloe') || name.includes('jade') || name.includes('haworthia') || name.includes('agave') || name.includes('sedum')) return '/images/plant-succulent.jpg';

      switch (categoryName) {
        case 'Indoor Plants': return '/images/plant-monstera.jpg';
        case 'Outdoor Plants': return '/images/plant-fiddle.jpg';
        case 'Air Purifiers': return '/images/plant-peacelily.jpg';
        case 'Succulents & Cacti': return '/images/plant-succulent.jpg';
        case 'Flowering Plants': return '/images/plant-flowering.jpg';
        case 'Indoor Trees & Palms': return '/images/plant-palm.jpg';
        case 'Hanging & Trailing': return '/images/plant-pothos.jpg';
        case 'Bonsai & Topiary': return '/images/plant-bonsai.jpg';
        case 'Herbs & Medicinal': return '/images/plant-herbs.jpg';
        case 'Ferns & Foliage': return '/images/plant-fern.jpg';
        default: return '/images/plant-monstera.jpg';
      }
    };
    
    for (const cat of initialCategories) {
      await Category.findOneAndUpdate(
        { name: cat.name },
        { name: cat.name, icon: cat.icon, description: cat.description },
        { upsert: true, returnDocument: 'after' }
      );
    }
    const allCategories = await Category.find();
    const catMap = {};
    allCategories.forEach(c => { catMap[c.name] = c._id; });

    // 3. Seed 70 Plant Varieties
    const plantCount = await Plant.countDocuments();
    if (plantCount < 70) {
      await Plant.deleteMany({});
      
      const plantDocs = plantTemplates.map((p) => ({
        plantName: p.name,
        botanicalName: p.botanical,
        categoryId: catMap[p.cat] || allCategories[0]._id,
        categoryName: p.cat,
        description: p.desc,
        price: p.price,
        originalPrice: p.orig,
        stock: p.stock,
        image: resolvePlantImage(p.cat, p.name),
        badge: p.badge || '',
        status: p.stock > 0 ? 'Available' : 'Out of Stock'
      }));

      await Plant.insertMany(plantDocs);
      console.log(`Seeded ${plantDocs.length} plant varieties across categories!`);
    } else {
      // Clean up any legacy template images (e.g. tm-img, non-plant pictures)
      const plantsWithOldImages = await Plant.find({
        $or: [
          { image: { $regex: 'tm-img', $options: 'i' } },
          { image: { $regex: '/home/img', $options: 'i' } },
          { image: { $regex: 'tm-bg', $options: 'i' } }
        ]
      });
      for (const p of plantsWithOldImages) {
        p.image = resolvePlantImage(p.categoryName, p.plantName);
        await p.save();
      }
      if (plantsWithOldImages.length > 0) {
        console.log(`Updated ${plantsWithOldImages.length} plants to clean high-res plant images!`);
      }
    }

    // 4. Seed initial customer & reviews if empty
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      // Create a sample customer
      let sampleCust = await User.findOne({ username: 'priya' });
      if (!sampleCust) {
        await Login.create({ username: 'priya', password: 'password123', usertype: 'customer' });
        sampleCust = await User.create({
          name: 'Priya Sharma',
          email: 'priya@example.com',
          phoneNumber: '+91 91234 56789',
          address: '42 Orchid Residency, Indiranagar, Bangalore',
          username: 'priya'
        });
      }

      await Review.insertMany([
        {
          customerId: sampleCust._id,
          customerName: 'Priya Sharma',
          customerLocation: 'Bangalore',
          rating: 5,
          reviewText: 'The plants arrived in perfect condition — lush, well-packaged, and even prettier than the photos. My living room has never looked better!',
          plantName: 'Monstera Deliciosa'
        },
        {
          customerId: sampleCust._id,
          customerName: 'Arjun Mehta',
          customerLocation: 'Mumbai',
          rating: 5,
          reviewText: 'I have ordered from several nurseries online, but the quality here is unmatched. The care guides they include are a wonderful touch.',
          plantName: 'Fiddle Leaf Fig'
        },
        {
          customerId: sampleCust._id,
          customerName: 'Lakshmi Nair',
          customerLocation: 'Chennai',
          rating: 5,
          reviewText: 'Absolutely loved the succulent collection! Each plant was carefully labeled and arrived vibrant and thriving. Will definitely order again!',
          plantName: 'Jade Succulent Collection'
        }
      ]);
      console.log('Seeded default customer reviews');
    }
  } catch (err) {
    console.error('Error during data seed:', err.message);
  }
}

// ----------------------------------------------------
// AUTHORIZATION MIDDLEWARE
// ----------------------------------------------------

// Authenticate: Validates user identity from request headers.
// Sets req.authUser = { id, usertype, username } or returns 401.
const authenticate = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const userType = req.headers['x-user-type'];

    if (!userId || !userType) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in to continue.' });
    }

    // Verify the user actually exists in the database
    const userProfile = await User.findById(userId);
    if (!userProfile) {
      return res.status(401).json({ success: false, message: 'Authentication invalid. Please log in again.' });
    }

    // Verify the usertype matches what's in the Login collection
    const loginRecord = await Login.findOne({ username: userProfile.username });
    if (!loginRecord || loginRecord.usertype !== userType) {
      return res.status(401).json({ success: false, message: 'Authentication invalid. Please log in again.' });
    }

    req.authUser = {
      id: userProfile._id.toString(),
      usertype: loginRecord.usertype,
      username: userProfile.username
    };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Authentication failed. Please log in again.' });
  }
};

// Require Admin: Must be authenticated AND have admin role.
const requireAdmin = (req, res, next) => {
  if (req.authUser.usertype !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges are required.' });
  }
  next();
};

// Require Customer: Must be authenticated AND have customer role.
const requireCustomer = (req, res, next) => {
  if (req.authUser.usertype !== 'customer') {
    return res.status(403).json({ success: false, message: 'This action is not available to administrator accounts.' });
  }
  next();
};

// ----------------------------------------------------
// AUTHENTICATION & USER ROUTES
// ----------------------------------------------------

// Register new customer
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phoneNumber, address, username, password } = req.body;
    if (!name || !email || !username || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, username, and password are required' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    const existingLogin = await Login.findOne({
      username: new RegExp(`^${cleanUsername}$`, 'i')
    });
    if (existingLogin) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    const existingEmail = await User.findOne({
      email: new RegExp(`^${cleanEmail}$`, 'i')
    });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const newLogin = await Login.create({
      username: cleanUsername,
      password: password.trim(),
      usertype: 'customer'
    });

    let newUser;
    try {
      newUser = await User.create({
        name: name.trim(),
        email: cleanEmail,
        phoneNumber: (phoneNumber || '').trim(),
        address: (address || '').trim(),
        username: cleanUsername
      });
    } catch (createErr) {
      await Login.findByIdAndDelete(newLogin._id);
      throw createErr;
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        address: newUser.address,
        username: newUser.username,
        usertype: newLogin.usertype
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login (supports username or email, case-insensitive)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username/email and password are required' });
    }

    const identifier = username.trim();
    const trimmedPass = password.trim();

    // 1. Check direct or case-insensitive username match
    let loginRecord = await Login.findOne({
      username: new RegExp(`^${identifier}$`, 'i'),
      password: trimmedPass
    });

    // 2. If not found, check if identifier is an email
    if (!loginRecord) {
      const userByEmail = await User.findOne({
        email: new RegExp(`^${identifier}$`, 'i')
      });
      if (userByEmail) {
        loginRecord = await Login.findOne({
          username: userByEmail.username,
          password: trimmedPass
        });
      }
    }

    if (!loginRecord) {
      return res.status(401).json({ success: false, message: 'Invalid username/email or password' });
    }

    const userProfile = await User.findOne({ username: loginRecord.username });
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: userProfile ? userProfile._id : loginRecord._id,
        name: userProfile ? userProfile.name : loginRecord.username,
        email: userProfile ? userProfile.email : '',
        phoneNumber: userProfile ? userProfile.phoneNumber : '',
        address: userProfile ? userProfile.address : '',
        username: loginRecord.username,
        usertype: loginRecord.usertype
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------------------------------------------
// FORGOT & RESET PASSWORD (CUSTOMER ONLY)
// ----------------------------------------------------

// Verify customer account for password recovery — blocked for admins
app.post('/api/auth/forgot-password/verify', async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ success: false, message: 'Username or email is required' });
    }

    const cleanIdentifier = identifier.trim();

    // Explicitly block administrator accounts from password reset flow
    if (cleanIdentifier.toLowerCase() === 'admin' || cleanIdentifier.toLowerCase() === 'admin@bloomora.com') {
      return res.status(403).json({
        success: false,
        message: 'This action is not available to administrator accounts.'
      });
    }

    // 1. Search by username in Login
    let loginRecord = await Login.findOne({
      username: new RegExp(`^${cleanIdentifier}$`, 'i')
    });

    // 2. Or search by email in User
    let userProfile = null;
    if (loginRecord) {
      userProfile = await User.findOne({ username: loginRecord.username });
    } else {
      userProfile = await User.findOne({
        email: new RegExp(`^${cleanIdentifier}$`, 'i')
      });
      if (userProfile) {
        loginRecord = await Login.findOne({ username: userProfile.username });
      }
    }

    if (!loginRecord || !userProfile) {
      return res.status(404).json({
        success: false,
        message: 'No customer account found with that username or email.'
      });
    }

    // Double check: if user is admin, do not allow any action
    if (loginRecord.usertype === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'This action is not available to administrator accounts.'
      });
    }

    // Mask the email for user privacy display (e.g. p***a@example.com)
    const emailParts = userProfile.email.split('@');
    const namePart = emailParts[0];
    const domainPart = emailParts[1];
    const maskedName = namePart.length > 2
      ? namePart[0] + '*'.repeat(namePart.length - 2) + namePart.slice(-1)
      : namePart[0] + '*';
    const maskedEmail = `${maskedName}@${domainPart}`;

    res.json({
      success: true,
      message: 'Account verified successfully',
      username: userProfile.username,
      name: userProfile.name,
      maskedEmail
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reset password for customer — blocked for admins
app.post('/api/auth/forgot-password/reset', async (req, res) => {
  try {
    const { identifier, email, newPassword } = req.body;
    if (!identifier || !email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Username/email, registered email verification, and new password are required'
      });
    }

    const cleanIdentifier = identifier.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = newPassword.trim();

    if (cleanPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Explicitly block administrator accounts
    if (cleanIdentifier.toLowerCase() === 'admin' || cleanEmail === 'admin@bloomora.com') {
      return res.status(403).json({
        success: false,
        message: 'This action is not available to administrator accounts.'
      });
    }

    // Find account
    let loginRecord = await Login.findOne({
      username: new RegExp(`^${cleanIdentifier}$`, 'i')
    });
    let userProfile = null;

    if (loginRecord) {
      userProfile = await User.findOne({ username: loginRecord.username });
    } else {
      userProfile = await User.findOne({
        email: new RegExp(`^${cleanIdentifier}$`, 'i')
      });
      if (userProfile) {
        loginRecord = await Login.findOne({ username: userProfile.username });
      }
    }

    if (!loginRecord || !userProfile) {
      return res.status(404).json({
        success: false,
        message: 'No customer account found with that username or email.'
      });
    }

    // Block admin role completely
    if (loginRecord.usertype === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'This action is not available to administrator accounts.'
      });
    }

    // Verify email matches the customer's registered email
    if (userProfile.email.trim().toLowerCase() !== cleanEmail) {
      return res.status(400).json({
        success: false,
        message: 'Verification failed: The provided email does not match our records for this account.'
      });
    }

    // Update password for customer
    loginRecord.password = cleanPassword;
    await loginRecord.save();

    res.json({
      success: true,
      message: 'Your password has been successfully reset! You can now sign in with your new password.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get user profile — authenticated users can only access their own profile
app.get('/api/user/profile/:id', authenticate, async (req, res) => {
  try {
    // Ownership check: users can only view their own profile
    if (req.authUser.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'You do not have permission to view this profile.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update user profile — authenticated users can only update their own profile
app.put('/api/user/profile/:id', authenticate, async (req, res) => {
  try {
    // Ownership check: users can only update their own profile
    if (req.authUser.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'You do not have permission to modify this profile.' });
    }

    const { name, email, phoneNumber, address } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phoneNumber, address },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: View all registered customers
app.get('/api/admin/customers', authenticate, requireAdmin, async (req, res) => {
  try {
    const customers = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------------------------------------------
// CATEGORY MANAGEMENT ROUTES
// ----------------------------------------------------

// List categories (public — needed for catalog browsing)
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Add category
app.post('/api/categories', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

    const newCategory = await Category.create({ name, description, icon: icon || '🌱' });
    res.status(201).json({ success: true, message: 'Category created', category: newCategory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Edit category
app.put('/api/categories/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, icon },
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category updated', category: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Delete category
app.delete('/api/categories/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------------------------------------------
// PLANT MANAGEMENT ROUTES
// ----------------------------------------------------

// Get all plants (public — needed for catalog browsing)
app.get('/api/plants', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.$or = [
        { categoryName: req.query.category },
        { categoryId: mongoose.Types.ObjectId.isValid(req.query.category) ? req.query.category : null }
      ];
    }
    const plants = await Plant.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, plants });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single plant details (public — needed for catalog browsing)
app.get('/api/plants/:id', async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ success: false, message: 'Plant not found' });
    res.json({ success: true, plant });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Add new plant
app.post('/api/plants', authenticate, requireAdmin, async (req, res) => {
  try {
    const { plantName, botanicalName, categoryId, categoryName, description, price, originalPrice, stock, image, badge, status } = req.body;
    if (!plantName || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Plant name, price, and stock are required' });
    }

    const calculatedStatus = (Number(stock) <= 0) ? 'Out of Stock' : (status || 'Available');

    const newPlant = await Plant.create({
      plantName,
      botanicalName: botanicalName || '',
      categoryId: categoryId || null,
      categoryName: categoryName || 'General',
      description: description || '',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      stock: Number(stock),
      image: image || '/images/plant-monstera.jpg',
      badge: badge || '',
      status: calculatedStatus
    });

    res.status(201).json({ success: true, message: 'Plant created successfully', plant: newPlant });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Update plant
app.put('/api/plants/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.stock !== undefined) {
      updateData.stock = Number(updateData.stock);
      if (updateData.stock <= 0) {
        updateData.status = 'Out of Stock';
      }
    }
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.originalPrice !== undefined) updateData.originalPrice = Number(updateData.originalPrice);

    const updated = await Plant.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' });
    if (!updated) return res.status(404).json({ success: false, message: 'Plant not found' });
    res.json({ success: true, message: 'Plant updated successfully', plant: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Delete plant
app.delete('/api/plants/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const deleted = await Plant.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Plant not found' });
    res.json({ success: true, message: 'Plant deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------------------------------------------
// CART & CHECKOUT / PURCHASE ROUTES
// ----------------------------------------------------

// Create Purchase (Checkout without online payment) — Customer only, admins blocked
app.post('/api/purchases', authenticate, requireCustomer, async (req, res) => {
  try {
    const { customerId, customerName, customerEmail, customerPhone, shippingAddress, items, plantId, quantity, price, totalAmount } = req.body;

    // Verify the authenticated customer is placing an order for themselves
    if (req.authUser.id !== customerId) {
      return res.status(403).json({ success: false, message: 'You can only place orders for your own account.' });
    }

    if (!customerId || !shippingAddress) {
      return res.status(400).json({ success: false, message: 'Customer ID and Shipping Address are required' });
    }

    // Prepare purchase items list
    let orderItems = [];
    if (items && Array.isArray(items) && items.length > 0) {
      orderItems = items;
    } else if (plantId) {
      orderItems = [{
        plantId,
        plantName: req.body.plantName || 'Plant',
        price: Number(price),
        quantity: Number(quantity) || 1,
        image: req.body.image || ''
      }];
    } else {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Verify stock and update inventory for each item
    for (const item of orderItems) {
      const plant = await Plant.findById(item.plantId);
      if (!plant) {
        return res.status(400).json({ success: false, message: `Plant ${item.plantName || item.plantId} not found` });
      }
      if (plant.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${plant.plantName}". Available: ${plant.stock}, Requested: ${item.quantity}`
        });
      }
    }

    // Deduct stock
    for (const item of orderItems) {
      const plant = await Plant.findById(item.plantId);
      const remainingStock = plant.stock - item.quantity;
      plant.stock = remainingStock;
      if (remainingStock <= 0) {
        plant.status = 'Out of Stock';
      }
      await plant.save();
    }

    // Calculate total if not provided
    const calculatedTotal = totalAmount || orderItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);

    const firstItem = orderItems[0];
    const newPurchase = await Purchase.create({
      customerId,
      customerName: customerName || 'Valued Customer',
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      shippingAddress,
      plantId: firstItem ? firstItem.plantId : null,
      quantity: firstItem ? firstItem.quantity : 1,
      price: firstItem ? firstItem.price : calculatedTotal,
      totalAmount: calculatedTotal,
      items: orderItems,
      status: 'Confirmed',
      paymentMethod: 'Cash on Delivery (Pay upon Receipt)',
      purchaseDate: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Cash on delivery selected.',
      purchase: newPurchase
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Customer: View their order history — ownership enforced, admins blocked
app.get('/api/purchases/my-orders/:customerId', authenticate, async (req, res) => {
  try {
    // Block admin users from customer-only order viewing endpoint
    if (req.authUser.usertype === 'admin') {
      return res.status(403).json({ success: false, message: 'This action is not available to administrator accounts.' });
    }

    // Ownership check: customers can only view their own orders
    if (req.authUser.id !== req.params.customerId) {
      return res.status(403).json({ success: false, message: 'You do not have permission to view these orders.' });
    }

    const orders = await Purchase.find({ customerId: req.params.customerId }).sort({ purchaseDate: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid customer ID format' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: View all customer purchases and purchase details
app.get('/api/admin/purchases', authenticate, requireAdmin, async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ purchaseDate: -1 });
    res.json({ success: true, purchases });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------------------------------------------
// CUSTOMER REVIEWS ROUTES
// ----------------------------------------------------

// Get all reviews for homepage (public)
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Check if customer is eligible to review (has placed any order) — authenticated, admin blocked
app.get('/api/reviews/check-purchased/:customerId', authenticate, async (req, res) => {
  try {
    if (req.authUser.usertype === 'admin') {
      return res.status(403).json({ success: false, message: 'This action is not available to administrator accounts.' });
    }

    // Ownership check: only check your own eligibility
    if (req.authUser.id !== req.params.customerId) {
      return res.status(403).json({ success: false, message: 'You do not have permission to access this information.' });
    }

    const orderCount = await Purchase.countDocuments({ customerId: req.params.customerId });
    res.json({ success: true, hasPurchased: orderCount > 0 });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid customer ID format' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// Submit a review — customer only
app.post('/api/reviews', authenticate, requireCustomer, async (req, res) => {
  try {
    const { customerId, customerName, customerLocation, rating, reviewText, plantName, plantId } = req.body;
    if (!customerId || !reviewText || !rating) {
      return res.status(400).json({ success: false, message: 'Rating, review text, and customer ID are required' });
    }

    // Ownership check: can only submit reviews as yourself
    if (req.authUser.id !== customerId) {
      return res.status(403).json({ success: false, message: 'You can only submit reviews for your own account.' });
    }

    const newReview = await Review.create({
      customerId,
      customerName: customerName || 'Verified Buyer',
      customerLocation: customerLocation || 'Plant Enthusiast',
      rating: Number(rating),
      reviewText,
      plantName: plantName || 'Bloomora Plants',
      plantId: plantId || null
    });

    res.status(201).json({ success: true, message: 'Review submitted successfully', review: newReview });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Customer: Delete their own review — ownership enforced
app.delete('/api/reviews/:id', authenticate, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    // Ownership check: customers can only delete their own reviews; admins cannot delete reviews
    if (req.authUser.usertype === 'customer' && req.authUser.id !== review.customerId.toString()) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this review.' });
    }

    // Admins should not be able to delete customer reviews through this endpoint
    if (req.authUser.usertype === 'admin') {
      return res.status(403).json({ success: false, message: 'This action is not available to administrator accounts.' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------------------------------------------
// CONTACT MESSAGES ROUTES
// ----------------------------------------------------

// Public & Customer: Submit a contact message
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message, customerId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    let validCustomerId = null;
    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      validCustomerId = customerId;
    }

    const newContactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: (subject || '').trim() || 'General Inquiry',
      message: message.trim(),
      customerId: validCustomerId,
      status: 'New'
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully! Our botanical team will contact you shortly.',
      contactMessage: newContactMessage
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: View all contact messages (newest first)
app.get('/api/contact', authenticate, requireAdmin, async (req, res) => {
  try {
    const messages = await ContactMessage.find()
      .populate('customerId', 'name email username phoneNumber')
      .sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: View specific contact message details
app.get('/api/contact/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid message ID format' });
    }
    const message = await ContactMessage.findById(req.params.id)
      .populate('customerId', 'name email username phoneNumber');

    if (!message) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }

    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Update contact message status (New, Read, Reviewed)
app.patch('/api/contact/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid message ID format' });
    }
    const { status } = req.body;
    const allowedStatuses = ['New', 'Read', 'Reviewed'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const updatedMessage = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }

    res.json({
      success: true,
      message: `Message status updated to ${status}`,
      contactMessage: updatedMessage
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Delete contact message
app.delete('/api/contact/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid message ID format' });
    }
    const deleted = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }
    res.json({ success: true, message: 'Contact message deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Root health check
app.get('/', (req, res) => {
  res.send('Bloomora Plant Nursery Backend API running on port 5000');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Bloomora server running on port ${PORT}`);
});