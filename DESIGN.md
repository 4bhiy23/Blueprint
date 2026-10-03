---
name: Blueprint
description: A compact, explicit authoring system for building ordered forms and readable conditional paths.
colors:
  blueprint-blue: "hsl(224 76% 48%)"
  blueprint-blue-bright: "hsl(217 91% 60%)"
  blueprint-wash: "hsl(214 100% 97%)"
  paper: "hsl(40 33% 97%)"
  surface: "hsl(0 0% 100%)"
  ink: "hsl(222 47% 11%)"
  muted-surface: "hsl(210 40% 98%)"
  muted-ink: "hsl(215 16% 47%)"
  grid-line: "hsl(215 28% 90%)"
  destructive: "hsl(0 84% 60%)"
typography:
  title:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.05em"
rounded:
  xs: "2px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  xxl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.blueprint-blue}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
    height: "32px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  field-compact:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px"
    height: "36px"
  rule-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "12px"
  question-node:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "14px"
    width: "256px"
---

# Design System: Blueprint

## Overview

**Creative North Star: "The Working Blueprint"**

Blueprint's authenticated builder is an operational workspace: compact, ordered, and explicit. It uses paper-like surfaces, ink-colored structure, and blueprint blue for selection and action. The interface stays quiet enough for long authoring sessions while keeping the current question, save state, and routing decisions easy to scan.

The builder presents form logic in the language of questions and respondent paths. Question editing and Logic are separate modes in the properties panel. Logic is expressed as ordered rule cards rather than graph editing: priority is visible, conditions are stacked, the all/any relationship is explicit, every rule names its destination, and an Otherwise control defines the path when no rule matches.

**Key Characteristics:**

- Compact three-panel desktop workspace with a fixed top action bar.
- Paper, ink, and blueprint-blue palette with low-contrast panel layering.
- Small, direct labels and restrained iconography for dense authoring controls.
- Canonical question order separated from movable canvas layout.
- Branching shown as a readable priority list with an explicit fallback.
- Dedicated ordered mobile question list below the desktop breakpoint.

## Colors

The palette is a blueprint drawn on warm paper: dark ink provides structure, white and near-white surfaces separate layers, and blue is reserved for focus, selection, and primary action.

### Primary

- **Blueprint Blue:** The active tab, selected node, primary action, rule number, focus ring, and logic emphasis.
- **Bright Blueprint Blue:** The primary-button hover state.

### Neutral

- **Warm Paper:** The application and canvas ground.
- **Clean Sheet:** Cards, fields, nodes, and raised controls.
- **Deep Ink:** Primary text, decisive borders, and structural linework.
- **Quiet Wash:** Low-emphasis panels, grouped controls, and condition backgrounds.
- **Drafting Note:** Secondary text, helper copy, and inactive controls.
- **Grid Line:** Canvas and low-emphasis structural guides.

### Named Rules

**The Blue Means Action Rule.** Use blueprint blue for action, focus, selection, and active routing state; do not turn whole panels blue.

**The Ink Carries Structure Rule.** Text, borders, and connectors establish hierarchy before shadows or decoration do.

## Typography

**Display Font:** Geist (with Arial, Helvetica, and sans-serif fallbacks)

**Body Font:** Geist (with Arial, Helvetica, and sans-serif fallbacks)
**Label/Mono Font:** Geist Mono for status-like metadata where the product already uses it

**Character:** Neutral, compact, and legible. Weight and scale create hierarchy; the builder avoids decorative type so question content and routing controls remain the focus.

### Hierarchy

- **Title** (600, 14px, 1.25): Panel titles, rule titles, node questions, and compact navigation labels.
- **Body** (400–500, 12px, 1.5): Helper text, descriptions, field values, and rule explanations.
- **Label** (600, 10px, 0.05em tracking): Uppercase section labels, condition numbers, metadata, and compact status copy.

### Named Rules

**The Small Is Still Legible Rule.** Ten-pixel text is reserved for short metadata; instructions and editable values remain at twelve pixels or larger.

## Layout

Desktop authoring fills the viewport beneath a 56px top bar. A 240px component library sits left, the React Flow canvas expands in the middle, and a 384px properties panel sits right. Sidebars use borders and subtle surface tint rather than heavy containers. Their content scrolls independently while the canvas keeps pan and zoom controls available.

The properties panel separates **Question** and **Logic** with an equal-width two-tab control. Logic content follows one vertical reading order: explanation, ordered rule cards, add-rule action, then the otherwise fallback. Each rule follows the same internal sequence: priority header, match mode, stacked conditions, add-condition action, and destination.

At widths below 1024px, the visual canvas gives way to a single-column ordered question list capped at 512px. Question order is edited with 44px-minimum actions, and question details open in a full-height dialog. The mobile implementation preserves and validates existing branch rules when questions are moved or removed; rule authoring remains a desktop Logic-mode task in the current product.

