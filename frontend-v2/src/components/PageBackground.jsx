import React from 'react';

/**
 * PageBackground - Renders a full-screen blurred nature background
 * with a dark gradient overlay. Content is layered above via z-index.
 *
 * Props:
 *   image  – path to the background image (from /public)
 *   blur   – CSS blur value (default: "10px")
 */
const PageBackground = ({ image, blur = '10px' }) => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden">
            {/* Blurred background image */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: `blur(${blur})`,
                    transform: 'scale(1.1)', // prevents blur edge artifacts
                }}
            />
            {/* Dark gradient overlay */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'linear-gradient(to bottom, rgba(10,20,40,0.55), rgba(10,20,40,0.75))',
                }}
            />
        </div>
    );
};

export default PageBackground;
