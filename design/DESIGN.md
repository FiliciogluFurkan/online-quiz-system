---
name: Academic Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444651'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#002e44'
  on-tertiary: '#ffffff'
  tertiary-container: '#004565'
  on-tertiary-container: '#36b6fb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#c9e6ff'
  tertiary-fixed-dim: '#89ceff'
  on-tertiary-fixed: '#001e2f'
  on-tertiary-fixed-variant: '#004c6e'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  button-text:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The brand personality is authoritative yet accessible, designed to foster a focused environment for both educators and students. It prioritizes clarity over decoration, ensuring that the interface never distracts from the primary task: learning and assessment. 

The design style follows a **Corporate Modern** aesthetic with high-density information architecture. It leverages generous whitespace and a rigorous grid to create a sense of institutional reliability. The emotional response should be one of "calm focus"—reducing the anxiety typically associated with testing through clean layouts and predictable interactions.

## Colors

The palette is anchored by a deep **Academic Blue** (#1e3a8a), symbolizing trust, stability, and intelligence. This is used for primary actions and core branding elements. An **Indigo accent** (#4f46e5) is utilized for interactive states and focus indicators to provide a modern SaaS feel.

Neutral tones are strictly selected from the Slate scale to maintain a professional, cool-toned environment. Backgrounds utilize very light grays to define zones without the harshness of pure white on large displays, reducing eye strain during long examination sessions.

## Typography

**Manrope** is selected as the sole typeface for the design system due to its exceptional legibility and modern, geometric structure. It bridges the gap between technical precision and human-centric design.

In an academic context, hierarchy is critical. We use tight letter spacing for large displays to maintain impact and standard spacing for body copy to ensure readability during reading-heavy quizzes. Headlines utilize a semi-bold weight to establish clear section breaks. Turkish character support (ğ, ü, ş, İ, ö, ç) must be verified across all weights to ensure consistent rendering for the local UI.

## Layout & Spacing

The layout utilizes a **Fixed Grid** system for desktop to prevent content stretching, which can hinder reading comprehension. A 12-column grid is used for the dashboard and landing pages, while a centered, single-column "Focus Container" (max-width: 800px) is used for the actual examination interface.

Spacing follows a strict 8px linear scale. Large-scale sections are separated by 64px or 80px to provide breathing room, while internal card elements are grouped using 16px or 24px units. 

### Breakpoints:
- **Mobile (<640px):** Single column, 16px margins.
- **Tablet (640px - 1024px):** 8 columns, 24px margins.
- **Desktop (>1024px):** 12 columns, 1280px max-width centered.

## Elevation & Depth

This design system employs a **Tonal Layering** approach combined with **Ambient Shadows**. Instead of heavy drop shadows, we use low-opacity (4-8%) blurs with a slight blue tint (#1e3a8a at low opacity) to make cards appear as if they are resting naturally on the surface.

- **Level 0 (Background):** #F8FAFC (Slate 50).
- **Level 1 (Cards/Sidebar):** Pure White (#FFFFFF) with a 1px border (#E2E8F0).
- **Level 2 (Hover states/Modals):** Subtle 12px blur shadow to indicate interactivity.

This creates a "flat-plus" look that feels professional and institutional, avoiding the trendiness of heavy glassmorphism.

## Shapes

The shape language is **Soft (Level 1)**. In an academic environment, overly rounded "pill" shapes can feel too casual, while sharp corners can feel dated and aggressive. 

- **Small elements (Checkboxes, Tags):** 4px radius.
- **Medium elements (Buttons, Inputs, Cards):** 8px radius.
- **Large elements (Hero sections, Modals):** 12px radius.

Icons should follow a consistent 2px stroke weight with slightly rounded terminals to match the typeface characteristics.

## Components

### Buttons
- **Primary:** Deep Blue background, white text. High contrast. "Sınava Başla" (Start Exam).
- **Secondary:** Outline style with 1px Slate-200 border and Indigo text. "Geri Dön" (Go Back).

### Role Cards (Educator/Student)
Cards feature a white background, a light border, and a subtle shadow. They include a "Top-Accent" bar in the primary color to denote importance. Icons are centered, monochrome, and clear.
*   *Label:* "Öğretmen Paneli" or "Öğrenci Girişi".

### Input Fields
Strict, rectangular fields with 8px corner radius. Labels are always persistent above the field. Error states use a professional brick-red, avoiding overly bright neon reds.
*   *Placeholder:* "E-posta adresinizi girin".

### Navigation
A minimalist top bar with a height of 72px. It uses a White background with a subtle bottom border (#E2E8F0). Links are in Slate-600, shifting to Primary Blue on hover.

### Quiz Interface
A "Progress Bar" is pinned to the top of the viewport during exams. Question numbers are displayed in a grid of small squares, with "Current", "Answered", and "Flagged" (Boş Bırakılan) states clearly distinguished by color-coded backgrounds.