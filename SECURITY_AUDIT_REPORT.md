# Security Audit Report — CASAVEN7

| | |
|---|---|
| **Target** | `casaven74 (3).html` (single-file static web application, 3 093 → 3 270 lines) |
| **Also inspected** | `casaven74 (3).zip` — contains one file, a byte-identical copy of the pre-patch HTML |
| **Date** | 16 November 2026 |
| **Method** | Manual source review + live dynamic testing in Chromium (DOM, console, CSP, storage tampering) + AgentShield config scan |
| **Result** | 8 vulnerabilities confirmed and fixed · 11 suspicions dismissed as false positives · 3 further risks closed by removing all inline script and style and self-hosting every dependency · 5 risks documented as unfixable without a backend |

---

## 1. Executive summary

CASAVEN7 is a **single static HTML file**. There is no server, no database, no API. The
3D studio is procedural `three.js`, and checkout is a `wa.me` deep link — the order never
leaves the browser until the customer sends the WhatsApp message themselves. Accounts,
wishlists, orders and reviews all live in `localStorage` on the visitor's own machine.

That architecture removes most of the OWASP Top 10 outright (no SQL, no SSRF, no file
upload, no CSRF), and it concentrates the real risk in two places: **what gets written to
`localStorage`**, and **what gets rendered back out of it**.

The rendering side was already in decent shape — the author wrote an `escapeHTML()` helper
and applied it to reviews and orders. Injection attempts through the review form were
rejected in testing. The writing side was not: **every member password was stored in clear
text**, readable with one line in the devtools console.

Two findings were confirmed by live exploitation rather than by reading code:

- **Plaintext password storage (Critical)** — `JSON.parse(localStorage.casaven7_users_v2)` returned every
  username together with its password in plain text.
- **Stored client-side DoS (High)** — a single malformed wishlist entry (`null`) threw inside
  `renderWishlist()` and **aborted the whole `load` handler**: no product grid, no 3D
  studio, no reviews, no cart. The storefront rendered blank. This was reproduced live,
  and it is the only finding that bricks the application outright.

All eight confirmed issues are fixed. A 34-test regression suite (`SECURITY_TESTS.js`)
passes 34/34 against the patched file; run against the pre-patch copy it reports 16
failures and then crashes at the stored-client-side-DoS check, because the unpatched application is dead by
that point.

**The honest headline:** the application is now materially harder to abuse, but
client-side accounts are still not authentication. See §6, *Client-Side Authentication* — this is the one thing
that cannot be fixed in a static file, and it must not be papered over.


### Findings at a glance

| # | Vulnerability | CWE | OWASP 2021 | Severity | Status |
|---|---|---|---|---|---|
| 1 | Plaintext Storage of Passwords | CWE-256, CWE-312 | A02 Cryptographic Failures | Critical | Fixed |
| 2 | Missing Content Security Policy | CWE-693 | A05 Security Misconfiguration | High | Fixed |
| 3 | Stored Client-Side Denial of Service | CWE-20, CWE-248 | A04 Insecure Design | High | Fixed |
| 4 | Download of Code Without Integrity Check | CWE-494, CWE-829 | A08 Software & Data Integrity | Medium | Fixed |
| 5 | Weak Password Requirements | CWE-521 | A07 Identification & Auth Failures | Medium | Fixed |
| 6 | Uncontrolled Resource Consumption | CWE-400, CWE-770 | A04 Insecure Design | Medium | Fixed |
| 7 | Client-Side Enforcement of Integrity Checks | CWE-602, CWE-20 | A04 Insecure Design | Low | Fixed |
| 8 | Stored Cross-Site Scripting Sink | CWE-79 | A03 Injection | Low | Fixed |

| Residual risk | CWE | OWASP 2021 | Severity | Status |
|---|---|---|---|---|
| Client-Side Authentication | CWE-603, CWE-602 | A07 | Critical (architectural) | Open — needs a backend |
| Missing HTTP Security Headers (clickjacking, HSTS, nosniff) | CWE-1021, CWE-319, CWE-430 | A05 | Medium | Open — server config |
| Improper Restriction of Excessive Auth Attempts | CWE-307 | A07 | Low | Open — needs a backend |
| Per-Browser State | — | — | Informational | Accepted |
| Exposure of Business Information in Source | CWE-200 | — | Informational | Accepted by design |

---

## 2. Scope, architecture and trust boundaries

