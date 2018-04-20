import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import flash from 'connect-flash';
import bodyParser from 'body-parser';
import session from 'express-session';
import exphbs from 'express-handlebars';
import methodOverride from 'method-override';

import passport from './config/passport';
import database from './config/database';
import ideasRouter from './routes/ideas';
import usersRouter from './routes/users';

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(database.mongoURI)
  .then(() => console.log('MongoDB connected...')) // eslint-disable-line
  .catch(err => console.log(err)); // eslint-disable-line

// Handlebars Middleware
app.engine('handlebars', exphbs({
  partialsDir: path.join(__dirname, 'views/partials/'),
  layoutsDir: path.join(__dirname, 'views/layouts/'),
  defaultLayout: 'main',
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Method Override middleware
app.use(methodOverride('_method'));

// Session midleware
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));
app.use(flash());

// Passport midleware
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Index Route
app.get('/', (req, res) => {
  const title = 'Welcome!';
  res.render('index', { title });
});

// About Route
app.get('/about', (req, res) => {
  res.render('about');
});

// User Routes
app.use('/ideas', ideasRouter);
app.use('/users', usersRouter);

app.listen(port, () => {
  console.log(`Server started on port ${port}`); // eslint-disable-line
});
