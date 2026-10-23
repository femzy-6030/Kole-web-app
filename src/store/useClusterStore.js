// src/store/useClusterStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { collectors } from '../services/api';

/**
 * Helper to normalize cluster names for fuzzy, case-insensitive comparison
 * Strips 'zone', punctuation, spaces, and lowercase
 * e.g., 'Oke-Fia Zone' -> 'okefia', 'oke fia' -> 'okefia'
 */
export const normalizeCluster = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str
        .toLowerCase()
        .replace(/\bzone\b/g, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
};

const DEFAULT_ACTIVE_CLUSTERS = ['Oke-Fia Zone', 'Oke-Fia'];

const DEFAULT_COLLECTORS = [
    {
        id: 'COL-1001',
        companyName: 'Osogbo Central Cleaners Ltd',
        collectorName: 'Osogbo Central Cleaners Ltd',
        phone: '08012345678',
        Area: 'Oke-Fia',
        cluster: 'Oke-Fia Zone',
        fleetCount: 2,
        vehicleCount: 2,
        workerCount: 4,
        bankName: 'First Bank of Nigeria',
        accountNumber: '0123456789',
        accountName: 'Osogbo Central Cleaners Ltd',
        registeredAt: new Date().toISOString(),
    },
];

export const useClusterStore = create(
    persist(
        (set, get) => ({
            activeClusters: DEFAULT_ACTIVE_CLUSTERS,
            registeredCollectors: DEFAULT_COLLECTORS,

            /**
             * Check if a given zone or address is within the actively serviced clusters
             */
            isClusterActive: (zoneOrAddress) => {
                if (!zoneOrAddress || typeof zoneOrAddress !== 'string') return true;
                const cleanQuery = normalizeCluster(zoneOrAddress);
                if (!cleanQuery) return true;

                const clusters = get().activeClusters || DEFAULT_ACTIVE_CLUSTERS;
                return clusters.some((c) => {
                    const cleanCluster = normalizeCluster(c);
                    if (!cleanCluster) return false;
                    return (
                        cleanQuery === cleanCluster ||
                        cleanQuery.includes(cleanCluster) ||
                        cleanCluster.includes(cleanQuery)
                    );
                });
            },

            /**
             * Add a new cluster to the active coverage zone list
             */
            addActiveCluster: (clusterName) => {
                if (!clusterName) return;
                const trimmed = clusterName.trim();
                const zoneFormatted = trimmed.toLowerCase().endsWith('zone')
                    ? trimmed
                    : `${trimmed} Zone`;

                set((state) => {
                    const existing = state.activeClusters || [];
                    const toAdd = [trimmed, zoneFormatted];
                    const next = [...existing];
                    toAdd.forEach((item) => {
                        if (!next.some((x) => x.toLowerCase() === item.toLowerCase())) {
                            next.push(item);
                        }
                    });
                    return { activeClusters: next };
                });
            },

            /**
             * Register an operator payload and dynamically activate coverage for their cluster
             * Saves Company Name, Phone, Fleet Count, Bank Name, NUBAN Account Number
             */
            registerCollector: async (collectorPayload) => {
                const area = collectorPayload.Area || collectorPayload.cluster || 'Oke-Fia';
                const zoneLabel = area.toLowerCase().endsWith('zone') ? area : `${area} Zone`;

                const newProfile = {
                    id: collectorPayload.id || `COL-${Math.floor(1000 + Math.random() * 9000)}`,
                    companyName: (collectorPayload.companyName || collectorPayload.collectorName || 'Collector Operator').trim(),
                    collectorName: (collectorPayload.collectorName || collectorPayload.companyName || 'Collector Operator').trim(),
                    phone: (collectorPayload.phone || collectorPayload.phoneNumber || '').trim(),
                    fleetCount: Number(collectorPayload.fleetCount || collectorPayload.vehicleCount || 1),
                    vehicleCount: Number(collectorPayload.vehicleCount || collectorPayload.fleetCount || 1),
                    workerCount: Number(collectorPayload.workerCount || 2),
                    bankName: collectorPayload.bankName || 'First Bank of Nigeria',
                    accountNumber: (collectorPayload.accountNumber || '').trim(),
                    accountName: (collectorPayload.accountName || '').trim(),
                    Area: area,
                    cluster: zoneLabel,
                    registeredAt: new Date().toISOString(),
                };

                // Add cluster to activeClusters and save profile to registeredCollectors
                set((state) => {
                    const existingClusters = state.activeClusters || [];
                    const toAdd = [area, zoneLabel];
                    const updatedClusters = [...existingClusters];

                    toAdd.forEach((item) => {
                        if (!updatedClusters.some((x) => x.toLowerCase() === item.toLowerCase())) {
                            updatedClusters.push(item);
                        }
                    });

                    return {
                        activeClusters: updatedClusters,
                        registeredCollectors: [newProfile, ...(state.registeredCollectors || [])],
                    };
                });

                // Try backend sync if available
                try {
                    if (collectors && typeof collectors.register === 'function') {
                        await collectors.register(newProfile);
                    }
                } catch (err) {
                    console.warn('[useClusterStore] Backend collector sync notice:', err?.message || err);
                }

                return newProfile;
            },

            /**
             * Reset clusters back to default initial state
             */
            resetClusters: () => {
                set({
                    activeClusters: DEFAULT_ACTIVE_CLUSTERS,
                    registeredCollectors: DEFAULT_COLLECTORS,
                });
            },
        }),
        {
            name: 'kole-clusters-storage',
            storage: createJSONStorage(() => localStorage),
            version: 1,
        }
    )
);
