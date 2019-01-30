const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 1024
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now()
  }
});

UserSchema.methods.generateAuthToken = function() {
  const payload = {
    id: this.id,
    name: this.name,
    avatar: this.avatar
  };
  const token = jwt.sign(payload, keys.jwtSecret, { expiresIn: 86400 });
  return token;
};

const User = mongoose.model('users', UserSchema);

module.exports = User;
