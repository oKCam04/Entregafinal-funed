function Card({ title, description, children, className = "" }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${className}`}>
      {title && (
        <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
      )}
      {description && (
        <p className="text-gray-600 mb-4">{description}</p>
      )}
      {children}
    </div>
  )
}

export default Card 