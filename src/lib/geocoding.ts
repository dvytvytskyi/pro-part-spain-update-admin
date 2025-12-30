import { locationCoordinates } from "@/data/locationCoordinates";

export function applyGeocoding(projects: any[]) {
    // 1. First assign base coordinates from towns if missing
    const processed = projects.map(project => {
        // If it already has valid coordinates, keep them
        if (project.latitude && project.longitude && project.latitude !== 0) {
            return {
                ...project,
                _isGeocoded: project._isGeocoded || false
            };
        }

        // Otherwise find match in coordinates list by town or province
        const townName = project.town || project.province;
        const baseCoords = locationCoordinates[townName];

        if (baseCoords) {
            return {
                ...project,
                latitude: parseFloat(baseCoords.lat),
                longitude: parseFloat(baseCoords.lng),
                _isGeocoded: true
            };
        }
        return project;
    });

    // 2. Jittering (De-clustering)
    // Group by lat-lng
    const coordGroups: Record<string, any[]> = {};
    processed.forEach(p => {
        if (p.latitude && p.longitude) {
            const key = `${p.latitude.toFixed(6)},${p.longitude.toFixed(6)}`;
            if (!coordGroups[key]) coordGroups[key] = [];
            coordGroups[key].push(p);
        }
    });

    // Apply spiral jitter to groups with more than 1 item
    Object.values(coordGroups).forEach(group => {
        if (group.length > 1) {
            group.forEach((p, index) => {
                if (index === 0) return; // Keep first one at center

                // Spiral offset logic
                // Each step we increase angle and slightly increase radius
                const angle = index * (360 / Math.min(group.length, 12)) * (Math.PI / 180);
                const radius = 0.0003 * (1 + Math.floor(index / 12)); // approx 30-50 meters shift

                p.latitude = p.latitude + radius * Math.cos(angle);
                p.longitude = p.longitude + radius * Math.sin(angle);
            });
        }
    });

    return processed;
}
