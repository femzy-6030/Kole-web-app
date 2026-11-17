// src/pages/collector/CollectorPortal.jsx
import React, { useState, useEffect } from 'react';
import CollectorSidebarLayout from '../../layouts/CollectorSidebarLayout';
import CollectorRequestsView from './CollectorRequestsView';
import CollectorProfilesView from './CollectorProfilesView';
import CollectorAssistancesView from './CollectorAssistancesView';
import CollectorClustersView from './CollectorClustersView';
import CollectorCustomerLedger from '../../components/collector/CollectorCustomerLedger';

export default function CollectorPortal({ initialSection = 'requests' }) {
    // Detect active section from URL path or hash
    const getSectionFromUrl = () => {
        if (typeof window === 'undefined') return initialSection;
        const path = window.location.pathname.toLowerCase();
        const hash = window.location.hash.toLowerCase();

        if (path.includes('override') || hash.includes('override')) return 'ledger_overrides';
        if (path.includes('history') || hash.includes('history')) return 'ledger_history';
        if (path.includes('ledger') || hash.includes('ledger') || path.includes('customer') || hash.includes('debtor')) return 'ledger_invoices';
        if (path.includes('verification') || hash.includes('verification') || path.includes('proof')) return 'requests_verification';
        if (path.includes('profile') || hash.includes('profile')) return 'profiles_verification';
        if (path.includes('gateway') || hash.includes('gateway')) return 'profiles_gateway';
        if (path.includes('assistance') || hash.includes('assistance') || path.includes('support')) return 'assistances_tickets';
        if (path.includes('dispute') || hash.includes('dispute')) return 'assistances_disputes';
        if (path.includes('zone') || hash.includes('zone') || path.includes('cluster')) return 'zones_maps';
        return 'requests';
    };

    const [activeSection, setActiveSection] = useState(getSectionFromUrl);

    useEffect(() => {
        const handleRouteSync = () => {
            setActiveSection(getSectionFromUrl());
        };
        window.addEventListener('popstate', handleRouteSync);
        window.addEventListener('hashchange', handleRouteSync);
        return () => {
            window.removeEventListener('popstate', handleRouteSync);
            window.removeEventListener('hashchange', handleRouteSync);
        };
    }, []);

    const handleNavigate = (sectionKey, path) => {
        setActiveSection(sectionKey);
        if (typeof window !== 'undefined') {
            window.history.pushState({}, '', path);
        }
    };

    return (
        <CollectorSidebarLayout activeSection={activeSection} onNavigate={handleNavigate}>
            {activeSection.startsWith('requests') && <CollectorRequestsView />}
            {activeSection.startsWith('ledger') && <CollectorCustomerLedger initialSubModule={activeSection} />}
            {activeSection.startsWith('zones') && <CollectorClustersView />}
            {activeSection.startsWith('profiles') && <CollectorProfilesView />}
            {activeSection.startsWith('assistances') && <CollectorAssistancesView />}
        </CollectorSidebarLayout>
    );
}
