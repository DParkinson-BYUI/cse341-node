const path = require('path');
const keys = require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const cors = require('cors');
const corsOptions = {
  origin: "dparki2-cse341ecommerce.herokuapp.com/",
  optionsSuccessStatus: 200
};

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');


// const optons = {
//   useUnifiedTopology: true,
//   useNewUrlParser: true,
//   userCreateIndex: true,
//   useFindAndModify: false,
//   family: 4
// };

const MONGODB_URL = process.env.MONGODB_URL;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
  try{
    const user = await User.findById('6160a8c1d4db714ef99ae0bf');
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
  }
 });

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(cors(corsOptions));

app.use(errorController.get404);

async function init() {
  try {
    await mongoose.connect(MONGODB_URL);
    const user = await User.findOne();
    if (!user) {
      const user = new User({
        name: 'Drew',
        email: 'dparki2@yahoo.com',
        cart: {
          items: [],
        },
      });
      await user.save();
    }
    app.listen(process.env.PORT || 3000);
  } catch (err) {
    console.log(err);
  }
}

init();

