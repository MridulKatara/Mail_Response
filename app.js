require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser'); // Import body-parser
const gmailController = require('./controllers/gmailController');
const outlookController = require('./controllers/outlookController');
const openAIController = require('./controllers/openAIController'); // Import the OpenAI controller
const app = express();


// Connect to MongoDB
mongoose.connect(process.env.MONGO_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const sessionsecret = process.env.SESSION_SECRET;
// Configure express-session for managing sessions
app.use(session({
  secret: sessionsecret, // Use a secure, unique, and long secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true } // For development, in production set secure: true for HTTPS
}));

// Use body-parser middleware to parse JSON request bodies
app.use(bodyParser.json());

// Basic Route Setup
app.get('/', (req, res) => {
  res.send('Welcome to the Email Automation Tool');
});

// Integrating Gmail OAuth Flow
app.get('/auth/gmail', gmailController.redirectToGoogleOAuth);

// Handling Gmail OAuth Callback
app.get('/oauth2callback', gmailController.handleOAuthCallback);

// Integrating Outlook OAuth Flow
app.get('/auth/outlook', outlookController.redirectToMicrosoftOAuth);

// Handling Outlook OAuth Callback
app.get('/outlook/oauth2callback', outlookController.handleOAuthCallback);

// Route for processing emails and sending responses
app.post('/process-emails', openAIController.processEmail); // Add this route

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
