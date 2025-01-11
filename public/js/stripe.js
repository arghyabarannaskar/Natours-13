import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51Qg2Y9EDXOVhp1NIOySicMVUTtaw6ZsoI1zIaJgxIhydV1M1o5fcC3fCeBg5ehlGpD5yxRtny395YA9Xpa6O2BNE009NYB5Whr'
);

export const bookTour = async tourId => {
  try {
    // 1) Get the checkout session from API
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
    );

    console.log(session);
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    }); // Redirect to Stripe checkout page
    // 2) Create checkout form + chanre credit card
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
