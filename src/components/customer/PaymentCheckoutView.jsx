// src/components/customer/PaymentCheckoutView.jsx
import React from 'react';
import PaymentCheckout from './PaymentCheckout';

export default function PaymentCheckoutView({ pickupRequest, onPaymentSuccess, onBack }) {
    return (
        <PaymentCheckout
            pickupRequest={pickupRequest}
            checkoutData={pickupRequest}
            onPaymentSuccess={onPaymentSuccess}
            onBack={onBack}
        />
    );
}
