import { useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import HomePage from '../HomePage/HomePage';
import SignUp from '../SignUp/SignUp';
import CompleteProfile from '../CompleteProfile/CompleteProfile';
import UserDetails from '../UserDetails/UserDetails';
import AppointmentForm from '../AppointmentForm/AppointmentForm';
import AdminDetails from '../AdminDetails/AdminDetails';
import DoctorDetails from '../DoctorDetails/DoctorDetails';
import AdminDashboard from '../AdminDashboard/AdminDashboard';
import { useAuth } from '../../AuthContext';
import UserOptions from '../UserOptions/UserOptions';
import ChatWithDoctor from '../ChatWithDoctor/ChatWithDoctor';
import VideoRoom from '../ChatWithDoctor/VideoRoom';
import { VideoRoomProvider } from '../ChatWithDoctor/VideoRoomContext';
import DoctorDashboard from '../DoctorDashboard/DoctorDashboard';
import ChatWithPatient from '../ChatWithDoctor/ChatWithPatient';
import AddBlog from '../Blog/AddBlog/AddBlog';
import ViewBlogs from '../Blog/ViewBlogs/ViewBlogs';
import BlogPost from '../Blog/BlogPost/BlogPost'
import SymptomChecker from '../../SymptomChecker/SymptomChecker';
import PaymentGateway from '../PaymentGateway/PaymentGateway';
import PaymentSuccess from '../PaymentSucces/PaymentSuccess';
import EditBlog from '../Blog/EditBLog/EditBlog';

const HomePageContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { doctor } = useAuth(); // Get doctor data from auth context
  const [userData, setUserData] = useState(null);
  const [doctorData, setDoctorData] = useState(null); // State for doctor data

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userToken = localStorage.getItem('userToken');
        const doctorToken = localStorage.getItem('doctorToken');
        let response;

        // Check user authentication
        if (userToken) {
          response = await fetch('http://localhost:5000/check', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${userToken}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include', // This is necessary for sending cookies
          });
        } else {
          response = await fetch('http://localhost:5000/check', {
            credentials: 'include', // This will send the session cookie
          });
        }

        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
          setIsAuthenticated(true);
        } else {
          const errorData = await response.json();
          console.error('Auth check failed:', errorData.message);
          setIsAuthenticated(false);
        }

        // Check doctor authentication if applicable
        if (doctorToken) {
          const doctorResponse = await fetch('http://localhost:5000/check-doc-auth', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${doctorToken}`, // Assuming doctorToken is the token for doctor
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (doctorResponse.ok) {
            const doctorData = await doctorResponse.json();
            setDoctorData(doctorData.doctor); // Set doctor data from the response
            setIsAuthenticated(true); // Ensure the user is marked authenticated
          } else {
            const errorData = await doctorResponse.json();
            console.error('Doctor auth check failed:', errorData.message);
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false); // Ensure loading state is updated
      }
    };

    checkAuthStatus();
  }, [doctor]);

  // Display loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // Determine which component to render based on user data
  const renderDetailsComponent = () => {
    if (userData?.userDetails) {
      return <Navigate to="/user/page" />; // Redirect if user details exist
    } else if (userData?.authCode && !userData?.adminDetails) {
      return <AdminDetails user={userData} />; // Show admin details form
    } else if (userData?.adminDetails) {
      return <Navigate to="/admin-dashboard" />;
    } else {
      return <UserDetails user={userData} />; // Show user details form
    }
  };

  return (
    <div className="App">
      <VideoRoomProvider>
        <Routes>
          {/* Home route */}
          <Route path="/" element={<HomePage />} />

          {/* Signup route */}
          <Route path="/signup" element={<SignUp />} />

          {/* Appointment route */}
          <Route path="/new-appointment" element={<AppointmentForm user={userData} />} />

          {/* Complete profile route */}
          <Route
            path="/complete-profile"
            element={
              isAuthenticated && userData?.isComplete === false ? (
                <CompleteProfile user={userData} />
              ) : (
                userData?.authCode ? (<Navigate to="/admin-dashboard" />) : (<Navigate to="/new-appointment" />)
              )
            }
          />

          {/* Dynamic route for user/admin details */}
          <Route
            path="/details"
            element={
              isAuthenticated ? renderDetailsComponent() : <Navigate to="/" />
            }
          />

          {/* Doctor details route */}
          <Route
            path="/doctor/details"
            element={<DoctorDetails doctorData={doctorData} />} // Pass doctorData to the component
          />

          {/* Doctor dashboard route */}
          <Route
            path="/doctor-dashboard"
            element={
              doctorData ? (
                <DoctorDashboard doctor={doctorData} /> // Render dashboard when doctorData is available
              ) : (
                <div>Doctor data not available</div> // Fallback if data isn't available yet
              )
            }
          />

          {/* User page */}
          <Route path="/user/page" element={<UserOptions user={userData} />} />

          {/* Blog related routes */}
          <Route path="/:blogId" element={<BlogPost />} />
          <Route path="/blogs" element={<ViewBlogs />} />
          <Route path="/edit-blog/:blogId" element={<EditBlog user={doctorData}/>}/>
          <Route path="/add-blog" element={<AddBlog user={doctorData} />} />

          {/* Admin dashboard */}
          <Route path="/admin-dashboard" element={<AdminDashboard admin={userData} />} />

          {/* Chat routes */}
          <Route path="/chat" element={<ChatWithDoctor user={userData} />} />
          <Route path="/doctor-chat" element={<ChatWithPatient doctor={doctorData} />} />
          <Route path='/chatbot' element={<SymptomChecker />}/>
          {/* Video room */}
          <Route path="/video-room" element={<VideoRoom />} />
          <Route path="/payment/:appointmentId" element={<PaymentGateway />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Routes>
      </VideoRoomProvider>
    </div>
  );
};

export default HomePageContent;
