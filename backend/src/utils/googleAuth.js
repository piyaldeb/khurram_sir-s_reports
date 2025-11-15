const { google } = require('googleapis');

let authClient = null;

function getGoogleAuth() {
  if (authClient) {
    return authClient;
  }

  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    authClient = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/spreadsheets.readonly'
      ]
    });

    return authClient;
  } catch (error) {
    console.error('Error initializing Google Auth:', error);
    throw new Error('Failed to initialize Google authentication');
  }
}

module.exports = { getGoogleAuth };
