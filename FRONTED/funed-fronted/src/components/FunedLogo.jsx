import { useState } from 'react'

function FunedLogo({ 
  size = 'md', 
  className = '', 
  showBackground = false, 
  invert = false,
  backgroundSize = 'default',
  ...props 
}) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Ruta al archivo PNG del logo desde la carpeta public
  const logoSrc = '/logo.png'
  
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto', 
    lg: 'h-16 w-auto',
    xl: 'h-20 w-auto',
    '2xl': 'h-32 w-auto',
    '3xl': 'h-40 w-auto'
  }
  
  const backgroundSizes = {
    small: 'p-3',
    default: 'p-6',
    large: 'p-8'
  }
  
  const baseClasses = `${sizeClasses[size]} object-contain ${className}`
  const filterClasses = invert ? 'filter brightness-0 invert' : ''
  
  if (imageError) {
    return (
      <div className={`${baseClasses} flex items-center justify-center bg-gray-200 rounded`}>
        <span className="text-gray-500 font-bold text-sm">FUNED</span>
      </div>
    )
  }
  
  const logoElement = (
    <img 
      src={logoSrc}
      alt="FUNED Logo" 
      className={`${baseClasses} ${filterClasses} ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
      onLoad={() => setImageLoaded(true)}
      onError={() => {
        console.error('Error loading FUNED logo:', logoSrc)
        setImageError(true)
      }}
      style={{ transition: 'opacity 0.3s ease-in-out' }}
      {...props}
    />
  )
  
  if (showBackground) {
    return (
      <div className={`bg-white rounded-full shadow-2xl ${backgroundSizes[backgroundSize]}`}>
        {logoElement}
      </div>
    )
  }
  
  return logoElement
}

export default FunedLogo 