const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  plantName: { type: String, required: true },
  botanicalName: { type: String, default: '' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  categoryName: { type: String, default: 'General' },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  stock: { type: Number, required: true, default: 0 },
  image: { type: String, default: '/images/plant-monstera.jpg' },
  badge: { type: String, default: '' },
  status: { type: String, enum: ['Available', 'Out of Stock'], default: 'Available' }
}, { timestamps: true });

const Plant = mongoose.model('Plant', plantSchema);
module.exports = Plant;