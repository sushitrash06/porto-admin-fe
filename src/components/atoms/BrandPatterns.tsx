/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * FlowRibbonPattern: Layered organic curved ribbons inspired by the Foliowalaweh F logo.
 * Designed for light warm-white backgrounds, section headers, hero backdrops, and promotional banners.
 */
export const FlowRibbonPattern: React.FC<{
  className?: string;
  intensity?: 'subtle' | 'vibrant';
  position?: 'top-right' | 'bottom-left' | 'center' | 'full';
}> = ({
  className = '',
  intensity = 'subtle',
  position = 'top-right',
}) => {
  const opacity = intensity === 'vibrant' ? '0.22' : '0.12';

  const positionClasses = {
    'top-right': 'top-0 right-0 w-[500px] h-[400px]',
    'bottom-left': 'bottom-0 left-0 w-[450px] h-[350px]',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px]',
    'full': 'inset-0 w-full h-full',
  }[position];

  return (
    <div
      className={`absolute pointer-events-none select-none overflow-hidden ${positionClasses} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 600 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="flowViolet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B6CF6" stopOpacity={opacity} />
            <stop offset="100%" stopColor="#8B6CF6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="flowBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4697F5" stopOpacity={opacity} />
            <stop offset="100%" stopColor="#4697F5" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="flowYellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFC45B" stopOpacity={opacity} />
            <stop offset="100%" stopColor="#FFC45B" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Layer 1: Violet sweep */}
        <path
          d="M100 -50 C 250 80, 420 40, 580 180 C 650 240, 680 320, 650 420 L 650 -50 Z"
          fill="url(#flowViolet)"
        />

        {/* Layer 2: Blue sweep */}
        <path
          d="M0 60 C 180 160, 360 120, 500 280 C 580 360, 600 420, 560 480 L 650 480 L 650 150 Z"
          fill="url(#flowBlue)"
        />

        {/* Layer 3: Warm Yellow accent */}
        <path
          d="M250 320 C 380 260, 480 310, 620 440 L 650 450 L 400 450 Z"
          fill="url(#flowYellow)"
        />
      </svg>
    </div>
  );
};

/**
 * DotGridPattern: Clean, evenly-spaced subtle dot grid with soft lavender/slate tint.
 */
export const DotGridPattern: React.FC<{
  className?: string;
  dotColor?: string;
  dotSize?: number;
  spacing?: number;
}> = ({
  className = '',
  dotColor = '#8B6CF6',
  dotSize = 1.5,
  spacing = 24,
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none opacity-[0.07] ${className}`}
      aria-hidden="true"
      style={{
        backgroundImage: `radial-gradient(${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
      }}
    />
  );
};

/**
 * SparkleAccent: Friendly 4-point star matching the brand icon.
 */
export const SparkleAccent: React.FC<{
  size?: number;
  color?: string;
  className?: string;
}> = ({
  size = 18,
  color = '#FFC45B',
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      aria-hidden="true"
    >
      <path
        d="M12 2C12 7.5 14.5 10 20 10C14.5 10 12 12.5 12 18C12 12.5 9.5 10 4 10C9.5 10 12 7.5 12 2Z"
        fill={color}
      />
    </svg>
  );
};
