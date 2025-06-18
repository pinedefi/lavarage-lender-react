# LAVARAGE Brand Implementation Guide

## Overview

This document provides implementation guidelines for using LAVARAGE brand components and styling in the lender React application.

## Logo Assets

The application uses the official LAVARAGE brand assets located in `/public/`:

### Available Assets
- `Lavarage-Logo-Horizontal.png` - Full horizontal logo with text
- `Lavarage-Logomark.png` - Logo mark/symbol only
- `Lavarage-Logo-Stacked.png` - Stacked logo variant
- `Lavarage-Logotype.png` - Text-only logotype

### Usage Guidelines
- Use `horizontal` variant in headers and main branding areas
- Use `mark` variant for favicons, loading states, and compact spaces
- Use `stacked` variant for square format applications
- Use `logotype` variant when you need text-only representation
- Always set `priority={true}` for above-the-fold logos
- Include appropriate `alt` text for accessibility

## Brand Components

### LavarageLogo

The main logo component using real LAVARAGE brand assets:

```tsx
import { LavarageLogo } from '@/components/brand';

// Horizontal logo (default) - uses Lavarage-Logo-Horizontal.png
<LavarageLogo variant="horizontal" size="lg" priority={true} />

// Logo mark only - uses Lavarage-Logomark.png
<LavarageLogo variant="mark" size="xl" />

// Stacked variant - uses Lavarage-Logo-Stacked.png
<LavarageLogo variant="stacked" size="md" />

// Logotype only - uses Lavarage-Logotype.png
<LavarageLogo variant="logotype" size="sm" />
```

**Props:**
- `variant`: 'horizontal' | 'mark' | 'stacked' | 'logotype'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- `className`: string
- `priority`: boolean (for important logos that should load first)

### GradientText

For branded typography with gradient effects:

```tsx
import { GradientText } from '@/components/brand';

<GradientText variant="primary" size="xl" weight="bold" as="h1">
  LAVARAGE Title
</GradientText>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'subtle'
- `size`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
- `weight`: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'
- `as`: HTML element type

### LoadingSpinner

Branded loading component:

```tsx
import { LoadingSpinner } from '@/components/brand';

<LoadingSpinner 
  size="lg" 
  showLogo={true} 
  message="Loading your data..." 
/>
```

## Brand Colors

### Primary Colors
- Yellow: `#FFDD6F` - `lavarage-yellow`
- Orange: `#FFB467` - `lavarage-orange`
- Coral: `#FF845C` - `lavarage-coral`
- Red: `#FF433F` - `lavarage-red`

### Secondary Colors
- Burgundy: `#A51809` - `lavarage-burgundy`
- Purple: `#C58FA1` - `lavarage-purple`
- Blue-Purple: `#9264D7` - `lavarage-blue-purple`
- Blue-Gray: `#D9D9ED` - `lavarage-blue-gray`
- Gray: `#787888` - `lavarage-gray`

### Usage Examples

```tsx
// Text colors
<p className="text-lavarage-coral">Coral text</p>
<h1 className="text-lavarage-red">Red heading</h1>

// Background colors
<div className="bg-lavarage-yellow">Yellow background</div>
<div className="bg-lavarage-subtle">Subtle background</div>

// Border colors
<div className="border border-lavarage-orange/30">Orange border</div>
```

## Brand Gradients

### CSS Classes
- `bg-lavarage-primary` - Main brand gradient
- `bg-lavarage-secondary` - Secondary gradient
- `bg-lavarage-subtle` - Subtle gradient overlay

### Tailwind Utilities
```css
/* Custom gradients available */
bg-gradient-to-r from-lavarage-yellow to-lavarage-red
bg-gradient-to-br from-lavarage-coral to-lavarage-red
```

## Button Variants

