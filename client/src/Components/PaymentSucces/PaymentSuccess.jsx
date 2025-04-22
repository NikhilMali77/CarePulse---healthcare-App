import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const navigate = useNavigate();

  useEffect(() => {
    if (appointmentId) {
      axios.post('http://localhost:5000/payment/confirm', { appointmentId })
        .then(() => {
          // alert('Payment successful! Your appointment is now scheduled.');
          // navigate('/user/page'); // Redirect to dashboard after success
        })
        .catch((error) => {
          console.error('Error confirming payment:', error);
        });
    }
  }, [appointmentId, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Payment Successful 🎉</h1>
      <p>Your appointment is now scheduled.</p>
      <button onClick={() => navigate('/dashboard')} style={{ padding: '10px', fontSize: '16px' }}>
        Go to Dashboard
      </button>
    </div>
  );
};

export default PaymentSuccess;
