---
trigger: manual
---

You are an expert in React + Capacitor development for building high-quality, high-performance hybrid mobile applications for the ComboCoach Boxing ecosystem.

Key Principles:

Performance First: Ensure 60fps animations and millisecond-accurate timers for boxing rounds.
Hybrid Excellence: Write platform-aware code that feels native on iOS/Android while maintaining web compatibility.
Feedback & Cues: Utilize Haptics and Audio cues effectively to guide users through workouts without looking at the screen.
Offline Reliability: The app must function perfectly in the gym without a stable internet connection.
Premium Aesthetics: Follow a dark-mode first, high-contrast design suitable for high-intensity training environments.
Core Concepts:

Navigation: React Router DOM (Data APIs/V7) for seamless page transitions.
Capacitor Integration: Leverage @capacitor/haptics for punch cues and @capacitor/preferences for local storage.
Styling: Semantic HTML5 with high-performance Vanilla CSS, Flexbox, and Grid. Use clsx for lean conditional styling.
Responsiveness: Mobile-first design that scales beautifully from tight phone screens to tablets used as gym monitors.
State Management:

Zustand: Primary engine for global app state (Workouts, Active Session, User Preferences).
Persistence: Use Zustand middleware or @capacitor/preferences for local-first data caching.
Optimized Selectors: Use fine-grained state selectors to prevent unnecessary re-renders during active timers.
Performance Optimization:

Timer Accuracy: Use requestAnimationFrame or high-precision browser timers for workout clocks.
Asset Handling: Optimize local audio files and SVGs for instant playback and low memory footprint.
List Rendering: Use efficient mapping and memoization for long lists of drills or activity logs.
Vite Power: Utilize HMR for rapid iteration and tree-shaken production builds.
Architecture:

Feature-based structure: Organize by logic (e.g., src/features/timer, src/features/workouts).
Separation of Concerns: Keep workout logic (sequencing, intervals) separate from UI components.
Utility-first logic: Centralize boxing math (round timings, calories, punch counts) in src/utils.
Testing & QA:

Device-on-Device: Frequent testing via npx cap run to verify haptics and audio behavior on real hardware.
Logic Validation: Vitest for workout sequence generation and timer logic.
Security: Follow established security audit principles (HSTS, CSP) to protect user training data.
Best Practices:

TypeScript: Strict type safety for Workout definitions and State models.
Native APIs: Graceful fallbacks for web-only environments (e.g., mock haptics on desktop).
Battery Efficiency: Minimize background processing and heavy UI updates when the timer is running.
Accessibility: High-contrast visuals and clear audio/haptic feedback for users wearing boxing gloves.
Summary of Changes:

Changed React Native to React + Capacitor.
Swapped React Navigation for React Router DOM.
Replaced Reanimated with CSS Animations/Vanilla JS.
Focused on Zustand instead of Redux.
Added specific focus on Boxing app mechanics (Haptics, Audio cues, Timer accuracy).
Reflected your project's use of Vite and Capacitor plugins.