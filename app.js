const path = require('path');
const keys = require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const cors = require('cors');
const corsOptions = {
  origin: "dparki2-cse341ecommerce.herokuapp.com/",
  optionsSuccessStatus: 200
};

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URL = process.env.MONGODB_URL;

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URL,
  collection: 'sessions'
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  //userCreateIndex: true,
  //useFindAndModify: false,
  family: 4
};



app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({ 
    secret: 'donttellitto anyone',
    resave: false,
    saveUninitialized: false,
    store: store  
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(async (req, res, next) => {
  try{
    if (!req.session.user) {
      return next();
    }
    const user = await User.findById(req.session.user._id);
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    next(new Error(err));
  }
 });
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(cors(corsOptions));

app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});

async function init() {
  try {
    await mongoose.connect(MONGODB_URL);

    app.listen(process.env.PORT || 3000);
  } catch (err) {
    console.log(err);
  }
}

init();