### Standard Buttons
```tsx
import Button from '@/components/ui/Button';

// Primary LAVARAGE button
<Button variant="lavarage">Action Button</Button>

// Primary with gradient
<Button variant="primary">Primary Action</Button>

// Outlined with brand colors
<Button variant="outline">Outlined Button</Button>

// Ghost with brand hover
<Button variant="ghost">Ghost Button</Button>
```

## Badge Variants

```tsx
import Badge from '@/components/ui/Badge';

// LAVARAGE branded badge
<Badge variant="lavarage">LAVARAGE</Badge>

// Primary with brand colors
<Badge variant="primary">Active</Badge>
```

## Card Components

### LAVARAGE Cards
```tsx
// Use the card-lavarage class for branded cards
<div className="card-lavarage p-6">
  <h2>Card Title</h2>
  <p>Card content</p>
</div>

// Glass effect with LAVARAGE tinting
<div className="glass-lavarage p-4">
  <p>Glass card content</p>
</div>
```

## Animation Classes

### Loading States
```tsx
// LAVARAGE branded loading spinner
<div className="loading-lavarage h-8 w-8"></div>

// Gradient animations
<div className="bg-lavarage-primary animate-gradient-x">
  Animated gradient
</div>
```

### Hover Effects
```tsx
// Branded hover effects
<button className="hover:bg-lavarage-subtle transition-all duration-300">
  Hover me
</button>

// Scale and shadow on hover
<div className="hover:scale-105 hover:shadow-xl transition-all duration-300">
  Interactive element
</div>
```

## Best Practices

### Typography
- Use `GradientText` for important headings and brand elements
- Apply `font-bold` or `font-extrabold` for LAVARAGE brand voice
- Use `tracking-tight` for modern, geometric look

### Color Usage
- Primary colors for main actions and brand elements
- Secondary colors for supporting elements
- Use opacity modifiers (e.g., `/20`, `/30`) for subtle effects

### Spacing and Layout
- Use consistent spacing with Tailwind utilities
- Apply `card-lavarage` for main content containers
- Use `space-y-6` or `gap-6` for consistent vertical rhythm

### Interactive Elements
- Always include `transition-all duration-300` for smooth animations
- Use `hover:scale-105` for subtle hover effects
- Apply `hover:shadow-xl` for elevation on hover

## Component Examples

### Dashboard Header
```tsx
<div className="flex items-center justify-between mb-8">
  <div>
    <GradientText variant="primary" size="3xl" weight="bold" as="h1">
      Dashboard
    </GradientText>
    <p className="text-gray-600">
      Monitor your <span className="font-semibold text-lavarage-coral">LAVARAGE</span> performance
    </p>
  </div>
  <Button variant="lavarage">
    <Plus className="h-4 w-4 mr-2" />
    Create Offer
  </Button>
</div>
```

### Stat Card
```tsx
<div className="card-lavarage p-6 hover:shadow-2xl transition-all duration-300">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-600 mb-2">Total Value</p>
      <GradientText variant="primary" size="2xl" weight="bold">
        $125,000
      </GradientText>
    </div>
    <div className="p-4 rounded-full bg-lavarage-primary">
      <TrendingUp className="h-6 w-6 text-white" />
    </div>
  </div>
</div>
```

### Loading State
```tsx
<div className="flex items-center justify-center py-12">
  <LoadingSpinner 
    size="lg" 
    showLogo={true} 
    message="Loading your LAVARAGE data..." 
  />
</div>
```

## Integration Checklist

- [ ] Update all page headers to use `GradientText`
- [ ] Replace generic buttons with LAVARAGE variants
- [ ] Apply `card-lavarage` to main content containers
- [ ] Use brand colors for status indicators
- [ ] Implement `LoadingSpinner` for loading states
- [ ] Add hover effects with brand colors
- [ ] Update badges to use LAVARAGE variant
- [ ] Ensure consistent spacing and typography
- [ ] Test responsive behavior on all screen sizes
- [ ] Verify accessibility with sufficient color contrast

This brand implementation maintains the professional, modern aesthetic while establishing strong LAVARAGE brand recognition throughout the application.
