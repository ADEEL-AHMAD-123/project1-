import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { didAsyncActions } from "../redux/slices/didSlice";
import { cartAsyncActions } from "../redux/slices/cartSlice";
import { useNavigate } from 'react-router-dom'; 
import ErrorCard from "../components/ErrorCard";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import '../styles/CartPage.scss';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch pricing data from Redux state
  const { userPricing } = useSelector((state) => state.did);
  const { User } = useSelector((state) => state.user);
  const { items: cartItems } = useSelector((state) => state.cart);
  
  useEffect(() => {
    dispatch(didAsyncActions.fetchUserDIDPricing({ requestData: User._id })); // Fetch user-specific pricing
  }, [dispatch, User._id]);

  // Check if pricing data is available
  if (!userPricing) {
    return <div className="cart-loading">Loading pricing data...</div>;
  }

  // Check if cart is empty
  if (!cartItems || cartItems.length === 0) {
    return (
      <ErrorCard 
        message="Your cart is empty."
        buttonLabel="Go Back" 
        isFullPage={false} 
      />
    );
  }

  // Calculate total cost based on the new pricing structure
  const totalCost = cartItems.reduce((acc, item) => {
    const itemPrice = item.isBulk ? userPricing.bulkPrice : userPricing.nonBulkPrice;
    return acc + itemPrice;
  }, 0);

  // Function to handle item removal
  const handleRemove = (_id, type) => {
    dispatch(cartAsyncActions.removeFromCart({ _id, type }));
  };

  const handleBuyMore = () => {
    navigate('/dids');
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Your Cart</h1>
        <div className="cart-summary">
          <p>Total Items: {cartItems.length}</p>
          <p>Total Cost: ${totalCost.toFixed(2)}</p>
        </div>
      </div>

      {/* DID Numbers Table */}
      <div className="cart-section">
        <h2>DID Numbers</h2>
        <table className="cart-table">
          <thead>
            <tr>
              <th>DID Number</th>
              <th>Country</th>
              <th>Area Code</th>
              <th>Price</th> {/* New Price Column */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => {
              const itemPrice = item.isBulk ? userPricing.bulkPrice : userPricing.nonBulkPrice;
              return (
                <tr key={item._id}>
                  <td>{item.didNumber}</td>
                  <td>{item.country}</td>
                  <td>{item.areaCode}</td>
                  <td>${itemPrice.toFixed(2)}</td> {/* Display Price */}
                  <td>
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      className="remove-icon"
                      onClick={() => handleRemove(item._id, item.type)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="cart-actions">
        <button className="buy-more-btn" onClick={handleBuyMore}>Buy More</button>
        <button className="checkout-btn" onClick={handleCheckout}>Checkout</button>
      </div>
    </div>
  );
};

export default CartPage;
