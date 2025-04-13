import type { LavaFlow } from '@/types/lava-flow'

export const LAVA_FLOWS: LavaFlow[] = [
    {
        id: 'flow-2024-01',
        name: 'January 2024 Flow',
        description: 'Lava flow from the January 2024 eruption',
        coordinates: [
            // Array of coordinate arrays forming the polygon
            [
                [63.8781, -22.3712],
                [63.8785, -22.3708],
                [63.8788, -22.3715],
                [63.8784, -22.3719],
                [63.8781, -22.3712]
            ]
        ],
        startDate: '2024-01-14',
        endDate: '2024-01-27',
        status: 'inactive',
        color: '#FF4500',
        opacity: 0.7
    },
    // Add more flows as needed
]