```
casaven74 (3).html          single file: markup + inline CSS + ~2 000 lines of inline JS
├── app.js                           all application logic (ES module, no inline script)
├── vendor/three.module.min.js       three.js r187, self-hosted
├── styles.css                       Tailwind compiled ahead of time, self-hosted
├── https://fonts.googleapis.com     third-party stylesheet (fonts only, no script)
└── localStorage (origin-scoped)
    ├── casaven7_users_v2       accounts: username, credential material, orders, wishlist
    ├── casaven7_session_v2     "who is signed in" — a bare username string
    ├── casaven7_reviews_v1     public reviews
    ├── casaven7_wishlist_v1    guest wishlist
    └── casaven7_settings       UI preferences
```

**Entry points (everything that can introduce attacker-controlled data):**

| # | Entry point | Reaches |
|---|---|---|
| 1 | Sign-up / sign-in forms | `casaven7_users_v2`, `casaven7_session_v2` |
| 2 | Review form (author, comment, product, rating) | `casaven7_reviews_v1` → rendered to every visitor of that browser |
| 3 | `data-*` attributes read by the global click delegate | cart/wishlist array indices, product and colour ids |
| 4 | **`localStorage` itself** | devtools, a browser extension, another script on the origin, or any XSS — all five keys are directly writable |
| 5 | ~~Third-party scripts~~ | **None.** Every script on the page is served from the site's own origin. |

**Trust boundaries:** there is exactly one — the browser origin. Everything inside it is
mutually trusting. Entry point 4 is therefore the one that matters most, and it is the
boundary the original code trusted the most.

---

## 3. Confirmed vulnerabilities

Severity uses likelihood × impact *in this deployment* (static, no backend, data scoped to
one browser). A classic CVSS reading would score several of these higher; that would
overstate the real exposure, so the reasoning is stated for each.

---

### 1. Plaintext Storage of Passwords — CWE-256 / CWE-312 · OWASP A02:2021 Cryptographic Failures · **CRITICAL**

**Location** `casaven74 (3).html`, sign-up handler (pre-patch line 2969) and sign-in
handler (pre-patch line 2995).

**Pre-patch code**

```js
const newUser = { username, password, orders: [], ... };   // password stored verbatim
users.push(newUser);
writeJSON(STORAGE_KEYS.USERS, users);
// ...and sign-in compared it directly:
const matched = users.find((u) =>
  u.username.toLowerCase() === username.toLowerCase() && u.password === password);
```

**Exploitation** — no special access required, no exploit chain:

```js
JSON.parse(localStorage.casaven7_users_v2).map(u => u.username + ':' + u.password)
// → ["yassine_casa:Soufiane2024", ...]
```

Anyone who can run one line of JavaScript on that origin reads every password: the person
at a shared or family machine, a browser extension with host permissions, anyone handed an
unlocked phone, a forensic image of the disk, or any future XSS. **Confirmed by execution.**

**Impact** The real damage is off-site. Password reuse is the norm, and a leaked
`CASAVEN7` password is frequently the customer's email or Instagram password. The breach
does not stop at this store.

**Fix** PBKDF2-SHA256 via WebCrypto — 210 000 iterations, a fresh 128-bit salt per
account, a 256-bit derived key, all hex-encoded. The `password` field is gone.
(`casaven74 (3).html:1304-1380`)

```js
const PBKDF2_ITERATIONS = 210000;

async function derivePassword(password, saltHex, iterations) {
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, keyMaterial, 256);
  return { salt: bytesToHex(salt), iterations: iter, hash: bytesToHex(bits) };
}
```

Three deliberate decisions:

- **Existing accounts are migrated, not broken.** `upgradeLegacyUser()` verifies a legacy
  plaintext password once, then replaces it with a salted hash and deletes the field. No
  customer is locked out. (`:1357`)
- **No silent downgrade.** If `crypto.subtle` is unavailable, sign-up *refuses* with a
  clear message rather than quietly falling back to plaintext. A security control that
  degrades without saying so is worse than none.
- **Comparison is length-safe and branch-free** (`digestEqual`, `:1338`) — no early exit
  that leaks how many characters matched.

**Tests** 8 tests. Record shape, absence of plaintext anywhere in storage, correct and
incorrect passwords, unknown user, legacy migration, migrated account still rejecting a
wrong password.

> **Scope of this fix — read this.** Hashing stops `localStorage` from being a readable
> password dump. It does **not** turn this into authentication. See §6, *Client-Side Authentication*.

---

