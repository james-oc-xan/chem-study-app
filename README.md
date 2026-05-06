# Nightly Chem Study App

A fresh Expo + TypeScript scaffold dedicated to the nightly chemistry study routine. The app drops you directly into a streamlined camera experience so you can capture lab notes, flashcards, or diagrams in seconds.

## Tech Stack

- [Expo](https://expo.dev/) (SDK 51+) with the blank TypeScript template
- React Native 0.76
- `expo-camera` for the built-in capture flow

## Getting Started

```bash
npm install
npm run start
```

Use the Expo CLI prompts to open iOS Simulator, Android Emulator, or the Expo Go app on a physical device.

## Features

- **Camera-first home screen** powered by `CameraView`
- **Permission awareness**: in-app prompt if camera access has not been granted
- **Front/back switching** plus a single tap capture button
- **Latest capture preview** so you can quickly confirm the photo you just grabbed

## Testing & Nightly Automation

- `npm run generate-tests` scans `App.tsx` + `app/**` for default-exported components and drops snapshot-style smoke tests under `__tests__/`.
- `npm test` / `npm run test:ci` execute the Jest suite via `jest-expo`.
- Nightly automation lives in `scripts/nightly-test-cron.sh`; it ensures deps are installed, generates tests, runs CI, and, when diffs exist, commits + pushes to `automation/nightly-tests` with a summary stored under `.logs/latest-nightly-summary.md`.

## Next Steps

1. Pipe captured image metadata into a persistent flashcard store
2. Annotate captures with question/answer text before saving
3. Sync nightly captures to Supabase for cross-device study sessions

---

Need anything else wired up for tomorrow's study sprint? Open an issue or drop a note and we'll queue it for the next nightly pass.
