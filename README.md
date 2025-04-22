# Healthcare Application

A MERN stack-based healthcare application that allows users to book appointments, manage profiles, and interact with doctors. It includes Google OAuth for authentication and role-based access control for users and admins. Additionally, it provides features for doctor profile management and admin dashboard for managing appointments.

## Features

- **User Authentication**: Sign in using Google OAuth.
- **Admin Dashboard**: Admins can manage users and doctors, view appointments, and assign roles.
- **Doctor Management**: Doctors can create profiles, view appointments, and manage patient consultations.
- **Appointment Scheduling**: Users can schedule appointments with doctors, and admins can approve or cancel them.
- **File Upload**: Supports profile picture and identity proof uploads via Cloudinary.
- **SMS Notifications**: Alerts sent to admins and users for appointment statuses via Twilio.
- **Error Tracking**: Integrated with Sentry for error tracking and performance monitoring.

## Technologies Used

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js with Google OAuth 2.0
- **File Upload**: Cloudinary for media storage
- **SMS Notifications**: Twilio for SMS functionality
- **Error Tracking**: Sentry for application monitoring
- **Environment Management**: dotenv for managing environment variables

## Setup

### Prerequisites

Ensure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (local or remote, e.g., Atlas)
- Google Cloud Console account for OAuth credentials
- Twilio account (optional)
- Cloudinary account (optional)
- Sentry account (optional)

### Environment Variables

Create a `.env` file at the root of your project and add the following variables:

```bash
STRIPE_SECRET_KEY=sk_test_51R7r1oKPsi69BnCcRWdYuKtXWm4BCwQNvM7GwAaIZaaddbZxf3QmK995702CY8f38vgCx6r1QhUR2Io53zmx7dy300SzsiThsV
STRIPE_WEBHOOK_SECRET=whsec_fdf95c471206c39ea27fb5e4c758dc03139644ed3c01b62ed528ac00db2b4a95
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
GOOGLE_ROLE=admin
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
PORT=5000
MONGO_URI=mongodb://localhost:27017/your-database
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
SESSION_KEY=connect.sid
EMAIL_SERVICE=your-email-service
EMAIL_USER=your-email-username
EMAIL_PASS=your-email-password
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

### Install Dependencies

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/healthcare-application.git
   cd healthcare-application
   ```

2. Install backend dependencies:

   ```bash
   npm install
   ```

3. Install frontend dependencies (if using a separate frontend):

   ```bash
   cd client
   npm install
   ```

### Running the Application

1. Start the backend:

   ```bash
   npm run dev
   ```

   The server will be running on `http://localhost:5000`.

2. Start the frontend (if it's in a separate `client` directory):

   ```bash
   cd client
   npm start
   ```

   The frontend will be running on `http://localhost:5173`.

3. Access the app on your browser:

   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

### Testing Google OAuth

1. Visit `http://localhost:5000/auth/google` to authenticate via Google.
2. Redirect will occur to your callback URL where your app handles the authentication.

## File Structure

```
/healthcare-application
│
├── /client                  # React frontend
│   ├── /src
│   ├── /public
│   └── ...
│
├── /models                  # Mongoose models (User, Admin, Appointment, etc.)
├── /routes                  # Express routes (auth, users, admins, etc.)
├── /controllers             # Controllers for handling logic
├── /utils                   # Utility functions (e.g., email notifications, etc.)
├── /config                  # Configuration files (e.g., database, passport.js)
├── /middleware              # Middleware functions (e.g., authentication)
├── /public                  # Static files
├── server.js                # Main entry point for the backend
├── .env                     # Environment variables
└── README.md                # Project documentation
```

## Admin Dashboard

Admins can access their dashboard at the following URL after signing in via Google:

- **Admin URL**: `http://localhost:5000/admin`

## Error Handling

The app uses **Sentry** for error tracking and performance monitoring. If there are issues in the app, they will be logged and monitored on your Sentry dashboard.

## SMS Notifications

If you're using **Twilio** for SMS functionality, make sure to configure the Twilio settings in the `.env` file. The app will send SMS notifications to both users and admins for appointment updates.

## Contributing

We welcome contributions to improve the healthcare application! If you find any bugs or want to suggest new features, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Create a new pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
