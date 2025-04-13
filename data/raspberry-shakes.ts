export interface RaspberryShake {
    id: string;
    name: string;
    location: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    stationCode: string;
    isActive: boolean;
    lastUpdated?: string;
}

export const raspberryShakes: RaspberryShake[] = [
    {
        id: "rs1",
        name: "Raspberry Shake Station 1",
        location: "Sample Location 1",
        coordinates: {
            lat: 0,
            lng: 0
        },
        stationCode: "RS1",
        isActive: true,
        lastUpdated: "2025-04-13"
    }
];