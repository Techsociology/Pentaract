import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        const theme = isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [isDark]);

    return (
        <button 
            onClick={() => setIsDark(!isDark)}
            style={{
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                border: 'none',
                background: 'transparent',
                fontSize: '1.2rem'
            }}
            title="Toggle Dark Mode"
        >
            {isDark ? '☀️' : '🌙'}
        </button>
    );
};

export default ThemeToggle;