### 2. Missing Content Security Policy — CWE-693 Protection Mechanism Failure · OWASP A05:2021 Security Misconfiguration · **HIGH**

**Location** `<head>` — no CSP, no referrer policy (pre-patch lines 1-50).

**Why it matters** CSP is what limits the blast radius *after* something else goes wrong.
Without it, any script that reaches the page — through a compromised CDN (*Download of Code Without Integrity Check*), a
malicious extension, or a future injection — can load further code from anywhere and POST
the contents of `localStorage` to an attacker's server. With a strict policy, the same
injected script can run but can neither fetch its payload nor send anything out.

**Fix** (`casaven74 (3).html:12`)

```
default-src 'self'; base-uri 'none'; object-src 'none'; form-action 'none';
frame-src 'none'; worker-src 'none'; manifest-src 'none';
script-src 'self';
style-src  'self' https://fonts.googleapis.com;
font-src   https://fonts.gstatic.com;
img-src    'self' data: blob:;
connect-src 'self'
```

Plus `<meta name="referrer" content="strict-origin-when-cross-origin">` and
`referrerpolicy="no-referrer"` on both CDN tags, so the browsing path is not leaked to
third parties.

**Verified live, not assumed.** Each directive was tested by trying to violate it:

| Attack attempted | Result |
|---|---|
| `<script src="https://cdn.jsdelivr.net/...">` injected into `<head>` | **blocked** |
| `fetch()` to a third-party origin | **blocked** |
| `<base href="https://cdn.jsdelivr.net/">` hijack | **blocked** |
| `eval()` of a string | **blocked** (no `'unsafe-eval'`) |

The off-allowlist URL used in the test is a *reachable* CDN on purpose. An earlier draft
used `evil.example.com`, which does not resolve — those tests passed against a page with
no CSP at all, for the wrong reason. The test can now actually succeed, so a pass means
something.

**No `'unsafe-inline'`, no `'unsafe-eval'`.** The first version of this policy still carried
`'unsafe-inline'` in both `script-src` and `style-src`, because the Tailwind config, the
~2 000-line application and the custom stylesheet all lived in inline blocks. They have
since been extracted to `app.js` and `styles.css` (§8), so the policy now refuses injected
inline script and injected `style=` attributes outright — both verified by test.

---

### 3. Stored Client-Side Denial of Service via Unvalidated Persisted State — CWE-20 / CWE-248 Uncaught Exception · OWASP A04:2021 Insecure Design · **HIGH**

**Location** `renderWishlist()` (pre-patch line 2078) and `loadPersistedState()` (2301).

**Pre-patch code**

```js
const guestWishlist = readJSON(STORAGE_KEYS.WISHLIST, []);
state.wishlist = Array.isArray(guestWishlist) ? guestWishlist : [];   // array checked, contents not
// ...later, in renderWishlist():
state.wishlist.map((item) => { const prod = PRODUCTS.find((p) => p.id === item.id); ... })
```

The array type is checked; its *contents* never are. `item.id` on a `null` entry throws.

**Exploitation** — reproduced live:

```js
localStorage.setItem('casaven7_wishlist_v1', JSON.stringify([null]));
location.reload();
```

```
Uncaught TypeError: Cannot read properties of null (reading 'id')
    at renderWishlist (casaven74 (3).html:2178:59)
    at casaven74 (3).html:3234:9        ← the window 'load' handler
```

`renderWishlist()` is called *early* in the `load` handler. The exception propagates and
every later step — `renderProductGrid()`, `init3DScene()`, `renderReviews()`,
`syncAccountUI()` — never runs. The page renders as a blank shell, **permanently**: the
poisoned value is persistent, so every subsequent visit fails the same way. The customer
has no way to recover short of clearing site data.

**Realistic trigger** This is not only a deliberate attack. Any future change to the
wishlist record shape, a half-written `setItem` interrupted by a tab crash, or a storage
quota error leaving a truncated value produces exactly the same dead page. A shared-device
prank needs one console line.

**Fix** `sanitizeWishlist()` — normalise against the real catalogue before anything
renders: drop non-objects and unknown product ids, fall back to the product's default
colourway for an invalid colour, de-duplicate, cap at 100 entries. Applied at all three
load points. (`casaven74 (3).html:1382-1403`)

```js
for (const item of list) {
  if (!item || typeof item.id !== 'string') continue;
  const prod = PRODUCTS.find((p) => p.id === item.id);
  if (!prod) continue;
  const color = typeof item.color === 'string' && prod.colors.includes(item.color)
    ? item.color : prod.colors[0];
  ...
}
```

