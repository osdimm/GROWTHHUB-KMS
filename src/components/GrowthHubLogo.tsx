import React from 'react';

interface GrowthHubLogoProps {
  className?: string;
  iconColor?: string;
  dotColor?: string;
}

export const GrowthHubLogo: React.FC<GrowthHubLogoProps> = ({
  className = 'w-10 h-10',
  iconColor = '#0B2240',
  dotColor = '#FFC800'
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Upper 'g' loop */}
      <path
        d="M 62 48 C 62 30 48 18 33 18 C 18 18 12 32 12 45 C 12 58 22 66 38 66 C 52 66 62 55 62 44"
        stroke={iconColor}
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      {/* Yellow accent dot top-right */}
      <circle cx="68" cy="18" r="9" fill={dotColor} />
      {/* Bottom 'g' bowl / smile */}
      <path
        d="M 22 78 C 30 92 58 92 66 78"
        stroke={iconColor}
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};
