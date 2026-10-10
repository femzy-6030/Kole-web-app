// src/store/useJobStore.js
import { create } from 'zustand';

export const useJobStore = create((set, get) => ({
    // Core Operational State
    pricingRules: {
        baseCustomerFee: 0.0,
        fixedServiceFee: 0.0,
        largeVolumeSurcharge: 0.0,
    },

    jobs: [
        {
            id: 'KL-904102',
            customerName: 'Olayinka Oluwafemi',
            phone: '08012345678',
            address: 'Oke-Fia Junction, Near Station Road',
            cluster: 'Oke-Fia',
            wasteVolume: 'Medium (3-5 Bags)',
            scheduleWindow: 'ASAP',
            status: 'PENDING', // PENDING | IN_TRANSIT | ARRIVED | COMPLETED
            customerFee: 0.0,
            collectorId: null,
            proofUrl: null,
            createdAt: new Date().toISOString(),
        },
        {
            id: 'KL-904108',
            customerName: 'Aisha Bello',
            phone: '08123456789',
            address: 'Alekuwodo Road, Osogbo',
            cluster: 'Alekuwodo',
            wasteVolume: 'Small (1-2 Bags)',
            scheduleWindow: 'ASAP',
            status: 'PENDING',
            customerFee: 0.0,
            collectorId: null,
            proofUrl: null,
            createdAt: new Date().toISOString(),
        },
    ],

    // Actions
    addJob: (newJob) => set((state) => ({ jobs: [newJob, ...state.jobs] })),

    claimJob: (jobId, collectorId) =>
        set((state) => ({
            jobs: state.jobs.map((job) =>
                job.id === jobId ? { ...job, status: 'IN_TRANSIT', collectorId } : job
            ),
        })),

    completeJob: (jobId, proofUrl) =>
        set((state) => ({
            jobs: state.jobs.map((job) =>
                job.id === jobId ? { ...job, status: 'COMPLETED', proofUrl } : job
            ),
        })),

    updatePricingRules: (newRules) =>
        set((state) => ({
            pricingRules: { ...state.pricingRules, ...newRules },
        })),
}));