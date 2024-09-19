import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cartAsyncActions } from '../redux/slices/cartSlice'; // Import the cart actions
import '../styles/CartPage.scss'; // Import SCSS

const CartPage = () => {
  const dispatch = useDispatch();
  const { items: cartItems } = useSelector((state) => state.cart); // Get cart items from Redux
  const [totalAmount, setTotalAmount] = useState(0); // Local state for total amount

  useEffect(() => {
    // Calculate total when cartItems change
    const calculatedTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotalAmount(calculatedTotal);
  }, [cartItems]);

  const handleRemoveItem = (id) => {
    dispatch(cartAsyncActions.removeFromCart(id)); // Remove item from cart
  };

  const handleCheckout = () => {
    // Placeholder for checkout logic
    alert('Proceeding to checkout...');
  };

  if (!cartItems.length) {
    return <div className="cart-empty">Your cart is currently empty.</div>;
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <div className="cart-summary">
          <span className="total-amount">Total: ${totalAmount.toFixed(2)}</span>
          <button onClick={handleCheckout} className="checkout-btn">
            Checkout
          </button>
        </div>
      </div>

      <div className="cart-items">
        {cartItems.map((item) => (
          <div className="cart-item" key={item._id}>
            <div className="item-info">
              <h2>{item.name}</h2>
              <p>{item.description}</p>
              <div className="item-price">
                <span>${item.price.toFixed(2)}</span>
                <span>Quantity: {item.quantity}</span>
              </div>
            </div>
            <button onClick={() => handleRemoveItem(item._id)} className="remove-btn">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartPage;
