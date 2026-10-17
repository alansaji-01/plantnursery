const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  plantName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  image: { type: String, default: '' }
}, { _id: false });

const purchaseSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String },
  customerPhone: { type: String },
  shippingAddress: { type: String, required: true },
  // Single-item fields as specified in requirements:
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant' },
  quantity: { type: Number, default: 1 },
  price: { type: Number },
  totalAmount: { type: Number, required: true },
  // Supports multi-item cart purchases as well:
  items: [orderItemSchema],
  status: { type: String, default: 'Confirmed' },
  paymentMethod: { type: String, default: 'Cash on Delivery (Pay upon Receipt)' },
  purchaseDate: { type: Date, default: Date.now }
}, { timestamps: true });

const Purchase = mongoose.model('Purchase', purchaseSchema);
module.exports = Purchase;