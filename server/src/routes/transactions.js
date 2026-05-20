const express = require('express');
const Transaction = require('../models/Transaction');
const FoodListing = require('../models/FoodListing');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all transactions for user
// @route   GET /api/transactions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const filters = {};

    if (req.user.role === 'donor') {
      filters.donor = req.user._id;
    } else if (req.user.role === 'ngo') {
      filters.receiver = req.user._id;
    } else if (req.user.role === 'volunteer') {
      filters.volunteer = req.user._id;
    }

    const transactions = await Transaction.find(filters)
      .populate('foodListing', 'title quantity packaging expiryTime address status')
      .populate('donor', 'name organization phone address')
      .populate('receiver', 'name organization phone address')
      .populate('volunteer', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Get cumulative environmental & societal impact stats
// @route   GET /api/transactions/impact
// @access  Private
router.get('/impact', protect, async (req, res) => {
  try {
    const query = {};

    // Filter by role if requested
    if (req.user.role === 'donor') {
      query.donor = req.user._id;
    } else if (req.user.role === 'ngo') {
      query.receiver = req.user._id;
    } else if (req.user.role === 'volunteer') {
      query.volunteer = req.user._id;
    }

    const stats = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalCo2Saved: { $sum: '$co2Saved' },
          totalMealsReallocated: { $sum: '$mealsReallocated' },
          totalDeliveries: {
            $sum: { $cond: [{ $ifNull: ['$deliveredAt', false] }, 1, 0] },
          },
          totalClaimed: { $sum: 1 },
        },
      },
    ]);

    const impact = stats[0] || {
      totalCo2Saved: 0,
      totalMealsReallocated: 0,
      totalDeliveries: 0,
      totalClaimed: 0,
    };

    res.status(200).json({
      success: true,
      impact: {
        co2SavedKg: Math.round(impact.totalCo2Saved * 10) / 10,
        mealsServed: Math.round(impact.totalMealsReallocated),
        deliveriesCompleted: impact.totalDeliveries,
        activeRescues: impact.totalClaimed,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
