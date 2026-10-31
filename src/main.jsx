import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './index.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
    console.warn('[Google OAuth] VITE_GOOGLE_CLIENT_ID is not configured in environment variables. Google Sign-In will use fallback handling.');
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <GoogleOAuthProvider clientId={googleClientId || 'dummy-google-client-id.apps.googleusercontent.com'}>
                <App />
            </GoogleOAuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
);
