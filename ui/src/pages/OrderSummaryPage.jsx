import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { orderAsyncActions } from '../redux/slices/orderSlice';
import { paymentAsyncActions } from '../redux/slices/paymentSlice';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '../styles/OrderSummaryPage.scss'

const OrderSummaryPage = ({ orderId }) => {
  const dispatch = useDispatch();
  const { order, isLoading, error } = useSelector((state) => state.order);
  const { paymentStatus } = useSelector((state) => state.payment);
  const stripe = useStripe();
  const elements = useElements();
  const [countdown, setCountdown] = useState(900); // 15 minutes countdown
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    dispatch(orderAsyncActions.fetchOrderSummary(orderId));
  }, [dispatch, orderId]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown <= 0) {
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [countdown]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);

    setProcessing(true);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.error(error);
      setProcessing(false);
      return;
    }

    dispatch(paymentAsyncActions.makePayment({ orderId, token: paymentMethod.id }));
    setProcessing(false);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="order-summary">
      <h2>Order Summary</h2>
      {order && (
        <>
          <p>Total Amount: ${order.totalAmount}</p>
          <p>Time Left to Complete Payment: {Math.floor(countdown / 60)}:{countdown % 60}</p>
          <form onSubmit={handlePayment}>
            <CardElement />
            <button type="submit" disabled={!stripe || processing}>Pay Now</button>
          </form>
          {paymentStatus === 'success' && <p>Payment Successful!</p>}
          {paymentStatus === 'failed' && <p>Payment Failed. Please Try Again.</p>}
        </>
      )}
    </div>
  );
};

export default OrderSummaryPage;