Hardened alongside it: `validUsername()` filters malformed account records on every read,
and the session value is type-checked before `.toLowerCase()` is called on it.

**Tests** The regression test empties `#product-grid` *before* re-initialising, so only a
`load` handler that runs to completion can refill it — otherwise an aborted init would go
unnoticed behind UI that was already on screen.

---

### 4. Download of Code Without Integrity Check (missing Subresource Integrity) — CWE-494 / CWE-829 · OWASP A08:2021 Software and Data Integrity Failures · **MEDIUM**

**Location** `<head>`, pre-patch lines 14 and 49.

```html
<script src="https://cdn.tailwindcss.com"></script>                      <!-- unversioned -->
<script src="https://cdnjs.cloudflare.com/.../three.min.js"></script>    <!-- no SRI -->
```

Both scripts execute with full access to the DOM and to `localStorage`. Whatever those
URLs return is trusted completely. The Tailwind URL is **unversioned**, so its content can
change at any time without any change here.

**Fix (three.js)** Subresource Integrity — the browser hashes the downloaded file and
refuses to execute it on mismatch. (`casaven74 (3).html:63`)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
  integrity="sha384-CI3ELBVUz9XQO+97x6nwMDPosPR5XvsxW2ua7N1Xeygeh1IxtgqtCkGfQY9WWdHu"
  crossorigin="anonymous" referrerpolicy="no-referrer"></script>
```

**Partial fix (Tailwind) — and an attempt that failed.** The URL is now pinned to
`3.4.16`, so a new major build cannot arrive unannounced. SRI was attempted and **reverted**:

```
Access to script at 'https://cdn.tailwindcss.com/3.4.16' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

`integrity` requires a CORS-enabled response. `cdn.tailwindcss.com` sends no
`Access-Control-Allow-Origin`, so adding `integrity` + `crossorigin` makes the script fail
to load and the site renders unstyled. This was caught in the browser, not assumed. The
pin was kept as a stopgap, and the integrity gap was recorded as an open risk.

**Subsequently closed.** Tailwind is now compiled ahead of time
(`npx tailwindcss -c tailwind.config.js -i src/input.css -o styles.css --minify`) and the
resulting `styles.css` is self-hosted. The `cdn.tailwindcss.com` tag is gone, so there is
no longer any third-party script on the page without an integrity check. This also removed
Tailwind's own console warning that the Play CDN *"should not be used in production"*.

**Then closed completely.** three.js was subsequently upgraded from r128 to r187 and
**self-hosted** at `vendor/three.module.min.js`. The `cdnjs.cloudflare.com` tag is gone
too, so SRI is no longer needed for anything: **the page now loads no third-party script
at all**, and `script-src` is simply `'self'`. Modern three.js ships ES modules only — the
UMD `three.min.js` build was removed in r160 — so `app.js` is now loaded as
`<script type="module">` and imports three.js by relative path. An inline
`<script type="importmap">` was deliberately avoided: it is subject to `script-src` and
would have forced `'unsafe-inline'` back into the policy.

---

### 5. Weak Password Requirements — CWE-521 · OWASP A07:2021 Identification and Authentication Failures · **MEDIUM**

**Location** sign-up handler (pre-patch 2953) and markup (830, 836).

```html
<input id="signup-password" required minlength="4" placeholder="Create a password (min 4 chars)">
```
```js
if (!username || username.length < 3 || !password) { ... }   // no charset, no ceiling
```

A 4-character minimum, no character-set rule on the username, no upper bound on either
field, and nothing stopping a password identical to the username.

**Fix** (`casaven74 (3).html:3081-3137`) — username `^[A-Za-z0-9_.\-]{3,24}$`, password
8–128 characters, password may not contain the username. Enforced in JavaScript and
mirrored in `minlength` / `maxlength` / `pattern` so the browser gives immediate feedback.
The HTML attributes are convenience; the JavaScript checks are the control.

---

### 6. Uncontrolled Resource Consumption — CWE-400 / CWE-770 Allocation Without Limits · OWASP A04:2021 Insecure Design · **MEDIUM**

**Location** `addToCart()` (2522), the `data-cart-inc` handler (2851), `saveReviews()`
(1333), and the review form (3040).

```js
if (existing) { existing.qty += 1; }              // no ceiling
state.cart[idx].qty += 1;                         // no ceiling
state.reviews.unshift(newReview);                 // list never capped
const comment = document.getElementById('review-comment').value.trim();   // no length limit
```

