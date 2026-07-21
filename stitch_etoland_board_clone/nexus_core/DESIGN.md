---
name: Nexus Core
colors:
  surface: '#fbf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#434656'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#737688'
  outline-variant: '#c3c5d9'
  surface-tint: '#004dea'
  primary: '#0041c8'
  on-primary: '#ffffff'
  primary-container: '#0055ff'
  on-primary-container: '#e3e6ff'
  inverse-primary: '#b6c4ff'
  secondary: '#006e0c'
  on-secondary: '#ffffff'
  secondary-container: '#8ff780'
  on-secondary-container: '#00730d'
  tertiary: '#972500'
  on-tertiary: '#ffffff'
  tertiary-container: '#c13301'
  on-tertiary-container: '#ffe1d9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b3'
  secondary-fixed: '#92fa83'
  secondary-fixed-dim: '#77dd6a'
  on-secondary-fixed: '#002201'
  on-secondary-fixed-variant: '#005307'
  tertiary-fixed: '#ffdbd1'
  tertiary-fixed-dim: '#ffb5a0'
  on-tertiary-fixed: '#3b0900'
  on-tertiary-fixed-variant: '#872100'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
  surface-alt: '#F7F9FA'
  success-light: '#EBF7EB'
  border-subtle: '#E2E8F0'
  text-muted: '#64748B'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-desktop: 24px
  container-max-width: 1200px
---

## Brand & Style

The design system is engineered for high-density information exchange, prioritizing clarity, efficiency, and professional reliability. The target audience consists of active community members who value rapid content consumption and structured discussions. 

The design style is **Corporate / Modern** with a focus on high-density utility. It utilizes a structured grid, subtle tonal layering, and purposeful blue accents to create a trustworthy environment. By modernizing the traditional forum aesthetic, the design system replaces cluttered borders with generous white space and systematic typographic scales, evoking an organized, "news-portal" atmosphere that remains inviting for long-form reading.

## Colors

The palette is anchored by a vibrant **Primary Blue (#0055FF)**, which serves as the main driver for interaction and navigation, replacing the legacy site's more muted tones with a modern, digital-first accent. 

- **Primary:** Used for links, primary buttons, and active states.
- **Secondary:** A legacy-inspired forest green, reserved for "Verified" badges, community milestones, or positive sentiment indicators.
- **Neutral:** A deep charcoal for primary text, ensuring high legibility against the white and light-gray surfaces.
- **Surface-alt:** Employed for sidebar backgrounds and secondary content containers to create subtle visual separation without heavy borders.

## Typography

This design system uses **Hanken Grotesk** for headlines to provide a sharp, contemporary edge, while **Inter** is used for all functional and body text to maximize readability in high-density data views.

The hierarchy is built for "scanning." Post titles use `headline-md` to stand out in lists, while metadata (author, timestamp, view count) utilizes `body-sm` or `label-sm` in a muted color. Line heights are kept tight but comfortable to allow for more content "above the fold" while maintaining a professional editorial feel.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop, centering content within a 1200px container to ensure readability across large monitors. 

- **Grid:** A 12-column system is used. Main forum feeds typically span 8 or 9 columns, while sidebars (Trending, User Profile, Ads) span the remaining 3 or 4.
- **Rhythm:** A 4px baseline shift is used for all spacing. Elements should use multiples of 4 (8, 16, 24, 32) for padding and margins.
- **Mobile:** On mobile devices, the layout transitions to a single-column fluid flow with 16px side margins. Sidebars are either hidden or moved into a bottom-drawer/tab navigation system.

## Elevation & Depth

Visual hierarchy is achieved primarily through **Tonal Layers** and **Low-contrast outlines**. 

- **Surface Levels:** The base background is white (`#FFFFFF`). Secondary sections like sidebars or "pinned" posts use the `surface-alt` (`#F7F9FA`) background.
- **Outlines:** To keep the UI clean, use 1px borders in `border-subtle` instead of shadows for most cards and list items. 
- **Elevation:** Shadows are reserved for floating elements like dropdown menus, modals, or hovering states of cards. These should be "Ambient Shadows"—soft, diffused, and using a low-opacity neutral tint (e.g., `rgba(51, 51, 51, 0.08)`) with a 12px to 20px blur.

## Shapes

The shape language is **Soft** (0.25rem/4px). This subtle rounding maintains a professional, systematic feel suitable for a corporate-inflected community board, avoiding the overly "bubbly" look of consumer social media while still feeling modern.

- **Small Components:** Checkboxes and small tags use the base 4px radius.
- **Large Components:** Cards and main content containers use the `rounded-lg` (8px) radius to distinguish them from smaller UI elements.

## Components

- **Buttons:** Primary buttons use the Primary Blue with white text. Ghost buttons use a `border-subtle` outline. Use 4px corner radii and `label-md` for button text.
- **Input Fields:** Fields should have a white background, a 1px `border-subtle` outline, and `body-md` text. The active state is indicated by a 1px Primary Blue border.
- **Cards:** Used for forum categories or individual post previews. Cards should have no shadow but a subtle border. Pinned posts within a card-list should have a `surface-alt` background.
- **Chips/Badges:** Used for category tags (e.g., "Humor", "News"). These use a light-gray background with `text-muted` and `label-sm` typography. 
- **Lists:** The core of the board. List items should have a hover state that changes the background color to `surface-alt`. Use a thin horizontal divider between items.
- **Checkboxes & Radios:** These should be crisp and small, using Primary Blue for the selected state to ensure high visibility.
- **Thread Indicators:** Use small, circular `secondary` (green) dots to indicate "new" or "unread" content within a thread list.