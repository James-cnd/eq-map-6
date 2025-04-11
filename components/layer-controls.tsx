import { useAdminLayers } from '@/hooks/use-admin-layers'

export function LayerControls({ map }) {
    const { layers, refreshLayers } = useAdminLayers()

    const handleLayerToggle = (layerType) => {
        // Refresh layers when toggling visibility
        refreshLayers()
        // Toggle layer visibility logic here
    }

    return (
        <div className="layer-controls">
            <LayerToggle
                label="Fissures"
                onChange={() => handleLayerToggle('fissures')}
            />
            {/* Other layer toggles */}
        </div>
    )
}