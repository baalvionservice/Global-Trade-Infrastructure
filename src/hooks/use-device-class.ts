'use client';

import { useState, useEffect } from 'react';

/**
 * @file use-device-class.ts
 * @description Centralized breakpoint engine for Baalvion OS.
 * Standardizes UI restructuring across four primary device classes.
 */

export type DeviceClass = 'mobile' | 'tablet' | 'laptop' | 'desktop';

export function useDeviceClass() {
  const [device, setDevice] = useState<DeviceClass>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 768) setDevice('mobile');
      else if (w < 1024) setDevice('tablet');
      else if (w < 1280) setDevice('laptop');
      else setDevice('desktop');
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    device,
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isLaptop: device === 'laptop',
    isDesktop: device === 'desktop',
    isHandheld: device === 'mobile' || device === 'tablet',
  };
}
