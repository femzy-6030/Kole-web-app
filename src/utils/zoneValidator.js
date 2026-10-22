// src/utils/zoneValidator.js

// Active cluster zones and recognized neighborhood keywords in Osogbo
export const ACTIVE_ZONES = [
    'oke-fia', 'okefia',
    'sabo',
    'alekuwodo',
    'ogo-oluwa', 'ogo oluwa',
    'station road',
    'gra', 'osogbo gra',
    'italale', 'taiyeland',
    'isale osun',
    'old garage',
    'agowande'
];

// Active Osogbo Cluster definitions with geographic centers
export const OSOGBO_CLUSTERS = [
    { name: 'Oke-Fia', lat: 7.7785, lng: 4.5480, label: 'Oke-Fia Zone' },
    { name: 'Sabo', lat: 7.7915, lng: 4.5620, label: 'Sabo Zone' },
    { name: 'Alekuwodo', lat: 7.7710, lng: 4.5510, label: 'Alekuwodo Zone' },
    { name: 'GRA', lat: 7.7900, lng: 4.5350, label: 'GRA Zone' },
    { name: 'Ogo-Oluwa', lat: 7.7600, lng: 4.5750, label: 'Ogo-Oluwa Zone' },
    { name: 'Station Road', lat: 7.7740, lng: 4.5580, label: 'Station Road Zone' },
    { name: 'Old Garage', lat: 7.7700, lng: 4.5650, label: 'Old Garage Zone' },
    { name: 'Agowande', lat: 7.7850, lng: 4.5700, label: 'Agowande Zone' },
];

/**
 * Finds the nearest Osogbo active cluster based on latitude and longitude coordinates.
 * Uses Haversine distance formula.
 */
export function getNearestCluster(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        return { cluster: 'Oke-Fia', distanceKm: 0, isWithinOsogbo: true };
    }

    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371; // Earth radius in km

    let minDistance = Infinity;
    let closestCluster = OSOGBO_CLUSTERS[0];

    for (const cluster of OSOGBO_CLUSTERS) {
        const dLat = toRad(cluster.lat - lat);
        const dLon = toRad(cluster.lng - lng);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat)) * Math.cos(toRad(cluster.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;

        if (dist < minDistance) {
            minDistance = dist;
            closestCluster = cluster;
        }
    }

    return {
        cluster: closestCluster.name,
        distanceKm: Math.round(minDistance * 10) / 10,
        isWithinOsogbo: minDistance < 40,
    };
}

export function checkZoneCoverage(addressString) {
    if (!addressString || addressString.trim().length < 3) {
        return { active: true, matchedZone: 'DEFAULT' }; // Fallback before complete typing
    }

    const formattedAddress = addressString.toLowerCase();

    // Search for active zone keywords in the entered address
    const foundZone = ACTIVE_ZONES.find(zone => formattedAddress.includes(zone));

    if (foundZone) {
        return {
            active: true,
            matchedZone: foundZone.toUpperCase()
        };
    }

    return {
        active: false,
        matchedZone: null
    };
}