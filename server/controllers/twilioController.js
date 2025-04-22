import Twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

// Initialize Twilio client using environment variables
const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const generateToken = (req, res) => {
  const { roomId, userId } = req.body;

  if (!roomId || !userId) {
    return res.status(400).json({ message: "Missing roomId or userId" });
  }

  const AccessToken = Twilio.jwt.AccessToken;
  const VideoGrant = AccessToken.VideoGrant;

  // Create a new token instance
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY_SID,
    process.env.TWILIO_API_KEY_SECRET,
    { identity: userId }
  );

  const videoGrant = new VideoGrant({ room: roomId });
  token.addGrant(videoGrant);

  res.send({
    token: token.toJwt(),
  });
};