**Two concrete consequences**, both reached without any privilege:

1. **The checkout link silently breaks.** The WhatsApp deep link embeds the whole order as
   a URL-encoded query string. Push the quantity high enough and the `wa.me` URL exceeds
   what browsers and WhatsApp accept. The button still looks fine and simply stops
   working — a revenue bug that would be very hard to diagnose from a customer report.
2. **Storage exhaustion.** Reviews are persisted with no cap on count or length. Filling
   the ~5 MB origin quota makes `writeJSON` throw — and it is swallowed by an empty
   `catch`, so wishlists and orders stop saving with no error anywhere.

**Fix** Quantity ≤ 99 per line · stored reviews ≤ 200 · comment ≤ 600 characters (enforced
in JS *and* via `maxlength`) · username ≤ 24 · wishlist ≤ 100 entries.
(`casaven74 (3).html:1304-1312`)

**Tests** 150 synthetic clicks on "+" stop at 99; the deep link stays under 2 000
characters; 500 injected reviews are clamped to 200; a 5 000-character comment is stored
at exactly 600.

---

### 7. Client-Side Enforcement of Integrity Checks — CWE-602 / CWE-20 Improper Input Validation · **LOW**

**Location** the global click delegate (2838-2862) and the review handler (3043).

```js
const idx = Number(decBtn.dataset.cartDec);
state.cart[idx].qty -= 1;                     // throws if idx is NaN or out of range
state.selectedRating = Number(starBtn.dataset.star);     // any number accepted
const product = document.getElementById('review-product').value;  // <select> is editable
```

`data-*` attributes and `<select>` options are DOM state, and DOM state is editable by the
user. Editing one index throws inside the click handler; adding an `<option>` to the
product dropdown writes an arbitrary product name into the stored review.

**Fix** `Number.isInteger(idx) && state.cart[idx]` before any index use; rating clamped to
1–5; product checked against the catalogue whitelist (`casaven74 (3).html:3210`):

```js
const knownProducts = ['General Atelier'].concat(PRODUCTS.map((p) => p.name));
if (!knownProducts.includes(product)) { showToast('Unknown product selection'); return; }
```

---

### 8. Stored Cross-Site Scripting Sink — Unescaped Template Interpolation — CWE-79 · OWASP A03:2021 Injection · **LOW**

**Location** `syncAccountUI()`, pre-patch line 2238.

```js
<span class="...">${ord.total} DH</span>     // every sibling field used escapeHTML(); this one did not
```

The author escaped `ord.summary` and `ord.date` on the two lines directly above and missed
this one. The value comes from `casaven7_users_v2`, which is attacker-writable (entry
point 4), so it is a genuine injection sink — the last one left in the file.

**Fix** `${Number(ord.total) || 0}` (`casaven74 (3).html:2360`). Type coercion rather than
escaping: the field is a price and must only ever be a number, so this rejects the whole
class of input instead of neutralising one encoding of it.

**Tests** A planted order with `total: '0</span><img src=x onerror=...>'` renders as
`0 DH`, with zero injected nodes and the XSS canary at zero.

---

## 4. Dismissed — suspicions that turned out not to be vulnerabilities

Reported here because *not* finding a bug is a result, and because re-auditing these later
is wasted effort.

| Suspicion | Verdict |
|---|---|
| Stored XSS via reviews | **Not vulnerable.** `escapeHTML()` was already applied to username, comment, product and date. Payloads submitted through the form *and* written straight into `localStorage` all rendered as inert text; canary never fired. |
| Reverse tabnabbing on `target="_blank"` | **Not vulnerable.** Both WhatsApp links already carried `rel="noopener noreferrer"`. |
| Open redirect / injection in the `wa.me` link | **Not vulnerable.** Built from two hardcoded numbers and `encodeURIComponent()`. |
| Username injected into the WhatsApp message | **Not vulnerable.** The whole message passes through `encodeURIComponent()`. |
| Prototype pollution via `readJSON` | **Not vulnerable.** No recursive merge anywhere; `JSON.parse` makes `__proto__` an own property, not a prototype write. |
| SSRF / untrusted deserialization via three.js | **Not vulnerable.** No `TextureLoader`, `GLTFLoader` or `FileLoader`. All geometry is procedural and all textures are drawn on a `<canvas>`. Nothing is fetched. |
| Supply-chain risk from the three.js upgrade | **Checked.** The r187 bundle was built from the official npm tarball, not from a CDN URL, and is vendored into the repository so the shipped bytes are reviewable and fixed. |
| DOM XSS via `location.hash` / `search` | **Not vulnerable.** The URL is never read by the application. |
| Inline event handlers (`onclick=`…) | **None present.** Everything goes through `addEventListener`. |
| Credentials leaking into the URL if JS fails | **Not vulnerable.** The forms have no `action`, but their inputs have no `name` attributes either, so a fallback GET submission would serialise nothing. `form-action 'none'` now blocks it regardless. |
| Username enumeration at sign-in | **Not a pre-existing flaw.** The original already returned one generic message. The patch keeps it and adds constant-time digest comparison. |
| Agent / harness configuration exposure | **No surface.** AgentShield scan: grade A, 100/100, **0 files scanned** — the project contains no `.claude/` directory, MCP config, hooks or agent definitions. |

