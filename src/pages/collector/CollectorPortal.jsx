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

        if (path.includes('profile') || hash.includes('profile')) return 'profiles';
        if (path.includes('assistance') || hash.includes('assistance') || path.includes('support')) return 'assistances';
        if (path.includes('ledger') || hash.includes('ledger') || path.includes('customer') || hash.includes('debtor')) return 'ledger';
        if (path.includes('zone') || hash.includes('zone') || path.includes('cluster')) return 'zones';
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
            {activeSection === 'requests' && <CollectorRequestsView />}
            {activeSection === 'ledger' && <CollectorCustomerLedger />}
            {activeSection === 'zones' && <CollectorClustersView />}
            {activeSection === 'profiles' && <CollectorProfilesView />}
            {activeSection === 'assistances' && <CollectorAssistancesView />}
        </CollectorSidebarLayout>
    );
}
