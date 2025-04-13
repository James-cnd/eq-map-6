import { useState, useEffect } from 'react'
import { useLocalStorage } from './use-local-storage'
import type { Berm } from '@/types/berm'
import type { LavaFlow } from '@/types/lava-flow'
import type { Seismometer } from '@/types/seismometer'
import type { CustomGpsStation } from '@/types/stations'
import type { Fissure } from '@/types/fissures'

interface MapLayersState {
    berms: {
        data: Berm[]
        visible: boolean
    }
    lavaFlows: {
        data: LavaFlow[]
        visible: boolean
    }
    seismicStations: {
        data: Seismometer[]
        visible: boolean
    }
    gpsStations: {
        data: CustomGpsStation[]
        visible: boolean
    }
    fissures: {
        data: Fissure[]
        visible: boolean
    }
    earthquakes: {
        visible: boolean
    }
    seismometers: {
        data: Seismometer[]
        visible: boolean
    }
}

export function useMapLayers() {
    // Visibility states using local storage
    const [showBerms, setShowBerms] = useLocalStorage('earthquakeShowBerms', false)
    const [showLavaFlows, setShowLavaFlows] = useLocalStorage('earthquakeShowLavaFlows', false)
    const [showSeismicStations, setShowSeismicStations] = useLocalStorage('earthquakeShowSeismicStations', false)
    const [showGpsStations, setShowGpsStations] = useLocalStorage('earthquakeShowGpsStations', true)
    const [showFissures, setShowFissures] = useLocalStorage('earthquakeShowFissures', true)
    const [showEarthquakes, setShowEarthquakes] = useLocalStorage('earthquakeShowEarthquakes', true)
    const [showSeismometers, setShowSeismometers] = useLocalStorage('earthquakeShowSeismometers', false)
    const [enabledFissures, setEnabledFissures] = useLocalStorage<string[]>("earthquakeEnabledFissures", [])

    // Data states
    const [layers, setLayers] = useState<MapLayersState>({
        berms: { data: [], visible: showBerms },
        lavaFlows: { data: [], visible: showLavaFlows },
        seismicStations: { data: [], visible: showSeismicStations },
        gpsStations: { data: [], visible: showGpsStations },
        fissures: { data: [], visible: showFissures },
        earthquakes: { visible: showEarthquakes },
        seismometers: { data: [], visible: showSeismometers }
    })

    // Update visibility when local storage changes
    useEffect(() => {
        setLayers(prev => ({
            ...prev,
            berms: { ...prev.berms, visible: showBerms },
            lavaFlows: { ...prev.lavaFlows, visible: showLavaFlows },
            seismicStations: { ...prev.seismicStations, visible: showSeismicStations },
            gpsStations: { ...prev.gpsStations, visible: showGpsStations },
            fissures: { ...prev.fissures, visible: showFissures },
            earthquakes: { visible: showEarthquakes },
            seismometers: { ...prev.seismometers, visible: showSeismometers }
        }))
    }, [showBerms, showLavaFlows, showSeismicStations, showGpsStations, showFissures, showEarthquakes, showSeismometers])

    // Functions to toggle visibility
    const toggleLayer = (layer: keyof MapLayersState) => {
        switch (layer) {
            case 'berms':
                setShowBerms(!showBerms)
                break
            case 'lavaFlows':
                setShowLavaFlows(!showLavaFlows)
                break
            case 'seismicStations':
                setShowSeismicStations(!showSeismicStations)
                break
            case 'gpsStations':
                setShowGpsStations(!showGpsStations)
                break
            case 'fissures':
                setShowFissures(!showFissures)
                break
            case 'earthquakes':
                setShowEarthquakes(!showEarthquakes)
                break
            case 'seismometers':
                setShowSeismometers(!showSeismometers)
                break
        }

        // Dispatch event to update map immediately
        const event = new CustomEvent("mapSettingsChanged", {
            detail: {
                showBerms: layer === 'berms' ? !showBerms : showBerms,
                showLavaFlows: layer === 'lavaFlows' ? !showLavaFlows : showLavaFlows,
                showSeismicStations: layer === 'seismicStations' ? !showSeismicStations : showSeismicStations,
                showGpsStations: layer === 'gpsStations' ? !showGpsStations : showGpsStations,
                showFissures: layer === 'fissures' ? !showFissures : showFissures,
                showEarthquakes: layer === 'earthquakes' ? !showEarthquakes : showEarthquakes,
                showSeismometers: layer === 'seismometers' ? !showSeismometers : showSeismometers,
                enabledFissures
            }
        })
        window.dispatchEvent(event)
    }

    return {
        layers,
        toggleLayer,
        showBerms,
        showLavaFlows,
        showSeismicStations,
        showGpsStations,
        showFissures,
        showEarthquakes,
        showSeismometers,
        enabledFissures,
        setEnabledFissures
    }
}