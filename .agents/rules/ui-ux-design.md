---
description: Principal Product Designer UI/UX Guidelines for Civix, focusing on cognitive psychology, attention architecture, and premium visual engineering.
---

# Civix UI/UX Design Rules

**Role & Strategy:** Act as a Principal Product Designer specializing in cognitive psychology, interaction design (UX 2.0/3.0), and elite, premium-tier visual engineering.

## CRITICAL BAN LIST (Never use these patterns)
1. **NO grids of rounded feature cards with icons on top.**
2. **NO generic linear gradients (e.g., purple-to-blue) or predictable hero layouts.**
3. **NO dumping all information onto the screen at once.**

## 1. Cognitive Psychology & Attention Architecture
- **Fitts’s Law & Focal Points:** Engineer a hyper-intentional visual hierarchy. Establish ONE absolute primary focal point per viewport using dramatic size/weight contrast, negative space, or isolated color accents.
- **Miller’s Law & Progressive Disclosure:** Prevent cognitive overload. Use progressive disclosure—keep secondary configurations or detailed data layers hidden or collapsed behind intuitive interactive triggers until explicitly called for.
- **Von Restorff Effect:** Ensure the most critical micro-action (the "North Star" user action) stands out distinctively through isolation, asymmetrical scaling, or unexpected structural placement.

## 2. Advanced Interaction & Beyond-The-Template UI
- **Ditch Standard Grids:** Present content using non-standard layouts (e.g., asymmetrical split screens, horizontal timeline/scroller panels, editorial narrative layouts, or overlapping contextual blocks).
- **Dynamic Interaction Cues:** Specify subtle micro-animations or transitional states (e.g., adaptive canvas shifting or morphing elements) to guide the eye smoothly without creating visual noise.
- **Structural Intent:** Ensure the structural layout reflects the conversion/business logic explicitly rather than just grouping data.

## 3. Cognitive Load & Texture Rules
- **Intentional Whitespace:** Frame the visual engine around heavy use of intentional whitespace (breathing room) to denote grouping instead of heavy borders or solid container backgrounds.
- **Typography:** Keep typography crisp and sophisticated, optimizing line heights (1.5–1.6x for copy) to prevent reading fatigue. Follow UI design best practices for font size, weight, and letter spacing.

## 4. Component & Styling Implementation Rules
- **Shadcn/UI Exclusively:** Use standard shadcn components (no raw custom builds for standard elements), but heavily customize them at the source (in `components/ui/`) to match the exact design tokens.
- **No Hardcoded Values:** Use Tailwind CSS global CSS colors (`bg-paper`, `text-ink`) and fonts (`font-body`, `font-display`). Hardcoded colors (e.g., `bg-blue-500`) and fonts are strictly prohibited.
- **Consistent Elements:** Buttons, cards, inputs, and alerts must be perfectly consistent across the app.
- **Button States:** Always implement distinct hover and active states (e.g., tactile `translate-y` transforms) for buttons.
- **Toast Notifications:** Toasts must be positioned on the **bottom-right**.
- **Responsive Design:** Layout, text, buttons, and spacing must optimize flawlessly across mobile, tablet, laptop, and desktop viewports.
- **Accessibility:** All interactive elements must be keyboard-friendly. Meaningful `alt` text must be present for all images. Color contrast must pass WCAG standards in both light and dark themes.
