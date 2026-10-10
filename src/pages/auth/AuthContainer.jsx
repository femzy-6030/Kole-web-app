import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Logo from '../../components/common/Logo'; // Import Logo component
import { Truck, User } from 'lucide-react';

export default function AuthContainer() {
    const [activeRole, setActiveRole] = useState('customer');
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        pin: '',
        clusterArea: 'Oke-Fia',
        vehiclePlate: '',
    });

    const setUserSession = useAuthStore((state) => state.setUserSession);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const mockUser = {
            id: 'usr_10293',
            fullName: formData.fullName || 'Olayinka Oluwafemi',
            phoneNumber: formData.phoneNumber,
            role: activeRole,
            cluster: formData.clusterArea,
        };
        setUserSession(mockUser, 'mock_jwt_token_xyz');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-8">
            <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-8">

                {/* Brand Header with Image Logo */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <Logo className="h-12 w-auto mb-2" />
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                        SMART PICKUP. ZERO HASSLE.
                    </p>
                </div>

                {/* Role Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
                    <button
                        type="button"
                        onClick={() => setActiveRole('customer')}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${activeRole === 'customer'
                                ? 'bg-white text-brand-primary shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <User size={16} />
                        Customer
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveRole('collector')}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${activeRole === 'collector'
                                ? 'bg-white text-brand-primary shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Truck size={16} />
                        Waste Collector
                    </button>
                </div>

                {/* Form Element */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <Input
                            label="Full Name"
                            name="fullName"
                            placeholder="e.g., Olayinka Oluwafemi"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    )}

                    <Input
                        label="Phone Number"
                        name="phoneNumber"
                        type="tel"
                        placeholder="08012345678"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="4-Digit Security PIN"
                        name="pin"
                        type="password"
                        maxLength={4}
                        placeholder="••••"
                        value={formData.pin}
                        onChange={handleChange}
                        required
                    />

                    {activeRole === 'customer' && !isLogin && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                Choose Your Cluster / Location
                            </label>
                            <select
                                name="clusterArea"
                                value={formData.clusterArea}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                            >
                                <option value="Oke-Fia">Oke-Fia</option>
                                <option value="Alekuwodo">Alekuwodo</option>
                                <option value="GRA">GRA</option>
                                <option value="Ogo-Oluwa">Ogo-Oluwa</option>
                                <option value="Old Garage">Old Garage</option>
                                <option value="Testing Ground">Testing Ground</option>
                            </select>
                        </div>
                    )}

                    {activeRole === 'collector' && !isLogin && (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Select Assigned Government Cluster
                                </label>
                                <select
                                    name="clusterArea"
                                    value={formData.clusterArea}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                                >
                                    <option value="Oke-Fia">Oke-Fia Cluster</option>
                                    <option value="Alekuwodo">Alekuwodo Cluster</option>
                                    <option value="GRA">GRA Cluster</option>
                                    <option value="Ogo-Oluwa">Ogo-Oluwa Cluster</option>
                                    <option value="Old Garage">Old Garage Cluster</option>
                                    <option value="Testing Ground">Testing Ground Cluster</option>
                                </select>
                            </div>

                            <Input
                                label="Vehicle Registration / Plate Number"
                                name="vehiclePlate"
                                placeholder="e.g., OS-123-A08"
                                value={formData.vehiclePlate}
                                onChange={handleChange}
                                required
                            />
                        </>
                    )}

                    <Button type="submit" className="w-full mt-2">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </Button>
                </form>

                {/* Toggle Login/Signup */}
                <div className="mt-6 text-center border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-xs text-slate-600 hover:text-brand-primary font-bold"
                    >
                        {isLogin
                            ? "Don't have an account? Register now"
                            : "Already have an account? Sign in"}
                    </button>
                </div>

            </div>
        </div>
    );
}