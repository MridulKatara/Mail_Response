const axios = require('axios');
const querystring = require('querystring');
require('dotenv').config();

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REDIRECT_URI = process.env.GMAIL_REDIRECT_URI;

const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
const googleTokenUrl = 'https://oauth2.googleapis.com/token';

// Redirect user to Google's OAuth 2.0 server
exports.redirectToGoogleOAuth = (req, res) => {
    const authUrl = `${googleAuthUrl}?${querystring.stringify({
        client_id: GMAIL_CLIENT_ID,
        redirect_uri: GMAIL_REDIRECT_URI,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
        access_type: 'offline',
        prompt: 'consent',
    })}`;
    res.redirect(authUrl);
};

// Handle OAuth 2.0 server response
exports.handleOAuthCallback = async (req, res) => {
    const { code } = req.query;

    try {
        const { data } = await axios.post(googleTokenUrl, querystring.stringify({
            code,
            client_id: GMAIL_CLIENT_ID,
            client_secret: GMAIL_CLIENT_SECRET,
            redirect_uri: GMAIL_REDIRECT_URI,
            grant_type: 'authorization_code',
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        // Here, you would typically store the access token and refresh token in a database.
        // For the purpose of this example, we're just logging it to the console.
        console.log('Access Token:', data.access_token);
        console.log('Refresh Token:', data.refresh_token);

        res.send('OAuth callback received. Check server logs for tokens.');
    } catch (error) {
        console.error('Error exchanging code for tokens', error);
        res.status(500).send('Authentication failed');
    }
};