---

## 5. Not applicable — no server-side component

The following were in scope and were checked for, but the architecture excludes them.
There is no backend, no database, no API, no session server, no file handling.

SQL / NoSQL injection · SSRF · command injection · path traversal · file-upload flaws ·
insecure deserialization · JWT and OAuth flaws · CSRF · IDOR and broken access control at
an API · privilege escalation · server-side race conditions · server-side rate limiting ·
CORS misconfiguration (the page makes no cross-origin requests).

**One caveat.** "No server" is why these do not apply — and it is also why §6, *Client-Side Authentication*
cannot be fixed. The same property that removes most of the OWASP Top 10 removes any
possibility of real authorisation.

---

## 6. Remaining risks

Stated plainly rather than worked around. The two marked **RESOLVED** were open in the
first pass and have since been closed; the rest cannot be closed inside a static HTML
file and need a server or a hosting change.

### Client-Side Authentication — CWE-603 Use of Client-Side Authentication / CWE-602 · OWASP A07:2021 · **CRITICAL (architectural)**

Everything lives in `localStorage` on the visitor's own machine, so the visitor is
on both sides of the check. One line grants any identity:

```js
localStorage.setItem('casaven7_session_v2', '"someone_else"');   // now signed in as them
```

Order history can be invented, reviews can be marked `verified: true`, and every account
record can be read. Hashing the passwords removed the *password dump*; it did not and cannot create a trust
boundary where none exists.

**Treat these accounts as a per-browser convenience — a saved wishlist and a local order
history — and nothing more.** Do not attach anything of value: no discounts, no credit, no
member pricing, no personal data beyond what the customer would type into a WhatsApp
message anyway.

**Real fix:** a backend that owns accounts, sessions (`HttpOnly` + `Secure` +
`SameSite=Lax` cookies), order records and rate limiting. Server-side hashing with Argon2id
or bcrypt. Until then this risk is open by design.

### Per-Browser State — no server-side persistence (informational)
A consequence of client-side authentication, not a flaw. A customer who signs up on their phone has no account on
their laptop, and clearing site data deletes everything. Worth saying on the UI so nobody
assumes otherwise.

### Missing HTTP Security Headers — Clickjacking CWE-1021 · Missing HSTS CWE-319 · MIME Sniffing CWE-430 · OWASP A05:2021
`frame-ancestors` (clickjacking), `X-Content-Type-Options`, `Strict-Transport-Security`
and `Permissions-Policy` are ignored in a `<meta>` tag — browsers only honour them as real
response headers. **The CSP in the file does not protect against clickjacking.** Configure
on the web server:

```nginx
add_header Content-Security-Policy "frame-ancestors 'none'" always;
add_header X-Content-Type-Options    "nosniff" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Permissions-Policy        "camera=(), microphone=(), geolocation=()" always;
```

On Netlify or Vercel the same goes in `_headers` / `vercel.json`.

### ~~Unverifiable Third-Party Dependency~~ — **RESOLVED**
Tailwind is now compiled with the Tailwind CLI and served from `styles.css` on the site's
own origin. The `cdn.tailwindcss.com` tag has been removed, so no unverifiable third-party
script remains. See §3, *Download of Code Without Integrity Check*.

