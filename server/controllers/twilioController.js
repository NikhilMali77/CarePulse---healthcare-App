import Twilio from "twilio";
// Initialize Twilio client
const twilioClient = new Twilio('AC1e2bba4c3267193c964ac28ee8634aad', '5c9878aeac5dd872b731ad7c7ce21063');

export const generateToken = (req, res) => {
  const { roomId, userId } = req.body;

  // Create an access token
  const AccessToken = Twilio.jwt.AccessToken;
  const VideoGrant = AccessToken.VideoGrant;

  // Create a new token instance
  const token = new AccessToken(
    'AC1e2bba4c3267193c964ac28ee8634aad',
    'SKdb3f5d573be75986f58f3510f21ce84d',
    'u5TgT74Cr7rP6CYthfKMyd5mbINZmuKK',
    {
      identity: userId,
    }
  );

  const videoGrant = new VideoGrant({
    room: roomId,
  });
  token.addGrant(videoGrant);

  res.send({
    token: token.toJwt(),
  });
};
