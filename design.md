# Design Specification & Architecture for AVANTGARDE PREMIER

This document details the visual identity, functional architecture, and technical state of the AVANTGARDE PREMIER interactive template. This file is prepared for seamless integration and continuation within Google's **Stitch AI** development environment.

---

## 1. Visual Identity & Typography

The design is engineered around a luxurious boutique aesthetic, incorporating spacious negative space, rich gold tones, and elegant modern typography.

- **Primary Display Typography (Serif)**: `Cormorant Garamond` (serif) is utilized for titles, subheadings, and italicized narrative quotes to project historical heritage and classical prestige.
- **Body & Tagline Typography (Sans-serif)**: `Manrope` (sans-serif) is applied to navigational anchors, system statuses, UI controls, and catalog statistics to ensure pixel-perfect geometric legibility.
- **Color Palette**:
  - `Gold Accent`: `#D4AF37` (used for interactive triggers, borders, and premium badges).
  - `#000000` / `#0A0A0A` (deep graphite blacks for extreme contrast and premium dark mode atmosphere).
  - High-precision translucent backdrops: `backdrop-blur-md` and `bg-black/60` to ensure readability over ambient backgrounds.

---

## 2. Interactive Local Video Engine (IndexedDB)

To completely bypass external hosting limitations & security firewalls (giving instant, zero-latency loading), the background video system is built to support pure client-side persistence:

- **State Management**:
  - `videoSource` (State): Tracks the active source of the background trailer, either a local blob object URL, a default video path (`/building.mp4`), or an external reference URL.
  - `isCustomVideo` (Boolean): Identifies whether a user-customized video is currently loaded to show the contextual reset trigger.
- **Storage Subsystem (`src/lib/videoDb.ts`)**:
  - Powered by standard browser **IndexedDB** (`AvantgardeVideoDb` under the `Videos` object store).
  - Saves file drag-and-drop payloads or picked files directly as binary blobs mapped to the key `heroVideo`.
  - Automatically loads and assigns a dynamic resource `URL.createObjectURL(blob)` during initial React thread boot (`useEffect` hook).
- **Fallback Recovery**:
  - Fallback is handled instantly on a `<video onError={...}>` hook, reverting elegantly to a cinematic, globally unblocked premium trailer.

---

## 3. UI/UX Interface Modules

1. **Ambient Drag & Drop Field**: The main viewport acts as an active drop zone. Dragging any media file onto the screen reveals an immersive dark overlay instructing the user to drop the file to import it.
2. **Boutique Settings Drawer**: Positioned discreetly in the bottom-right corner, triggering a custom backdrop panel that handles:
   - Direct manual file picking.
   - Text field input for absolute web paths (.mp4 streams).
   - Real-time import & file serialization feedback.
   - Hot-swap restoration functionality to return to default presets.
3. **Template/Test Labeling**: Clean "ТЕСТОВЫЙ ШАБЛОН" tags and labels are applied to visual elements to highlight the template nature of the layout for client reviews.

---

## 4. Full Code Structure

- **`/src/index.css`**: Configures the high-contrast typography hierarchy, imports `Cormorant Garamond` & `Manrope` from Google web fonts, and declares Tailwind premium CSS values.
- **`/src/App.tsx`**: Main visual application tree. Orchestrates GSAP parallax layers, sound modes, interactive sliders, booking modals, and coordinates the local video state machine.
- **`/src/lib/videoDb.ts`**: Pure asynchronous implementation of the IndexedDB wrapper handling standard transaction schemas, insertion put operations, read executions, and key invalidation clearers.
