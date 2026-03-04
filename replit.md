# Quick Math — Expo App

## Overview
Quick Math is a mobile app that keeps users mentally sharp by presenting math problems as overlay cards during phone sessions. Built with Expo Router (Expo SDK 54) and Express backend.

## Architecture

### Frontend (Expo / React Native)
- **Routing**: Expo Router file-based routing, Stack navigation
- **State**: React Context (`context/AppContext.tsx`) with AsyncStorage persistence
- **Fonts**: Plus Jakarta Sans (headings, buttons) + Nunito (body, labels)
- **Design**: Indigo accent (#4F46E5), white background, surface cards

### Backend (Express / Node.js)
- Express server on port 5000
- Serves landing page and static Expo files

## App Structure

```
app/
  _layout.tsx            # Root layout with font loading, all providers
  index.tsx              # Entry — redirects based on onboarding state
  (onboarding)/          # First-launch only flow
    language.tsx         # Language selection (EN/Telugu/Hindi)
    otp.tsx              # Phone verification (+91)
    privacy.tsx          # Privacy notice
    permission.tsx       # Overlay permission request
  (main)/                # Main app
    home.tsx             # Home screen with session controls
    settings.tsx         # Settings with all toggles
    subscribe.tsx        # Premium subscription plans
    about.tsx            # About screen

components/
  AppCard.tsx            # Surface card with indigo shadow
  PrimaryButton.tsx      # Full-width pill button with spring animation
  OutlineButton.tsx      # Bordered accent button
  TappableSettingRow.tsx # Label + underlined value row
  SlideToStartButton.tsx # Drag-to-start thumb slider
  CountdownRing.tsx      # SVG arc countdown (indigo → red last 5s)
  AnswerOptionButton.tsx # Letter badge + answer text, 4 animated states
  QuizCard.tsx           # Full quiz modal with timer, answers, close

context/
  AppContext.tsx          # All app state, session management, quiz flow

lib/
  math.ts                # Math question generator (+ − × ÷, 3 difficulty levels)
  storage.ts             # AsyncStorage helpers, settings defaults

constants/
  colors.ts              # Design system colors
  strings.ts             # i18n strings for EN/Telugu/Hindi
```

## Key Features
- **Onboarding**: Language → OTP → Privacy → Overlay Permission (once only)
- **Math Engine**: +/−/×/÷ across Easy/Medium/Hard with adaptive difficulty
- **Session Timer**: Slide to start, first card at 45s, then every N minutes
- **Quiz Cards**: 15s countdown, answer locking, reveal at timer complete
- **Settings**: Session duration (5–60 min), frequency (30s–5 min), toggles
- **Premium**: Strict mode gated behind subscription (UPI payment deep link)
- **i18n**: English, Telugu, Hindi strings

## Workflows
- **Start Backend**: `npm run server:dev` (port 5000)
- **Start Frontend**: `npm run expo:dev` (port 8081)

## Notes
- Foreground service overlay (SYSTEM_ALERT_WINDOW) and Quick Settings Tile require a native Android build
- Firebase Auth SMS requires native Firebase setup
- EncryptedSharedPreferences requires native build
- All in-app features (quiz, settings, onboarding) work in Expo Go
