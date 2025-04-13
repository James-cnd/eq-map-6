import { Seismometer } from '@/types/seismometer'

export const SEISMOMETERS: Seismometer[] = [
    {
        id: 'fag01',
        name: 'Fagradalsfjall Station 1',
        stationCode: 'FAG01',
        channel: 'EHZ',
        coordinates: [63.891234, -22.271234],
        description: 'Main monitoring station near the 2024 eruption site',
        dateAdded: '2024-01-15T00:00:00.000Z'
    },
    {
        id: 'fag02',
        name: 'Fagradalsfjall Station 2',
        stationCode: 'FAG02',
        channel: 'EHZ',
        coordinates: [63.895678, -22.265678],
        description: 'Secondary station monitoring northern activity',
        dateAdded: '2024-01-15T00:00:00.000Z'
    }
]