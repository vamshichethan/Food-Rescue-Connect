const express = require('express');
const FoodListing = require('../models/FoodListing');
const Transaction = require('../models/Transaction');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Helper to query Spoilage Risk from Python FastAPI microservice
const predictSpoilageRisk = async (expiryTime, quantity, distance = 5) => {
  try {
    const hoursRemaining = Math.max(0.1, (new Date(expiryTime) - new Date()) / (1000 * 60 * 60));
    
    // Call FastAPI service
    const response = await fetch(`${process.env.FASTAPI_SERVICE_URL || 'http://localhost:8000'}/predict-risk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hours_remaining: hoursRemaining,
        quantity_kg: quantity,
        distance_km: distance,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.spoilage_risk_percentage || 20;
    }
  } catch (error) {
    console.warn(`📡 ML Microservice offline, using local risk fallback: ${error.message}`);
  }

  // Fallback heuristic: risk increases as hoursRemaining decreases
  const hoursRemaining = Math.max(0.1, (new Date(expiryTime) - new Date()) / (1000 * 60 * 60));
  if (hoursRemaining < 2) return 90;
  if (hoursRemaining < 6) return 65;
  if (hoursRemaining < 12) return 40;
  return 15;
};

// @desc    Create new food listing
// @route   POST /api/food
// @access  Private (Donor, Admin)
router.post('/', protect, authorize('donor', 'admin'), async (req, res) => {
  try {
    const { title, description, quantity, packaging, expiryTime, address, coordinates } = req.body;

    if (!title || !quantity || !packaging || !expiryTime || !address || !coordinates) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    // Call ML service to estimate risk
    const spoilageRisk = await predictSpoilageRisk(expiryTime, quantity);

    const listing = await FoodListing.create({
      donor: req.user._id,
      title,
      description,
      quantity,
      packaging,
      expiryTime,
      address,
      location: {
        type: 'Point',
        coordinates, // [longitude, latitude]
      },
      spoilageRisk,
    });

    // Notify nearby NGOs via WebSocket (implemented in index.js)
    if (req.io) {
      req.io.emit('new_listing', {
        id: listing._id,
        title: listing.title,
        quantity: listing.quantity,
        spoilageRisk: listing.spoilageRisk,
        coordinates: listing.location.coordinates,
      });
    }

    res.status(201).json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Get all listings
// @route   GET /api/food
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const filters = {};

    // Filter by status if provided
    if (req.query.status) {
      filters.status = req.query.status;
    }

    // Donors see their own, volunteers & NGOs see available or claimed ones
    if (req.user.role === 'donor') {
      filters.donor = req.user._id;
    } else if (req.user.role === 'ngo') {
      // NGOs see available listings or listings they claimed
      filters.$or = [{ status: 'available' }, { receiver: req.user._id }];
    } else if (req.user.role === 'volunteer') {
      // Volunteers see available listings or listings they are assigned to
      filters.$or = [
        { status: 'available' },
        { volunteer: req.user._id },
        { status: 'claimed' },
      ];
    }

    const listings = await FoodListing.find(filters)
      .populate('donor', 'name organization phone email')
      .populate('receiver', 'name organization phone address')
      .populate('volunteer', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: listings.length, listings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Get nearby available listings
// @route   GET /api/food/nearby
// @access  Private
router.get('/nearby', protect, async (req, res) => {
  try {
    const { longitude, latitude, radius = 10 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ success: false, error: 'Please specify latitude and longitude' });
    }

    // Convert radius from km to radians (Earth radius is ~6378.1 km)
    const radiusInRadians = parseFloat(radius) / 6378.1;

    const listings = await FoodListing.find({
      status: 'available',
      location: {
        $geoWithin: {
          $centerSphere: [[parseFloat(longitude), parseFloat(latitude)], radiusInRadians],
        },
      },
    }).populate('donor', 'name organization phone email');

    res.status(200).json({ success: true, count: listings.length, listings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Claim food listing
// @route   PUT /api/food/:id/claim
// @access  Private (NGO, Volunteer, Admin)
router.put('/:id/claim', protect, authorize('ngo', 'volunteer', 'admin'), async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Food listing not found' });
    }

    if (listing.status !== 'available') {
      return res.status(400).json({ success: false, error: 'Food listing already claimed or completed' });
    }

    if (req.user.role === 'ngo') {
      listing.receiver = req.user._id;
      listing.status = 'claimed';
    } else if (req.user.role === 'volunteer') {
      listing.volunteer = req.user._id;
    }

    await listing.save();

    // Create a transaction log
    if (listing.status === 'claimed' && listing.receiver) {
      const co2Saved = listing.quantity * 2.5; // Heuristic: 1kg food saved = 2.5kg CO2 offset
      const mealsReallocated = Math.round((listing.quantity / 0.45) * 10) / 10; // 0.45kg = 1 meal

      await Transaction.create({
        foodListing: listing._id,
        donor: listing.donor,
        receiver: listing.receiver,
        volunteer: listing.volunteer || null,
        claimedAt: new Date(),
        co2Saved,
        mealsReallocated,
      });
    }

    // Send real-time updates through Socket.io
    if (req.io) {
      req.io.emit('listing_updated', {
        id: listing._id,
        status: listing.status,
        receiver: listing.receiver,
        volunteer: listing.volunteer,
      });
    }

    res.status(200).json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Update food listing status
// @route   PUT /api/food/:id/status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const listing = await FoodListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Food listing not found' });
    }

    // Validate role permissions
    if (
      req.user.role === 'volunteer' &&
      listing.volunteer &&
      listing.volunteer.toString() !== req.user._id.toString()
    ) {
      // Assign the volunteer if they want to claim delivery
      if (status === 'picked_up') {
        listing.volunteer = req.user._id;
      } else {
        return res.status(403).json({ success: false, error: 'You are not the designated volunteer for this listing' });
      }
    }

    listing.status = status;
    if (status === 'picked_up') {
      if (!listing.volunteer) {
        listing.volunteer = req.user._id;
      }
      
      // Update transaction
      await Transaction.findOneAndUpdate(
        { foodListing: listing._id },
        { pickedUpAt: new Date(), volunteer: listing.volunteer }
      );
    } else if (status === 'delivered') {
      // Update transaction
      await Transaction.findOneAndUpdate(
        { foodListing: listing._id },
        { deliveredAt: new Date() }
      );
    }

    await listing.save();

    // Trigger Socket notification
    if (req.io) {
      req.io.emit('listing_updated', {
        id: listing._id,
        status: listing.status,
        volunteer: listing.volunteer,
      });
    }

    res.status(200).json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
