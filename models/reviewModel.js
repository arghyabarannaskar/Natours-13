// review / rating / createdAt / ref to tour / ref to user

const mongoose = require('mongoose');
const tourModel = require('../models/tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review must have content']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Review must have a rating']
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index(
  { tour: 1, user: 1 },
  {
    unique: true
  }
);

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  //   this.populate({
  //     path: 'tour',
  //     select: 'name'
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo'
  //   });

  next();
});

reviewSchema.statics.calcAverageRating = async function(tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nReviews: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  console.log(stats);

  await tourModel.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nReviews || 0,
    ratingsAverage: stats[0].avgRating || 0
  });
};

// Calculating avg rating after a new review is posted on a tour
reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.tour);
});

// Calculating avg rating after a review is updated or Deleted

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  console.log(this.r);
  next();
});
reviewSchema.post(/^findOneAnd/, async function(next) {
  await this.r.constructor.calcAverageRating(this.r.tour);
});

module.exports = mongoose.model('Review', reviewSchema);
