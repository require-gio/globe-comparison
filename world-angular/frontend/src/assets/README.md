# Asset Files

## Natural Earth GeoJSON Data

**File needed**: `countries-110m.geojson`

### Download Instructions

1. Visit Natural Earth Data website: https://www.naturalearthdata.com/downloads/110m-cultural-vectors/
2. Download "Admin 0 – Countries" in GeoJSON format
3. Or use direct link: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson
4. Save as `countries-110m.geojson` in this directory

### Alternative: Quick Download

```bash
cd frontend/src/assets
curl -O https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson
mv ne_110m_admin_0_countries.geojson countries-110m.geojson
```

### File Properties

- **Format**: GeoJSON FeatureCollection
- **Resolution**: 110m (1:110,000,000 scale)
- **Size**: ~1.5MB
- **Features**: Country polygons with ISO codes
- **Required property**: `ISO_A2` (2-letter country code)

## Earth Texture (Phase 5)

**File needed**: `earth-texture.jpg`

Will be added in Phase 5 (User Story 3 - Visual Polish)
- NASA Blue Marble texture
- 4K or 8K resolution
- Download from: https://visibleearth.nasa.gov/
