import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  className: 'rounded-xl !shadow-soft',
                  style: {
                    border: '1px solid rgba(255,77,141,0.2)',
                    padding: '12px 16px',
                    fontWeight: 500,
                  },
                  success: {
                    iconTheme: { primary: '#FF4D8D', secondary: 'white' },
                  },
                }}
              />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
