// outlookController.js
const axios = require('axios');
const qs = require('qs');

const CLIENT_ID = process.env.OUTLOOK_CLIENT_ID;
const REDIRECT_URI = process.env.OUTLOOK_REDIRECT_URI;
const TENANT_ID = process.env.OUTLOOK_TENANT_ID || 'common'; // 'common' can be used for multi-tenant apps

const redirectToMicrosoftOAuth = (req, res) => {
  const authUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?` + qs.stringify({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: 'openid email Mail.Read',
    response_mode: 'query',
    state: '12345', // should be a random or encoded string for security purposes
  });
  console.log(`Client Secret: ${process.env.AZURE_SECRET_ID}`); // Debug log

  res.redirect(authUrl);
};

const handleOAuthCallback = async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send('Code is missing');
  }

  try {
    const tokenResponse = await axios.post(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, qs.stringify({
      client_id: CLIENT_ID,
      scope: 'openid email Mail.Read',
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
      client_secret: process.env.AZURE_SECRET_ID,
    }), {

      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = tokenResponse.data.access_token;
    // Here you can store the accessToken in your database and use it to make Microsoft Graph API calls

    res.send('OAuth callback received. Access token obtained.');
  } catch (error) {
    console.error('Error obtaining access token:', error.response ? error.response.data : error.message);
    res.status(500).send('Error detail: ' + error.response.data.error_description);
  }
};

module.exports = { redirectToMicrosoftOAuth, handleOAuthCallback };
