# Accessible Community Communication: learning package prototype

A four-screen HTML/CSS/JavaScript prototype of a short learning package for staff and volunteers at Redland Community Centre (Queensland). It is for design review only. It is not a live course and it is not an official Centre publication.

## How to open it

1. Keep `index.html`, `styles.css` and `script.js` in the same folder.
2. Double-click `index.html`, or drag it into Google Chrome.

You don't need a server, an internet connection, frameworks or any installs. Fonts come from the operating system (Inter if it is installed, otherwise Segoe UI on Windows or the system font on Mac). No web fonts are loaded.

Use the **Prototype screens** menu at the top (Overview, Chapter 5, Assessment, Resources) to move between screens. Each screen has its own address, so the browser Back button works:

| Screen | Address |
|---|---|
| Learning package overview | `index.html#/overview` |
| Chapter 5: Making documents easier to navigate | `index.html#/chapter-5` |
| Assessment activity | `index.html#/assessment` |
| Resources | `index.html#/resources` |

## What works

- **Screen navigation.** Hash-based routing. When you change screen, focus moves to the new page heading, the browser tab title updates and the current menu item is marked with `aria-current="page"`.
- **Accordions.** The transcript, the three word-processor instruction panels (Chapter 5) and the "How this adaptation differs from the original flyer" panel (Assessment) open and close independently, so several can be open at once. Each is a `<button>` that exposes `aria-expanded`.
- **Chapter completion.** **Mark chapter complete** updates the saved chapter list, the journey diagram and the overview chapter list and count. Pressing it again undoes it. A status message announces the change and says that the percentage at the top of the screen is a fixed demonstration value (see Simulated progress below).
- **Progress persistence.** Completed chapters are saved in `localStorage` (see Privacy below).
- **Assessment form validation.** Submitting with missing parts shows an error summary (focused, with links to each field), inline error messages and `aria-invalid`. It also checks that the chosen file ends in `.docx`.
- **Mock submission confirmation.** This lists what would be submitted and states that nothing was sent and no result was generated.
- **Prototype tools (footer notes).** **Simulate Chapters 1 to 4 as completed** saves Chapters 1 to 4 as completed. **Reset all prototype data** clears saved progress. Both now sit inside the collapsed "Prototype notes" control in the footer.
- **Skip link.** "Skip to main content" is the first Tab stop on every screen. It appears when focused and moves focus to `<main>` without changing the address, so the current screen stays in the URL. It works after navigating between screens.
- **Breadcrumbs.** Chapter 5, Assessment and Resources have a `nav` landmark labelled "Breadcrumb" with an ordered list. "Overview" is a working link and the current page is marked with `aria-current="page"`. The Overview has none because it is the top level.
- **Resources.** A new screen, linked from the main navigation. It only gathers material that already exists in the prototype: links to the three other screens, "Before you start" (what you will need, compatible word processors), the Word, LibreOffice Writer and Google Docs instructions, and the two assessment areas. The text is copied from the existing screens. There are no external links.
- **Accessibility menu.** See the next section.
- **Footer.** The large prototype footer is replaced by one small centred line (the required prototype statement). The data-storage notes and the reviewer tools are kept inside a collapsed `<details>` control called "Prototype notes". The "How this prototype stores data" link on the Overview still works: it opens that control and moves focus to the heading.

## Accessibility menu

The **Accessibility** button (top right of every screen) opens a panel of real controls. It needs JavaScript, so without JavaScript it is hidden rather than shown doing nothing. It uses the disclosure pattern: the button has `aria-expanded` and `aria-controls`, focus stays on the button when the panel opens, and Tab moves into the panel. **Esc** closes the panel and returns focus to the button. It also closes when focus tabs out of it or you click elsewhere. Settings are kept in memory only and reset when the page is reloaded.

| Control | What it does |
|---|---|
| Smaller text, Larger text, Reset text size | Steps the text size through 100%, 125%, 150%, 175% and 200% by changing the root font size as a percentage, so it multiplies the browser's own text-size setting. Buttons at a limit use `aria-disabled` so keyboard focus is not lost. At 150% and above the sticky chapter header becomes a normal header so it cannot cover content. |
| Text mode | Plain reading layout with the same headings, instructions and content. Cards, coloured bands, tiles and decorative graphics are removed, the column is narrower and line spacing is larger. Buttons keep their normal look and states. |
| Page mask | Dims the page except for a reading band that follows the mouse pointer, touch, and keyboard focus. The overlay ignores pointer events and is `aria-hidden`, so it does not block clicks, Tab order or screen readers. |
| Print or save as PDF | Closes the menu and calls `window.print()`. The print styles hide navigation, breadcrumbs, the menu, buttons and prototype notes, turn the coloured bands into plain headings, and open all accordion panels so their content prints. |
| Help | Expands concise instructions inside the panel, including browser zoom (Ctrl or Cmd with plus, minus and 0), device text-size settings, the print shortcut, keyboard keys, and read-aloud options in the browser or operating system. |