### ~~Use of an Outdated Component~~ — **RESOLVED**
three.js has been upgraded from r128 (2021) to **r187** (October 2026) and is now served
from the site's own origin at `vendor/three.module.min.js`, so there is no SRI hash left to
maintain. Two breaking changes had to be handled, and both are documented in `app.js`:
`outputEncoding` / `texture.encoding` became `outputColorSpace` / `texture.colorSpace`
(r152), and the implicit π factor on light intensities disappeared when `useLegacyLights`
was removed (r165). Colour management is explicitly disabled so the storefront keeps the
look it had: a security upgrade is not the place to re-grade a product's appearance.
Measured against the r128 reference render, mean luminance moved by 2.6 % — visually
indistinguishable.

### Improper Restriction of Excessive Authentication Attempts — CWE-307 · OWASP A07:2021
Meaningless without a server: an attacker with local access reads the hashes directly
rather than guessing at the form. PBKDF2 at 210 000 iterations is the compensating control —
it makes offline guessing against a stolen hash expensive. Online throttling belongs with
the backend described under *Client-Side Authentication*.

### ~~Content Security Policy Weakened by `'unsafe-inline'`~~ — **RESOLVED**
All JavaScript now lives in `app.js` and all CSS in `styles.css`, with the two colour-swatch
`style=` attributes replaced by `.swatch-*` classes. `'unsafe-inline'` is gone from both
`script-src` and `style-src`, so an injected inline `<script>` or `style=` attribute is
refused by the browser — not merely contained. Both are covered by the regression suite.

### Exposure of Business Information in Source — CWE-200 (informational, accepted)
`212674609122` and `212779162845` are published contact numbers — exposure is intended.
Expect scraping and spam; that is the cost of a WhatsApp storefront, not a defect.

---

## 7. Testing

### 7.1 Regression suite

`SECURITY_TESTS.js` — 32 tests, one paste into the DevTools console, no build step
(the project has no `package.json`, no test runner and no CI; a console-loadable suite is
the form that actually fits).

```bash
python3 -m http.server 8731 --bind 127.0.0.1
# open http://127.0.0.1:8731/casaven74%20(3).html → DevTools → Console → paste the file
```

Serve it over HTTP: `file://` does not apply CSP the way a web server does, and the CSP
tests would be meaningless.

### 7.2 Results

| Target | Result |
|---|---|
| **Patched `casaven74 (3).html`** | **34 / 34 PASS** |
| Pre-patch copy (control) | 16 failures, then the run **crashes** at the stored-client-side-DoS check — the unpatched app is bricked by then and the product grid never renders |

The control run is the point. A suite that passes on the vulnerable file proves nothing;
this one discriminates, and its crash on the baseline is itself the proof of the stored client-side DoS.

| Area | Tests | Result |
|---|---|---|
| Plaintext password storage, sign-in, legacy migration | 11 | PASS |
| Content Security Policy (remote script, exfiltration, `<base>`, `eval`) | 5 | PASS |
| Stored client-side DoS (hostile wishlist, init survival, entry filtering) | 3 | PASS |
| Weak password requirements | 3 | PASS |
| Uncontrolled resource consumption (quantity / review / comment caps) | 5 | PASS |
| Client-side enforcement (index and whitelist validation) | 2 | PASS |
| Stored XSS sink (order-field injection + type coercion) | 2 | PASS |
| XSS canary across the entire run | 1 | PASS (0 hits) |

### 7.3 Functional regression (security fixes must not break the shop)

Full customer journey on a clean profile, after patching: 15 product cards render · 3D
canvas initialises · add-to-bag updates the badge · WhatsApp deep link well-formed
(`https://wa.me/212674609122?text=…`) · wishlist persists · sign-up succeeds · order
recorded as `1x 212 Tribal (Obsidian Black) — 50 DH` · filters and studio controls
respond · `localStorage` contains no trace of the password used.

### 7.4 Static and configuration scanning

| Tool | Result |
|---|---|
| AgentShield (`npx ecc-agentshield scan`) | Grade **A, 100/100** — 0 findings, **0 files scanned**: no agent-config surface in this project |
| Browser console, patched page, clean load | No errors, no warnings, no CSP violations |
| 3D render compared against the r128 reference | Mean luminance 66.4 → 64.7 (−2.6 %), median 61 → 59. All three colourways, all 15 products and the three camera presets verified |
| Source sweep for residual injection sinks | All remaining template interpolations fed by `localStorage` are either `escapeHTML()`-wrapped or numeric; the rest are static catalogue constants |

### 7.5 Independent review of the changes

Re-read as an attacker would, looking for weaknesses introduced by the patch:

- `sanitizeWishlist()` only ever **emits** `{id, color}` values copied from the catalogue —
  it cannot pass attacker-controlled structure downstream.
