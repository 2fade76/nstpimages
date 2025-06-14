
import * as React from "react"

const MOBILE_BREAKPOINT = 768 // Standard md breakpoint for Tailwind

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Add event listener
    mql.addEventListener("change", onChange)
    
    // Initial check
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Cleanup
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Additional hooks for different breakpoints with better mobile-first approach
export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)
  
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsTablet(width >= 768 && width < 1024)
    }
    
    window.addEventListener('resize', handleResize)
    handleResize()
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return !!isTablet
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean | undefined>(undefined)
  
  React.useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    
    window.addEventListener('resize', handleResize)
    handleResize()
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return !!isDesktop
}

// Additional hook for small mobile devices
export function useIsSmallMobile() {
  const [isSmallMobile, setIsSmallMobile] = React.useState<boolean | undefined>(undefined)
  
  React.useEffect(() => {
    const handleResize = () => {
      setIsSmallMobile(window.innerWidth < 480)
    }
    
    window.addEventListener('resize', handleResize)
    handleResize()
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return !!isSmallMobile
}
