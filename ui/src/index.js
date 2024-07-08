import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import store, { persistor } from './redux/store/store'; 
import { PersistGate } from 'redux-persist/integration/react'; 
import { ToastContainer } from 'react-toastify';
import { Elements } from '@stripe/react-stripe-js'; 
import { BrowserRouter as Router } from 'react-router-dom'; 
import 'react-toastify/dist/ReactToastify.css';
import reportWebVitals from './reportWebVitals';


ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
            <App />
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
        </Router>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
