# 🎨 Fish Fight Simulator — Design Guide

A consistent UI/UX guideline for building the mobile app with Expo + React Native.  
Inspired by the reference design (dark background, colorful stat cards, rounded UI).

---

## 🌑 Color Palette

| Purpose         | Color (hex) | Notes                          |
|-----------------|-------------|--------------------------------|
| Background      | `#121212`   | Dark base, high contrast       |
| Card base       | `#1E1E1E`   | Slightly lighter than bg       |
| Text primary    | `#FFFFFF`   | Main text                      |
| Text secondary  | `#AAAAAA`   | Labels, captions               |
| Accent teal     | `#00BFA6`   | Info / active                  |
| Accent red      | `#FF5252`   | Alerts / danger                |
| Accent yellow   | `#FFD54F`   | Warnings / highlights          |
| Accent blue     | `#40C4FF`   | Info / fish status             |
| Accent cyan     | `#29B6F6`   | Graph fills, water animation   |

---

## 🔲 Components

### 1. **Cards**
- Shape: `rounded-2xl`  
- Shadow: soft, low elevation  
- Padding: `p-4` minimum  
- Variants:
  - Stat card (colored background, white text)
  - Data card (neutral background with colored tags)

### 2. **Tags / Labels**
- Rounded pill shape (`rounded-full`)  
- Small, bold text  
- Colors: teal (ok), red (alert), yellow (warning), cyan (info)

### 3. **Toolbar / Header**
- Dark background, sticky top  
- Icon buttons on left/right  
- Title in center with fish icon

### 4. **Buttons**
- Primary: filled, rounded-full, teal background  
- Secondary: outlined, white border  
- Icon buttons: circular, 48x48

### 5. **Gauges / Charts**
- **Tension gauge**: circular arc (SVG)  
- **Line-out meter**: horizontal progress bar  
- **Graph**: smooth line chart (blue line on dark background)

---

## 📐 Layout & Spacing

- **Screen padding**: 16px (default safe margin)  
- **Card spacing**: 12–16px between cards  
- **Grid**: two-column layout for stat cards  
- **Section headers**: bold text, margin-top `mt-6`

---

## 🔤 Typography

| Use case       | Size | Weight | Notes                  |
|----------------|------|--------|------------------------|
| Title          | 20–24px | Bold   | Screen headers         |
| Card headline  | 16–18px | Bold   | Fish name, stat title  |
| Body text      | 14–16px | Regular| Descriptions           |
| Labels/tags    | 12–14px | Semi   | Uppercase optional     |

---

## 🎞 Animations

- **Screen transitions**: fade + slide from right  
- **Card entry**: fade-in with small upward motion  
- **Gauge updates**: spring easing on tension meter  
- **Event toasts**: slide-down from top, auto-dismiss  

---

## 🛠 Interaction Guidelines

- **Tap feedback**: use haptics (`expo-haptics`)  
- **Errors (breakoff)**: red flash + error haptic  
- **Success (landed)**: teal flash + success haptic  
- **Audio cues**: prepared but ignored for now (stub only)

---

## 🧭 Navigation Flow

1. **Home (Fish Select)**  
   - Grid/list of fish with search  
   - Tap → Fish detail

2. **Fish Detail**  
   - Card layout: stats, habitat, fight profile  
   - Play button at bottom

3. **Simulation**  
   - Gauges: tension, line-out  
   - Event notifications  
   - Pause/End controls

4. **History (optional later)**  
   - List of past sessions (cards)  

---

## 📱 Example Layouts

- **Home screen**: grid of stat cards (color-coded)  
- **Details screen**: stacked cards with info + Play button  
- **Simulation screen**: large gauges + minimal chrome  

---
