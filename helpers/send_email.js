const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
require("dotenv").config();

const client = new SESClient({
 region: process.env.AWS_REGION,
 credentials:{
     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
 }
  
  
});

const generateWelcomeEmail = () => {
  return `
    <h1>Welcome to Ecomly!</h1>
    <p>Thank you for signing up for Ecomly. We're excited to have you on board!</p>
    <p>Explore our platform and start your shopping journey with us.</p>
    <p>Best regards,<br/>The Ecomly Team</p>
    `;
};

const sendWelcomeEmail = async (email) => {
  const params = {
    Source: process.env.EMAIL_FROM,
    ReplyToAddresses: [process.env.EMAIL_FROM],
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: generateWelcomeEmail(),
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Welcome to Ecomly!",
      },
    },
  };

  const command = new SendEmailCommand(params);
  try {
    const data = await client.send(command);
    return data;
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

module.exports = sendWelcomeEmail;
