const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  usertype: { type: String, default: 'customer' } // 'customer' or 'admin'
}, { timestamps: true });

const Login = mongoose.model('Login', loginSchema);
module.exports = Login;