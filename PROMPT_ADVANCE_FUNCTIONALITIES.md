# MemoDams — Google AI Studio / Project IDX Advancement Prompt

> **Instructions for Google AI Studio / Project IDX**:
> Paste this entire prompt into the prompt box in Google AI Studio or Project IDX once you import this repository.

---

```markdown
You are an expert full-stack developer working on **MemoDams**, a secure personal digital vault and diary web application built with Next.js 15 (App Router), React 18, Tailwind CSS, Lucide icons, shadcn/ui, Genkit AI, and Firebase.

### Context & Current State of the Codebase:
1. **Core Setup**: All TypeScript errors and Next.js 15 async header issues have been completely fixed (`tsc --noEmit` passes cleanly).
2. **Crash Prevention**: `FirebaseErrorListener` has been updated to avoid throwing unhandled runtime exceptions when Firebase services are re-initializing or missing permissions.
3. **Configuration**: `src/firebase/config.ts` has been upgraded to support dynamic environment variables while allowing automatic zero-arg initialization (`initializeApp()`) for Google AI Studio / Firebase App Hosting native DB integrations.
4. **Rules Ready**: `firestore.rules` and `storage.rules` are already in the repository root defining security rules for users, notes, files, and shared notes.

---

### Step 1: Attach & Initialize the Native Firebase Database
1. Use the native **"Add Firebase" / "Add Database"** integration feature in Google AI Studio / Project IDX to provision a fresh Firebase backend.
2. Confirm the following Firebase services are active:
   - **Firebase Authentication**: Email/Password and Google Sign-In providers enabled.
   - **Cloud Firestore**: Database created in production or test mode matching `firestore.rules`.
   - **Firebase Storage**: Default bucket configured matching `storage.rules`.
3. Verify that the client SDK (`src/firebase/index.ts`) initializes via the automatic App Hosting environment variables or falls back to the newly provisioned project config.

---

### Step 2: Implement Missing Dashboard Media Features
Implement the following routes that were referenced in server actions but need full UI pages:
1. **`/dashboard/photos` (Photo Gallery)**:
   - Grid layout of uploaded photos for the current user (`users/{userId}/files` where `fileType.startsWith('image/')`).
   - Image upload button with drag-and-drop support, uploading to Firebase Storage path `users/{userId}/photos/{fileName}`.
   - Fullscreen photo modal / lightbox with zoom, date taken, and delete option (invoking `deleteFileAction`).
2. **`/dashboard/videos` (Video Vault)**:
   - Video card list for user's uploaded videos with thumbnail previews.
   - Video upload capability to Firebase Storage path `users/{userId}/videos/{fileName}`.
   - HTML5 video player modal with playback controls.
3. **`/dashboard/files` (Documents & Files Vault)**:
   - Table or card list showing document name, file size (formatted in KB/MB), upload date, and download button.
   - Upload support for PDFs, docs, and archives to `users/{userId}/documents/{fileName}`.

---

### Step 3: Enhance Notes with AI & Search
1. **AI Note Assistant (Genkit + Gemini 2.5 Flash)**:
   - In `src/app/dashboard/notes/[noteId]/page.tsx`, add an **"AI Assist"** menu:
     - **Summarize Note**: Generates a concise TL;DR of lengthy notes using the existing Genkit instance in `src/ai/genkit.ts`.
     - **Generate Title**: Automatically suggest a catchy, relevant title from raw note content.
     - **Fix Grammar & Polish**: Formats and cleans up note drafts into polished markdown.
2. **Search & Tag Filtering**:
   - In `src/app/dashboard/notes/page.tsx`, add real-time client-side search by title/content and tag pills for instant filtering.

---

### Step 4: Share & QR Code Export
1. **Public Sharing**: Verify `src/app/actions/share-note.ts` works with the new database.
2. **QR Code Dialog**: In `src/app/dashboard/notes/[noteId]/page.tsx`, generate and render a scannable QR code (using the installed `qrcode` library) for any note that has been made public, allowing easy sharing to mobile devices.

---

### Execution Constraints:
- Maintain full TypeScript safety (`npm run typecheck` must always pass).
- Ensure all Firestore operations adhere to the security rules defined in `firestore.rules`.
- Preserve the existing UI theme (dark modern aesthetic, primary purple `#673AB7`, accent teal `#00BCD4`).
```
