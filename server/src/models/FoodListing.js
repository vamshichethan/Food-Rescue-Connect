const mongoose = require('mongoose');

const FoodListingSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a food title'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Please add a quantity in kilograms'],
    min: [0.1, 'Quantity must be greater than 0 kg'],
  },
  packaging: {
    type: String,
    required: [true, 'Please specify the packaging type (e.g. Boxes, Tupperware, Sealed Bags)'],
    trim: true,
  },
  expiryTime: {
    type: Date,
    required: [true, 'Please specify the expiry date and time'],
  },
  address: {
    type: String,
    required: [true, 'Please provide the pickup address'],
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  status: {
    type: String,
    enum: ['available', 'claimed', 'picked_up', 'delivered', 'expired'],
    default: 'available',
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  spoilageRisk: {
    type: Number, // Percentage 0 - 100
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for Geospatial search
FoodListingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('FoodListing', FoodListingSchema);
