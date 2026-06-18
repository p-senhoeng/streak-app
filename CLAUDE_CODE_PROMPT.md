# Claude Code — Kickoff Prompt

> **How to use this:** Put `CLAUDE.md`, `ARCHITECTURE.md`, `BUILD_PLAN.md`, `README.md`,
> `Streak App B.dc.html`, and `ios-frame.jsx` in your project folder. Open Claude Code in that
> folder. Paste the prompt below as your first message.
>
> **Why a separate prompt vs CLAUDE.md:** `CLAUDE.md` is *durable* context Claude Code re-reads
> every session (conventions, what the project is). This prompt is the *task* — the thing you want
> done now. Keeping them separate means you don't have to re-paste the conventions every time.

---

## The prompt

```
We're building the Android streak-tracking app described in this repo — Android only, for my own
personal use (the finish line is a standalone APK on my phone). Before writing any code, read these
in order: CLAUDE.md, ARCHITECTURE.md, BUILD_PLAN.md, README.md, and the prototype
Streak App B.dc.html. Ignore ios-frame.jsx beyond understanding the intended frame — do not
port it; the design files are iOS-styled, so match the look but render with Android primitives.

Stack: Expo (managed) + React Native + TypeScript (strict), @react-navigation/native-stack,
React Context + useReducer for state, AsyncStorage for persistence, react-native-reanimated
for animation, expo-haptics, react-native-svg. Match README.md's visual spec faithfully and
keep all design tokens in src/lib/theme.ts.

Critical: use the date-based data model from ARCHITECTURE.md §2 — persist loggedDates as local
YYYY-MM-DD keys and DERIVE count/best/loggedToday/calendar/7-day-strip. Do NOT copy the
prototype's day-number + ±1-count approach; that's demo-only. Watch the timezone pitfall:
never use toISOString() for a date key.

Android specifics (ARCHITECTURE.md §6): shadows via elevation, bundle Inter for weight-800
headings, use useSafeAreaInsets() instead of hardcoded top padding.

Work through BUILD_PLAN.md phase by phase. After each phase, run `npx tsc --noEmit` and
`npm test`, then STOP and summarize what you built and how I can verify it before moving to the
next phase — don't build the whole app in one go.

Start with Phase 0 (scaffold) and Phase 1 (theme + types), then pause for my review. The last phase
is building an installable APK (eas build -p android) so I can use it on my phone without a dev server.

If anything in the design is ambiguous (e.g. exactly when a streak should count as broken),
tell me your assumption and proceed rather than asking me to clarify every small thing.
```

---

## Tips while it builds
- **Review at every checkpoint.** When it pauses, actually run the app / read the diff. Catching a
  wrong pattern at Phase 2 is cheap; catching it at Phase 7 is not.
- **Push back on the data model specifically.** If you ever see it storing `count` as a field that
  gets `+1`/`-1`, stop it — that's the prototype hack sneaking back in.
- **Ask it to explain a choice you don't understand** rather than accepting it. "Why a Set here?
  Why this babel plugin?" — that's how the senior-dev knowledge transfers.
- **Test the timezone case yourself**: set your device clock near midnight and confirm logging
  records the right day.
```