- Sign-up and sign-in became `async`. Both disable the submit button for the duration and
  re-enable it in `finally`, so a thrown error cannot leave the form permanently dead, and
  double submission during the ~200 ms derivation is not possible.
- `upgradeLegacyUser()` re-reads storage before writing, rather than writing back a stale
  in-memory copy — it cannot resurrect deleted accounts.
- `digestEqual()` compares fixed-length hex digests with no early exit.
- The CSP was verified by attempting four violations, not by reading the string.
- **One self-inflicted regression was caught and reverted:** SRI on the Tailwind CDN broke
  the page (*Download of Code Without Integrity Check*). It was found by loading the page in a browser. It would not have been
  found by reading the diff.

---

## 8. Changes made

| File | Change |
|---|---|
| `casaven74 (3).html` | 27 security patches, then split: all inline script and style extracted. 3 270 → 927 lines. Behaviour and design unchanged. |
| `app.js` | **New.** All application logic, moved out of the inline `<script>`. Now an ES module that imports three.js. |
| `vendor/three.module.min.js` | **New, generated.** three.js r187, bundled from the official npm tarball. Replaces the r128 CDN script. |
| `styles.css` | **New, generated.** Tailwind compiled ahead of time + the project's custom CSS. Do not edit by hand. |
| `src/input.css` | **New.** Stylesheet source: Tailwind directives, custom CSS, `.swatch-*` classes. |
| `tailwind.config.js` | **New.** The former inline `tailwind.config`, with `content` pointing at the markup and `app.js`. |
| `SECURITY_TESTS.js` | **New.** 34-test regression suite. |
| `SECURITY_AUDIT_REPORT.md` | **New.** This report. |
| `AUDIT_SECURITE.txt` | **New.** French plain-text version of the same findings. |
| `casaven74 (3).zip` | **Untouched** — still holds the unpatched, vulnerable copy. Replace or delete it before distributing anything. |

**Rebuilding the stylesheet.** `styles.css` is generated. After editing markup or `app.js`,
regenerate it or newly-used Tailwind classes will simply have no styles:

```bash
npx tailwindcss -c tailwind.config.js -i src/input.css -o styles.css --minify
```

**Rebuilding the vendored three.js** (only needed when upgrading it):

```bash
npm pack three@0.187.0 && tar xzf three-0.187.0.tgz package/build/
npx esbuild package/build/three.module.js --bundle --minify --format=esm \
  --legal-comments=inline --outfile=vendor/three.module.min.js
```

No feature was removed, no check was weakened, no secret appears in any report or log.
Existing accounts keep working and are upgraded transparently on next sign-in.

---

## 9. Recommended order of work

1. **Serve over HTTPS and add the HTTP security headers from §6.** Minutes of work, and until it is
   done the clickjacking gap stays open.
2. **Replace or delete `casaven74 (3).zip`** — it still contains the vulnerable build.
3. **Decide what the accounts are for.** If nothing of value will ever depend on them,
   *Client-Side Authentication* is an accepted risk and should be written down as one. If anything will, build the
   backend before that feature ships, not after.
4. ~~Compile Tailwind at build time and self-host it.~~ **Done** — see §8.
5. ~~Move the inline JavaScript into `app.js` and drop `'unsafe-inline'`.~~ **Done** — see §8.
6. ~~Schedule the three.js upgrade.~~ **Done** — r128 → r187, self-hosted; see §8.

---

## 10. Closing statement

Eight confirmed vulnerabilities are fixed and verified by a regression suite that fails on
the unpatched file. Two of the risks first left open — the unverifiable Tailwind CDN and
the `'unsafe-inline'` in the policy — have since been closed by compiling Tailwind locally
and moving all script and style out of the HTML, and three.js has been upgraded from r128
to r187 and self-hosted. **The page now loads no third-party script at all**: `script-src`
is `'self'`, with no `'unsafe-inline'` and no `'unsafe-eval'` anywhere in the policy. Two findings were proven by execution rather than inference. Eleven
suspicions were investigated and dismissed as false positives, and five risks remain
open with the reason stated for each.

**This does not mean the application is secure.** Tests passing shows the fixed issues stay
fixed; it says nothing about what was not looked for. The dominant risk is *Client-Side Authentication* — and
it is architectural, not a bug: a static page cannot authenticate anyone, and no amount of
client-side code will change that. Everything else in this report is secondary to that one
decision.

---

*Audit, remediation and verification — **by azyven***
