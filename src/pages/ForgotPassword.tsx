// ForgotPassword.tsx
import React from 'react';
import { supabase } from '../lib/supabaseClient';
import ForgotPasswordComponent from './auth/ForgotPassword';

export const handleResetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://app.kole.com.ng/update-password',
  });

  if (error) {
    console.error('Reset error:', error.message);
    alert(error.message);
  } else {
    alert('Check your email for the password reset link!');
  }
};

export default function ForgotPassword(props) {
  return <ForgotPasswordComponent {...props} />;
}

