const catchAsync = fn => {
  // arrow function with fn, a function as parameter
  return (req, res, next) => {
    fn(req, res, next).catch(err => next(err));
  };
};

module.exports = catchAsync;
