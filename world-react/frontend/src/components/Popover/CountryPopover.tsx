import { useEffect, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { motion, AnimatePresence } from 'framer-motion';
import { useHoverStore } from '../../store/hoverStore';
import { useCountryData } from '../../services/api/countryApi';

const POPOVER_SHOW_DELAY_MS = 200;

export function CountryPopover() {
  const { hoveredCountryIso, hoveredCountryName, mousePosition, isHovering } = useHoverStore();
  const [showPopover, setShowPopover] = useState(false);
  const [delayedIso, setDelayedIso] = useState<string | null>(null);
  
  const { data: countryData, isLoading, error } = useCountryData(delayedIso);
  
  // Add delay before showing popover
  useEffect(() => {
    let timer: number | null = null;
    
    if (isHovering && hoveredCountryIso) {
      timer = window.setTimeout(() => {
        setShowPopover(true);
        setDelayedIso(hoveredCountryIso);
      }, POPOVER_SHOW_DELAY_MS);
    } else {
      setShowPopover(false);
      setDelayedIso(null);
    }
    
    return () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, [isHovering, hoveredCountryIso]);
  
  if (!showPopover || !mousePosition) {
    return null;
  }
  
  return (
    <Popover.Root open={showPopover}>
      <Popover.Anchor
        style={{
          position: 'fixed',
          left: mousePosition.x,
          top: mousePosition.y,
          pointerEvents: 'none'
        }}
      />
      <AnimatePresence>
        {showPopover && (
          <Popover.Portal forceMount>
            <Popover.Content
              side="right"
              sideOffset={15}
              align="start"
              className="z-50"
              style={{ pointerEvents: 'none' }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-2xl min-w-[280px] max-w-[400px]"
                style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)' }}
              >
                {isLoading && (
                  <div className="text-gray-300 text-sm">
                    <div className="animate-pulse">Loading country data...</div>
                  </div>
                )}
                
                {error && (
                  <div className="text-white">
                    <h3 className="font-semibold text-lg mb-2">
                      {hoveredCountryName || hoveredCountryIso}
                    </h3>
                    <p className="text-red-400 text-sm">
                      Unable to load country information
                    </p>
                  </div>
                )}
                
                {countryData && !isLoading && (
                  <div style={{ color: 'white' }}>
                    <h3 className="font-semibold text-xl mb-3" style={{ color: '#93C5FD' }}>
                      {countryData.name}
                    </h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Capital:</span>
                        <span className="font-medium" style={{ color: 'white' }}>{countryData.capital || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Population:</span>
                        <span className="font-medium" style={{ color: 'white' }}>
                          {countryData.population 
                            ? Number(countryData.population).toLocaleString() 
                            : 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Area:</span>
                        <span className="font-medium" style={{ color: 'white' }}>
                          {countryData.area_km2 
                            ? `${Number(countryData.area_km2).toLocaleString()} km²` 
                            : 'N/A'}
                        </span>
                      </div>
                      
                      {countryData.continent && (
                        <div className="flex justify-between">
                          <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Continent:</span>
                          <span className="font-medium" style={{ color: 'white' }}>{countryData.continent}</span>
                        </div>
                      )}
                      
                      {countryData.languages && countryData.languages.length > 0 && (
                        <div className="flex justify-between">
                          <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Languages:</span>
                          <span className="font-medium" style={{ color: 'white' }}>{countryData.languages.join(', ')}</span>
                        </div>
                      )}
                      
                      {countryData.currency_code && (
                        <div className="flex justify-between">
                          <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Currency:</span>
                          <span className="font-medium" style={{ color: 'white' }}>
                            {countryData.currency_name || countryData.currency_code}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </Popover.Content>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
}
