import './CarImage.css';

/**
 * Renders a car photo, or a branded placeholder when the car has no unique
 * photo yet. The demo repository ships one generic JPG for every car, so the
 * seeder deliberately leaves imageUrl empty and every card shows this instead
 * of pretending to show the actual vehicle.
 */
const CarImage = ({ imageUrl, brand = '', model = '', className = '', compact = false }) => {
    const label = `${brand} ${model}`.trim();

    if (imageUrl) {
        return (
            <img
                className={className}
                src={imageUrl}
                alt={label || 'Rental car'}
                loading="lazy"
            />
        );
    }

    return (
        <div
            className={`car-image-placeholder${compact ? ' is-compact' : ''} ${className}`.trim()}
            role="img"
            aria-label={`${label || 'Rental car'} — photo coming soon`}
        >
            <svg
                className="car-image-placeholder__glyph"
                viewBox="0 0 160 64"
                aria-hidden="true"
                focusable="false"
            >
                <path
                    d="M12 45h136M28 45a10 10 0 1 0 20 0m64 0a10 10 0 1 0 20 0M22 45V33l14-4 18-13h44l18 13 18 4v12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            {!compact && (
                <span className="car-image-placeholder__label">
                    {label || 'Photo coming soon'}
                </span>
            )}
        </div>
    );
};

export default CarImage;
