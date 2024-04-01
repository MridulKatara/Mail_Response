require('dotenv').config();
const nodemailer = require('nodemailer');
const axios = require('axios');

// Configure the nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'asinha27072002@gmail.com', // Your Gmail address
    pass: process.env.APP_SPECIFIC_PASS // Your app-specific password
  }
});

// Function to generate email replies using the Gemini model
async function generateReply(emailContent) {
  try {
    const response = await axios.post('https://api.openai.com/v1/generateContent', { // Assumed Gemini API endpoint
      model: "models/gemini-1.5-pro-latest",
      prompt: `Generate a polite reply to the following email:\n\n${emailContent}`,
      temperature: 0.7,
      max_tokens: 150,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Your OpenAI API key
      }
    });
    return response.data.choices[0].text.trim(); // Assuming the response structure has a choices array
  } catch (error) {
    console.error('Error generating reply with Gemini API:', error);
    throw error;
  }
}
// Controller action to process an incoming email and send a reply
exports.processEmail = async (req, res) => {
  const { emailContent, recipient } = req.body; // Extract email content and recipient from the request body

  try {
    const reply = await generateReply(emailContent); // Generate a reply for the email content

    // Define the email to be sent
    const mailOptions = {
      from: 'asinha27072002@gmail.com', // Sender email address
      to: recipient, // Recipient email address
      subject: 'Re: Your Email', // Subject of the reply email
      text: reply // Generated reply as the email body
    };

    // Use nodemailer to send the email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        res.status(500).send('Failed to send email reply');
      } else {
        console.log('Email sent: ' + info.response);
        res.send('Email reply sent successfully');
      }
    });
  } catch (error) {
    console.error('Failed to process email:', error);
    res.status(500).send('Failed to process email');
  }
};