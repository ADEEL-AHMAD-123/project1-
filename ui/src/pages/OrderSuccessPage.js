import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../styles/OrderSuccesPage.scss';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const order = useSelector((state) => state.order.order); // Assuming currentOrder holds the last order info

  if (!order) {
    return <p>Loading order details...</p>;
  }

  const { totalPrice, paymentStatus, _id, createdAt } = order;

  return (
    <div className="order-success-page">
      <div className="order-success-container">
        <h1>Order Placed Successfully!</h1>
        <p>Your order details are as follows:</p>

        <div className="order-details">
          <p><strong>Order ID:</strong> {_id}</p>
          <p><strong>Total Price:</strong> ${totalPrice}</p>
          <p><strong>Payment Status:</strong> {paymentStatus}</p>
          <p><strong>Order Date:</strong> {new Date(createdAt).toLocaleString()}</p>
        </div>

        <div className="success-icon">
          <i className="fas fa-check-circle"></i>
        </div>

        <div className="button-group">
          <button className="btn-buy-more" onClick={() => navigate('/dids')}>
            Buy More
          </button>
          <button className="btn-home" onClick={() => navigate('/')}>
            Go Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
