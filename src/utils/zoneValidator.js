// src/utils/zoneValidator.js

// Active cluster zones and recognized neighborhood keywords in Osogbo
const ACTIVE_ZONES = [
    'oke-fia', 'okefia',
    'alekuwodo',
    'ogo-oluwa',
    'station road',
    'gra', 'osogbo gra',
    'italale', 'taiyeland',
    'isale osun'
];

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