The toggles show On/Off as words as well as through `aria-pressed`. Native browser zoom, keyboard shortcuts and screen-reader behaviour are not intercepted.

### Menu options deliberately left out

- **Keyboard mode.** The whole prototype is already operable by keyboard, with visible focus indicators always on. A separate "keyboard mode" switch would have changed nothing useful, so it would have been a decorative control. The Help text lists the keys instead.
- **Listen / text to speech.** Browser speech synthesis differs between browsers, voices and operating systems, can clash with a learner's screen reader, and could not be tested reliably here. Help points to tools that already do this well (Read Aloud in Microsoft Edge, Narrator, VoiceOver, Speak Selection, TalkBack).
- **Email and contrast icons from the style frames.** Not requested in this round and not built.

## Simulated progress

This is a demonstration, not recorded learner activity.

- **Chapter 5 shows "40% complete"** and the Assessment shows "49% complete". Both values and bar widths are written directly in the HTML as prescribed demonstration values. They are not calculated from the chapter count (4 of 9 would be about 44%) and saved progress cannot change them.
- **Chapters 1 to 4 are shown as completed** once Chapter 5 or the Assessment has been viewed. This is held in memory only and is never written to `localStorage`. On the Overview the chapter tiles say "Completed (simulated)" and the count says "(simulated)".
- Marking Chapter 5 complete still works and is still saved. The status message says the percentage at the top of the screen is a fixed demonstration value.
- Resetting prototype data clears saved progress. The simulation stays on only while Chapter 5 or the Assessment is showing.
- The Assessment screen gained a progress line (label and bar) so that each screen shows one consistent indicator.

## Implemented features and simulations

| Feature | Status |
|---|---|
| Skip link, breadcrumbs, Resources screen | Implemented |
| Text size, Text mode, Page mask, Print, Help | Implemented |
| Chapter and Assessment progress percentages (40%, 49%) | Simulation: fixed values |
| Chapters 1 to 4 completed on Chapter 5 and Assessment | Simulation: in memory only |
| Mark chapter complete and saved chapter progress | Implemented (browser `localStorage`) |
| Assessment validation | Implemented |
| Assessment submission, file upload, workshop notice download | Mock (nothing is sent or downloaded) |
| Demonstration video and captions | Placeholder |
| Chapters 1 to 4 and 6 to 9, Previous and Next chapter | Not built |
| Keyboard mode, Listen / text to speech | Omitted (see above) |

## What is a mock-up

| Feature | What actually happens |
|---|---|
| Start learning | Opens Chapter 5, because Chapters 1–4 and 6–9 aren't built. The page says so. |
| Video demonstration | A labelled placeholder. There is no video, player or captions. |
| Transcript | A draft script for the planned video. |
| Previous / Next chapter | Shows a message saying that chapter isn't in the prototype. |
| Download workshop notice | No file is downloaded. The full notice is shown on screen as text that learners can copy into a word processor. |
| File upload | The file stays on the device. Only its name is read. Nothing is uploaded. |
| Assessment result | None. The prototype never grades, scores or gives feedback on work. |
| Self-check in Chapter 5 | For reflection only. It isn't saved or marked. |

## Source material

The examples in Chapter 5 and the Assessment are based on an Australian Red Cross EmergencyRedi flyer, "Prepare for The Unexpected – Emergency Planning for Households", for a workshop held at Redland Community Centre on Thursday 4 December 2025. It is used as a historical training example, not an upcoming event.

- **Unchanged from the flyer:** the date, time, venue, address, cost, RSVP details, phone number, email addresses and website.
- **Chapter 5:** a short extract, shown twice. One version uses bold Normal-style text and the other uses Heading 1 and Heading 2 styles. The page explains that the original flyer's heading structure can't be determined from an image.
- **Assessment:** an editable text adaptation with barriers added on purpose (a capitalised title, dense formal wording, bold text instead of headings, merged details and "click here" link text). A panel lists what was kept from the flyer and what was changed for training.

