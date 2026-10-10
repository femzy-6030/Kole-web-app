import React from 'react';
import logoImg from '../../assets/Kole.png'; // Adjust extension (.svg / .jpg) if needed

export default function Logo({ className = "h-10", alt = "KÓLẸ̀ Logo" }) {
    return (
        <img
            src={logoImg}
            alt={alt}
            className={`object-contain ${className}`}
        />
    );
}