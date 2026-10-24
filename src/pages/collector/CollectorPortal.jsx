// src/pages/collector/CollectorPortal.jsx
import React, { useState, useEffect } from 'react';
import CollectorLayout from '../../layouts/CollectorLayout';
import CollectorRequestsView from './CollectorRequestsView';
import CollectorProfilesView from './CollectorProfilesView';
import CollectorClustersView from './CollectorClustersView';
import CollectorAssistancesView from './CollectorAssistancesView';

export default function CollectorPortal({ initialSection = 'requests' }) {
    // Detect active section from URL path or hash
    const getSectionFromUrl = () => {
        if (typeof window === 'undefined') return initialSection;
        const path = window.location.pathname.toLowerCase();
        const hash = window.location.hash.toLowerCase();

        if (path.includes('profile') || hash.includes('profile')) return 'profiles';
        if (path.includes('cluster') || hash.includes('cluster')) return 'clusters';
        if (path.includes('assistance') || hash.includes('assistance') || path.includes('support')) return 'assistances';
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
        <CollectorLayout activeSection={activeSection} onNavigate={handleNavigate}>
            {activeSection === 'requests' && <CollectorRequestsView />}
            {activeSection === 'profiles' && <CollectorProfilesView />}
            {activeSection === 'clusters' && <CollectorClustersView />}
            {activeSection === 'assistances' && <CollectorAssistancesView />}
        </CollectorLayout>
    );
}