The prototype is not an official Australian Red Cross or Redland Community Centre publication.

## Assessment alignment

| Learning outcome | Assessment evidence |
|---|---|
| 1. Identify and explain communication barriers, considering at least three community groups | Step 3: three required "Community group" fields |
| 2. Revise the notice for plain language and accessible structure, including heading styles, and explain the changes | Steps 2–3: revised .docx, two-domain checklist, two change-and-reason explanations |

## Privacy and persistence

- The only saved data is a list of completed chapter numbers, stored in the browser's `localStorage` under the key `acc-community-comm-prototype-v1`.
- Nothing is sent to a server. There are no accounts, analytics, cookies or third-party requests.
- Progress is tied to one browser profile on one device. Anyone using that profile can see it. Clearing browser data removes it.
- Assessment text and files are never stored.
- The simulated Chapters 1 to 4, the 40% and 49% values and the accessibility menu settings are not stored. The settings reset when the page is reloaded.
- If the browser blocks storage (for example, some private-browsing settings), progress lasts only until the page is reloaded and the Prototype notes in the footer say so.
- Chrome treats each `file://` page as its own origin. If you move the files to another folder, saved progress won't follow them.

## Accessibility decisions (summary)

Comments in all three files explain these decisions in more detail.

- Semantic landmarks (`header`, `nav` for the screens and for breadcrumbs, `main`, `footer`), a skip link, `lang="en-AU"` and one `<h1>` per screen with no skipped heading levels.
- Two-tone focus indicator (dark outline plus yellow halo) using `:focus-visible`.
- `scroll-padding-top` matches the sticky chapter header so focused items aren't hidden behind it. The header stops being sticky on short or narrow viewports, such as high zoom levels or landscape phones.
- Progress is always shown as text ("40% complete", "49% complete", or "4 of 9 chapters completed" on the Overview). The bars and journey diagram are decorative (`aria-hidden`) duplicates.
- Completed states use text and ticks, not colour alone. Form errors use text, an icon and a border.
- Status messages use `role="status"`, so they're announced without moving focus. Error summaries and the confirmation do receive focus.
- The before/after document examples use styled paragraphs rather than real headings, so they don't clutter this page's own heading outline.
- If JavaScript fails, all screens and accordion panels stay visible.
- Text sizes use `rem` and layouts use `flex`/`grid` with wrapping. Text containers have no fixed heights.
- Respects `prefers-reduced-motion` and has basic support for Windows forced-colours (High Contrast) mode.
- The skip link is `position: fixed`, so it is visible when focused even if the page is scrolled.
- Grids use `minmax(min(Xrem, 100%), 1fr)` so columns never force sideways scrolling on narrow screens or at large text sizes.
- The accessibility menu adds print, text size, text mode, page mask and help from the style frames. It does not replace browser zoom or operating-system settings, and the Help text points to them.

### Colour contrast (calculated, not yet tool-verified)

| Pair | Ratio |
|---|---|
| Charcoal `#263238` on page grey `#F2F4F7` | 11.9:1 |
| Muted text `#4A5560` on page grey / white | 6.9:1 / 7.6:1 |
| Navy `#0B3D75` on white (main titles) | 10.8:1 |
| Orange `#A85A00` on white (headings, subtitle) | 5.1:1 |
| Orange `#A85A00` on page grey ("Start learning" link) | 4.6:1 |
| White on RCC blue `#075092` (overview bands, chapter tiles) | 8.2:1 |
| White on course purple `#6A5EB4` (chapter and assessment bands) | 5.4:1 |
| White on plum `#443B73` (primary buttons) | 9.9:1 |
| Plum on soft purple `#E4E0F5` (closed accordions) | 7.7:1 |

Changes made after checking contrast:

- Course purple was darkened from `#7064B5` to `#6A5EB4` so white text in the header bands passes 4.5:1.
- Orange `#A85A00` is the lightest orange that passes 4.5:1 on white.
- Yellow is no longer used as a background or decoration. It remains only as the outer halo of the keyboard focus indicator, so the ring stays visible on the blue and purple bands.
- Form-control borders use `#6B7280` (4.8:1 on white) to meet the 3:1 non-text minimum.

## Testing done so far

