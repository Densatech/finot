
---

## 11. Frontend rebuild (2026-09-28)

This work is on the frontend branch `hardening/backend-contract`. It is committed locally and **not pushed**.

**Speed:**
- Every page is code-split.
- Public pages no longer wait for the logged-in user to load.
- The user's profile data loads with 3 requests in parallel instead of one after another.
- TanStack Query caching, so pages no longer refetch everything on every visit.
- Firebase and the Amharic/Oromo translations load only when needed.
- framer-motion, sweetalert2, react-icons, @dnd-kit and json-server were removed.
- The logo went from 507 KB to 21 KB; the gallery photos are now lazy-loaded WebP (5.7 MB → 2.9 MB).
- Initial JavaScript is ~195 KB gzipped, split into cacheable chunks. Before, it was one 985 KB bundle (289 KB gzipped).

**Integration fixes:**
- Every screen now uses the backend's real field names and response shapes.
- Lists load every page of results instead of stopping at 20.
- Error messages show what the backend actually said, instead of "Request failed with status code 400".
- Toasts now appear.
- Roles: a user keeps all their roles, and SuperAdmins pass every role check.
- One token refresh is shared by all requests that fail at the same time; logout invalidates the session on the server.
- Donations send the backend's fund codes, so they work in Amharic and Oromo too.
- The course attendance tab no longer crashes, and the coordinator pages work.
- Answer moderation works.
- The notifications page and unread badge are live.
- Onboarding banner is driven by the backend's `is_complete` flag.
- Ministry preferences are submitted in one request, so a failure no longer deletes the old choices.
- The contact form opens an email with the message pre-filled.
- Push notifications are opt-in.

**Look and feel:**
- One Finot navy/yellow system across the app:
  - navy page headers and hero bands
  - a yellow active item in the sidebar
  - navy/yellow stat tiles
  - segmented tabs
  - a split layout on the auth pages
- A tinted page background instead of flat white.
- No blur, no dark widgets, no infinite animations. Motion is reduced for users who ask for it.
- Accessible labels throughout.

**Checks:** `tsc` has 0 errors, `eslint` is clean, and 15 unit tests pass. The backend has 116 tests.

**To do before deploying:**
- Set `VITE_API_URL` in Vercel.
- Merge the frontend and backend branches together.
- Seed translations: the new UI strings have English defaults only; add them to `am.json` and `om.json`.
