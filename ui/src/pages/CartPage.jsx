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

  const { pricing } = useSelector((state) => state.did);
  const { items: cartItems } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(didAsyncActions.fetchDIDPricing({ requestData: "" }));
  }, [dispatch]);

  if (!pricing?.individualPrice) {
    return <div className="cart-loading">Loading pricing data...</div>;
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <ErrorCard 
        message="Your cart is empty."
        buttonLabel="Go Back" 
        isFullPage={true} 
      />
    );
  }

  const totalCost = cartItems.reduce((acc, item) => acc + pricing.individualPrice, 0);

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
              <th>Country</th> {/* Split into Country */}
              <th>Area Code</th> {/* Split into Area Code */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item._id}>
                <td>{item.didNumber}</td>
                <td>{item.country}</td>  {/* Country column */}
                <td>{item.areaCode}</td> {/* Area Code column */}
                <td>
                  <FontAwesomeIcon
                    icon={faTrashAlt}
                    className="remove-icon"
                    onClick={() => handleRemove(item._id, item.type)}
                  />
                </td>
              </tr>
            ))}
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
