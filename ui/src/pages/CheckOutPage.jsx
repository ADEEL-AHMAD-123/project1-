import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { orderAsyncActions } from '../redux/slices/orderSlice';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import '../styles/CheckOutPage.scss';
import {cartAsyncActions} from '../redux/slices/cartSlice'
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const totalPrice = useSelector((state) => state.cart.totalPrice);
  const numberOfDIDs = useSelector((state) => state.cart.numberOfDIDs);
  const pricePerDID = useSelector((state) => state.cart.pricePerDID);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const stripe = useStripe();
  const elements = useElements();

  const handleOrderCreation = async () => {
    setLoading(true);
    setError('');

    try {
      // Create order data
      const orderData = {
        orderItems: cartItems.map(item => ({
          referenceType: 'DID', // Set the actual reference type
          referenceId: item._id, // Use the item's unique ID or another relevant ID
          quantity: numberOfDIDs, // Use number of DIDs from cart state as quantity
          name: "dids", // Use the item's name
          price: pricePerDID, // Set the price from the state
        })),
        totalPrice, // Total price calculated from cart state
      };

      // Call your create order action
      const response = await dispatch(orderAsyncActions.createOrder({ data: orderData }));

      // Handle Stripe payment
      const { clientSecret } = response.payload; // Use payload if response contains the data directly

      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // Add any billing details here
            name: 'Customer Name', // Replace with actual customer name or a state variable
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      toast.success('Payment Successful! Order created.');
      dispatch(cartAsyncActions.resetCart()); // Reset the cart after successful order

    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while processing your payment.');
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="cart-items">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div className="cart-item" key={item._id}>
              <p>{item.name}</p>
              <p>Price: ${pricePerDID}</p>
            </div>
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>
      <h2>Total Price: ${totalPrice}</h2>
      <CardElement />
      <button 
        onClick={handleOrderCreation} 
        disabled={loading || cartItems.length === 0 || !stripe || !elements}
      >
        {loading ? 'Processing...' : 'Create Order'}
      </button>
    </div>
  );
};

export default CheckoutPage;