Automated browser tests (Playwright driving Google Chrome, opening the files from `file://`) ran at **desktop 1280 x 900, tablet 820 x 1180 and mobile 390 x 844**. 229 checks passed. They covered:

- **Skip link:** first Tab stop on all four screens, visible when focused, Enter moves focus to `<main>`, the address keeps its screen, and it works after navigating by clicking the menu.
- **Breadcrumbs:** one "Breadcrumb" landmark per screen, current item marked, and the Overview link returns to the Overview.
- **Resources:** link in the main navigation, `aria-current`, screen opens, its accordion works from the keyboard.
- **Accessibility menu:** opens with Enter and Space, focus stays on the button, Tab order, Esc closes and returns focus, closes on outside click and when Tab leaves it, `aria-expanded` and `aria-pressed` states, text size steps from 100% to 200% with no horizontal scrolling, Reset, Text mode on and off, Page mask (follows pointer and focus, ignores clicks), Help, and that Print calls `window.print()` and returns focus to the menu button.
- **Progress:** 40% and 49% with saved progress set to nothing, empty, all nine chapters and a single chapter; Chapters 1 to 4 simulated on the Overview without being saved; Mark chapter complete still works.
- **Existing features:** accordions (several open), Simulate and Reset tools, assessment validation (10 errors, error summary focused, `aria-invalid`) and a valid mock submission.
- **Footer:** banner removed, the required text is exact and 14px, notes collapsed by default, and the stored-data link opens them.
- No console or script errors, and no horizontal overflow, on any of the above.

Printing was checked by generating PDFs of each screen from headless Chrome and inspecting them (navigation and controls hidden, headings and content kept, accordion content printed). The real print dialogue was not driven in a visible browser.

This does **not** mean the prototype meets WCAG 2.2 AA.

## Accessibility testing still needed

1. **Screen readers:** NVDA with Chrome or Firefox, JAWS with Chrome, VoiceOver on macOS and iOS (Safari), and TalkBack on Android. Check heading navigation, the accordion state announcements, status messages and the error summary.
2. **Keyboard only:** complete every task across all screens, with no mouse.
3. **Zoom and text:** browser zoom at 200% and 400%, OS-level text scaling, and the WCAG 1.4.12 text-spacing bookmarklet.
4. **Contrast:** confirm the ratios with a tool (for example, the TPGi Colour Contrast Analyser), including hover and focus states.
5. **Forced colours:** Windows High Contrast themes.
6. **Reduced motion:** turn on the OS setting and check that there are no transitions.
7. **Automated scans:** axe DevTools, WAVE or Lighthouse, as a starting point only.
8. **Usability testing with staff and volunteers, including people with disability.** No automated or expert review replaces this.
9. **Content:** check the word-processor menu paths against the versions the Centre actually uses.
10. **Accessibility menu:** test with real screen readers (the menu is a button that reveals a group of buttons, not an ARIA `menu`), with Windows Magnifier and other screen magnifiers, and with Page mask on touch devices.
11. **Real print and PDF output** in Chrome, Edge, Firefox and Safari, including page breaks.

## Known limitations

- Text size, Text mode and Page mask are not saved between page reloads. The menu is part of the header, so it scrolls away with the page and is not available from the middle of a long screen without scrolling up.
- Text size changes text and layout on this page only. Very large text on narrow phones is usable but long.
- Page mask follows the pointer, a finger and keyboard focus. It does not move with the arrow keys alone while you scroll, because the band stays fixed in the window.
- Text mode removes the coloured bands and tiles, but the accordions keep their controls, so the content inside closed accordions still has to be opened.
- Chapter 5 and the Assessment show fixed percentages that do not change as a learner works. 4 of 9 chapters (the count on the Overview) is about 44%, so the Overview count and the 40% value are not the same number by design.
- "Listen" and "Keyboard mode" are not provided (see above).
- Chrome treats each `file://` page as its own origin, so saved progress does not follow the files to a different folder.
- Contrast ratios are calculated, not measured with a tool.

## Suggested next improvements (not built)

- Build a real accessible `.docx` workshop notice and practice file, and link to them.
- Produce the demonstration video with accurate closed captions, and finalise the transcript.
- Add a "Resume where you left off" link on the overview.
- Consider whether learners should be allowed to mark chapters complete out of order.
- Add an accessible 10-minute break timer only if testing shows learners want one.
- Decide how submissions would really reach facilitators (for example, email or the Centre's existing system) before building any back end.
