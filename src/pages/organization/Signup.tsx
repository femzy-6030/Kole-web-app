// src/pages/organization/Signup.tsx
import React from 'react';
import OrganizationSignupForm from '../../components/organization/OrganizationSignupForm';
import Logo from '../../components/common/Logo';
import { ArrowLeft } from 'lucide-react';

interface SignupProps {
    onBackToHome?: () => void;
    onSwitchToLogin?: () => void;
    onSignupSuccess?: (organizationData: any) => void;
}

export default function Signup({
    onBackToHome,
    onSwitchToLogin,
    onSignupSuccess,
}: SignupProps) {
    const handleHomeClick = () => {
        if (onBackToHome) {
            onBackToHome();
        } else if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new Event('popstate'));
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 py-8 font-sans">
            {/* Top Navigation */}
            <div className="w-full max-w-3xl mb-4 flex justify-between items-center text-xs">
                <button
                    type="button"
                    onClick={handleHomeClick}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer font-bold"
                >
                    <ArrowLeft size={16} />
                    <span>Back to Customer Portal</span>
                </button>

                <div className="flex items-center gap-2">
                    <Logo className="h-7 w-auto" />
                </div>
            </div>

            {/* Main Form Component */}
            <OrganizationSignupForm
                onSuccess={onSignupSuccess}
                onSwitchToLogin={onSwitchToLogin}
            />
        </div>
    );
}

