import express, { static as expressStatic, urlencoded, json } from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';


import "./src/v1/api/config/gmailpassport.js"
import  passport  from 'passport';
import session from 'express-session';




import { notFoundMiddleware } from "./src/v1/api/middleware/notfoundmiddleware.js"
import { logger } from './src/v1/api/middleware/logger.js';
import Routerlocation from './src/v1/api/index.js';
import linkedInRoutes from "./src/v1/api/routes/OAuthRoutes/linkedIn.routes.js"
// import passport from "./src/v1/api/controllers/OAuthController/googleController.js"
// import google from "./src/v1/api/routes/OAuthRoutes/google.routes.js"
import addCategories from "./src/v1/api/script/expense/category.script.js"
import addExpenses from "./src/v1/api/script/expense/expenseType.script.js"
// import {expirePlansScheduler} from "./src/v1/api/controllers/PlanController/planController.js"

//Gmail routes
import authRoutes from "./src/v1/api/routes/GmailRoute/auth.routes.js"





import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { signDocumentWithSignzy } from './src/v1/api/Utils/esignApi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname + __filename);

const app = express();

// CORS setup
app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Compression and logging
app.use(compression());
app.use(morgan('dev'));
app.use(logger);
// Built-in parsers
// app.use(urlencoded({ extended: false }));
// app.use(json());


app.use(urlencoded({ extended: true, limit: '50mb' }));
app.use(json({ limit: '50mb' }));
// app.use(passport.initialize());


app.use('/static', expressStatic(path.join(__dirname, 'uploads')));
console.log(path.join(__dirname, 'uploads'));

//run expense script
// addCategories("682ec16251419a8ec3508599")
// addExpenses("682ec16251419a8ec3508599")

// Root route check
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running!' });
});

// Serve static files


// expirePlansScheduler(); // Start the scheduler for plan expiration

// LiknedIn Routes

app.use("/api/auth" , linkedInRoutes)
// app.use("/api/googleAuth" , google)
// signDocumentWithSignzy()


// app.use("/api/google" , google)

// >>>>>>>>>>

// mail send setup 


// Gmail Sending
// Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Session (required for passport to work with Google OAuth)
app.use(session({
  secret: 'some-secret',
  resave: false,
  saveUninitialized: false,
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use("/v1/api",authRoutes)


// >>>>>>>>>

// API Routes
app.use('/v1/api', Routerlocation);

// Handle 404 for all unmatched API routes
app.all('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' , status: 404 });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

export default app;
