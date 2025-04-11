import { useState, useEffect } from 'react'

export const useAdminLayers = () => {
    const [layers, setLayers] = useState({
        fissures: [],
        lavaFlows: [],
        berms: []
    })
    const [lastFetched, setLastFetched] = useState(0)

    const fetchLayers = async () => {
        try {
            const response = await fetch('/api/admin/layers')
            const data = await response.json()
            setLayers(data)
            setLastFetched(Date.now())
        } catch (error) {
            console.error('Failed to fetch layers:', error)
        }
    }

    // Fetch when layer visibility changes
    const refreshLayers = () => {
        // Only fetch if more than 30 seconds since last fetch
        if (Date.now() - lastFetched > 30000) {
            fetchLayers()
        }
    }

    return {
        layers,
        refreshLayers
    }
}