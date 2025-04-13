import type { Berm } from '@/types/berm'

export const BERMS: Berm[] = [
    {
        id: 'berm-1',
        name: 'Northern Defense Berm',
        description: 'Defensive barrier north of Grindavík',
        coordinates: [
            [63.8429, -22.4372],
            [63.8431, -22.4368],
            // Add more coordinate pairs as needed
        ],
        dateAdded: '2024-01-15',
        lastUpdated: '2024-01-15',
        status: 'active'
    },
    // Add more berms as needed
]