**The Order Is Behavior Rule.** The question array is the canonical respondent order. Canvas coordinates only arrange the diagram and must never determine traversal, fallback, persistence order, or destination eligibility.

**The Forward Path Rule.** Rule destinations may only be later questions or form submission. Conditions may reference the current question or an earlier compatible choice or rating question.

## Elevation & Depth

The authenticated builder uses shallow tonal layering, one-pixel structural borders, and restrained shadows. Question nodes and rule cards may lift slightly on hover or selection; selected nodes use a blue outline and soft blue halo. The large offset doodle shadows used elsewhere in Blueprint are reduced inside dense builder panels so they do not compete with form logic.

### Shadow Vocabulary

- **Control:** `0 1px 2px rgb(0 0 0 / 0.05)` for active tabs, compact fields, and rule cards.
- **Selected Node:** `0 0 0 1px hsl(224 76% 48%), 0 0 20px rgb(99 102 241 / 0.15)` for the question being edited.
- **Drag Preview:** `0 25px 50px -12px rgb(0 0 0 / 0.60)` for the temporary question card under the pointer.

**The Flat Workspace Rule.** Keep resting authoring surfaces nearly flat; use depth to communicate interaction state, not decoration.

## Shapes

The builder uses regular, gently rounded geometry. Compact inputs and segmented controls use 6–8px corners, rule and node containers use 12px corners, and numeric priority or count markers use circles. One-pixel borders suit dense panels; dashed borders signal insertion actions and empty states. Canvas handles remain circular and large enough to read as connection points even though connections are derived rather than manually drawn.

## Components

### Buttons

- **Shape:** Compact rectangular controls use gently rounded corners (8px); icon actions use square 28–32px targets on desktop and at least 44px targets on mobile.
- **Primary:** Blueprint blue with white text, medium-to-bold weight, and short horizontal padding. Reserve it for Publish, Done, and the principal creation action.
- **Hover / Focus:** Brighten the blue on hover and show a two-pixel blue focus ring with offset. Active controls translate slightly only where the shared button primitive already does so.
- **Ghost / Outline:** Ghost actions are transparent until hover. Dashed outlines identify additive actions such as Add condition and Add first rule.

### Cards / Containers

- **Corner Style:** Rule cards and question nodes use regular 12px corners.
- **Background:** Clean-sheet surfaces sit over warm paper or a faint muted wash.
- **Shadow Strategy:** A minimal resting shadow; blue outline and halo for selected nodes.
- **Border:** One-pixel ink-derived borders inside the builder, with dashed borders for empty and additive states.
- **Internal Padding:** 12–16px, reduced to 10px for nested condition blocks.

### Inputs / Fields

- **Style:** Compact 36px fields use a one-pixel border, warm-paper background, and 6px corners. Editable question fields may use the shared stronger input treatment where already implemented.
- **Focus:** Two-pixel blueprint-blue ring with a visible outline change.
- **Error / Disabled:** Destructive red marks invalid content; disabled controls remain visible at reduced opacity and preserve their label.

### Navigation

The 56px top bar keeps product identity, editable form title, autosave status, Preview, and Publish in one line. In the properties panel, Question and Logic are peers rather than nested sections. The active mode uses a paper surface and small shadow; the inactive mode remains quiet but visible. Logic shows a count badge only when rules exist.

### Question Node

The 256px canvas card contains a type header, question title, compact answer preview, and optional required badge. Selection is communicated with border, halo, and active handles rather than position. Start, sequential otherwise, and submit connections are derived from question order.

### Branch Rule Card

Rule cards are numbered in priority order and include explicit up, down, and delete actions. The all/any control sits next to “When.” Conditions are stacked and numbered; each uses a compatible question, operator, and value control. A tinted “Then go to” row names a later question or Submit form. After all cards, an otherwise container computes and states the next canonical question or submission target. The first matching rule wins.

## Do's and Don'ts

### Do:

- **Do** keep Question and Logic as separate, equally discoverable editing modes.
- **Do** show rule priority as both order and a visible number, and renumber after every move or deletion.
- **Do** say that rules run top to bottom and the first matching rule wins.
- **Do** keep all/any selection adjacent to the condition list it governs.
- **Do** show an explicit destination in every rule and an Otherwise destination after the list.
- **Do** derive sequential canvas edges and fallback behavior from canonical question array order.
- **Do** preserve keyboard labels, focus rings, and text cues so color is never the only state signal.

### Don't:

- **Don't** infer respondent order from x/y canvas coordinates.
- **Don't** allow a branch to target the same question, an earlier question, or an unknown node.
- **Don't** hide priority in storage or connector geometry; it must be readable and directly reorderable.
- **Don't** mix question-content fields into the Logic mode or branching controls into the Question mode.
- **Don't** hide the fallback behavior; let builders continue to the next question, jump forward, or submit.
- **Don't** bring the public site's exaggerated doodle borders and offset shadows into nested logic controls.
