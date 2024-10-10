import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { orderAsyncActions } from '../redux/slices/orderSlice';
import { toast } from 'react-toastify';
import '../styles/CheckOutPage.scss';
import { cartAsyncActions } from '../redux/slices/cartSlice';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const totalPrice = useSelector((state) => state.cart.totalPrice);
  const numberOfDIDs = useSelector((state) => state.cart.numberOfDIDs);
  const pricePerDID = useSelector((state) => state.cart.pricePerDID);
  const availableBalance = useSelector((state) => state.billing.credit);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const balance = Number(availableBalance) || 0;

  const handleOrderCreation = async () => {
    setLoading(true);
    setError('');

    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          referenceType: 'DID',
          referenceId: item._id,
          quantity: numberOfDIDs,
          name: "dids",
          price: pricePerDID,
        })),
        totalPrice,
      };

      // Call the create order action
      const response = await dispatch(orderAsyncActions.createOrder({ data: orderData }));

      if (response.error) {
        throw new Error(response.error.message);
      }

      dispatch(cartAsyncActions.resetCart());

    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while creating your order.');
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      {error && <div className="error-message">{error}</div>}
      
      <div className="balance-info">
        <h2>Available Balance: ${balance.toFixed(2)}</h2>
      </div>

      <div className="cart-items">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div className="cart-item" key={item._id}>
              <p>{item.didNumber}</p>
              <p>Price: ${pricePerDID}</p>
            </div>
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>
      <h2>Total Price: ${totalPrice}</h2>

      <button 
        onClick={handleOrderCreation} 
        disabled={loading || cartItems.length === 0}
      >
        {loading ? 'Processing...' : 'Create Order'}
      </button>
    </div>
  );
};

export default CheckoutPage;
