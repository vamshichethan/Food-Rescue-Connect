const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  foodListing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodListing',
    required: true,
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  claimedAt: {
    type: Date,
  },
  pickedUpAt: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
  co2Saved: {
    type: Number, // calculated as quantity * 2.5 kg CO2 per kg food saved
    default: 0,
  },
  mealsReallocated: {
    type: Number, // quantity / 0.45 meals
    default: 0,
  },
  rating: {
    type: Number, // optional rating by receiver
    min: 1,
    max: 5,
  },
  feedback: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
