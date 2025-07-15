const Home = require("../models/home");
const User = require("../models/user");
const Booking = require("../models/booking");

exports.getIndex = (req, res, next) => {
  console.log("Session Value: ", req.session);
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
      isLoggedIn: req.isLoggedIn, 
      user: req.session.user,
    });
  });
};

exports.getHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn, 
      user: req.session.user,
    });
  });
};

exports.getBookings = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login'); // or show an error
    }

    // Step 2: Fetch bookings from DB for the logged-in user
    const bookings = await Booking.find({ user: req.session.user._id }).populate('homeId');

    // Step 3: Render with fetched bookings
    res.render("store/bookings", {
      pageTitle: "My Bookings",
      bookings: bookings,
      currentPage: "bookings",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).send("Internal Server Error");
  }
};
exports.postBookHome = async (req, res, next) => {
  try {
    const homeId = req.body.homeId;
    const userId = req.session.user._id;
    const date = new Date(req.body.date);
    const guests = req.body.guests || 1;

    const home = await Home.findById(homeId);
    if (!home) {
      return res.status(404).send("Home not found");
    }

    const booking = new Booking({
      homeId: home._id,
      user: userId,
      date: date,
      guests: guests,
      bookingName: req.body.bookingName,
      bookingAge: req.body.bookingAge,
      paymentMethod: req.body.paymentMethod,
      totalPayment: home.price * guests
    });

    await booking.save();
    res.redirect("/bookings");
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getFavouriteList = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate('favourites');
  res.render("store/favourite-list", {
    favouriteHomes: user.favourites,
    pageTitle: "My Favourites",
    currentPage: "favourites",
    isLoggedIn: req.isLoggedIn, 
    user: req.session.user,
  });
};

exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.id;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (!user.favourites.includes(homeId)) {
    user.favourites.push(homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.postRemoveFromFavourite = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (user.favourites.includes(homeId)) {
    user.favourites = user.favourites.filter(fav => fav != homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.getHomeDetails = async (req, res, next) => {
  const homeId = req.params.homeId;
  const home = await Home.findById(homeId);

  if (!home) {
    console.log("Home not found");
    return res.redirect("/homes");
  }

  // Default: available
  let isAvailable = true;

  // Agar query me date hai toh us date ke liye check karo
  let selectedDate = req.query.date;
  if (selectedDate) {
    const existingBooking = await Booking.findOne({
      homeId: home._id,
      date: new Date(selectedDate)
    });
    isAvailable = !existingBooking;
  }

  res.render("store/home-detail", {
    home: home,
    pageTitle: "Home Detail",
    currentPage: "Home",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
    isAvailable
  });
};