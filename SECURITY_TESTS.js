/* =============================================================================
 * CASAVEN7 - SECURITY REGRESSION TESTS
 * -----------------------------------------------------------------------------
 * Covers every fix listed in SECURITY_AUDIT_REPORT.md, named by CWE. A FAIL means a security
 * control has regressed.
 *
 * HOW TO RUN
 *   1. Serve over HTTP, not file://, so the CSP behaves as it will in production:
 *        python3 -m http.server 8731 --bind 127.0.0.1
 *   2. Open  http://127.0.0.1:8731/casaven74%20(3).html
 *   3. DevTools > Console > paste this whole file > Enter.
 *   4. Expect the summary to end with "ALL PASS".
 *
 * WARNING: this wipes localStorage for the page's origin. Run it on a test
 * origin, never in a browser holding real member data. The page re-initialises
 * itself several times during the run, so the 3D studio may stack extra
 * canvases - cosmetic, and gone after a normal reload.
 * ========================================================================== */
window.__secTestRun = (async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (id) => document.getElementById(id);
  const out = [];
  const check = (name, pass, detail) => {
    out.push({ name, pass: !!pass, detail: detail === undefined ? '' : String(detail).slice(0, 110) });
  };
  const K = {
    USERS: 'casaven7_users_v2', SESSION: 'casaven7_session_v2',
    REVIEWS: 'casaven7_reviews_v1', WISHLIST: 'casaven7_wishlist_v1',
  };
  const feedback = () => $('auth-feedback').textContent.trim();
  const submit = (id) => $(id).dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  // The app builds all of its UI inside its window 'load' handler, so re-dispatching
  // 'load' is a full re-render straight from localStorage - exactly the path an
  // attacker who tampered with storage would hit.
  const reinit = async () => { window.dispatchEvent(new Event('load')); await sleep(700); };

  async function signup(u, p) {
    $('auth-feedback').textContent = '';
    $('signup-username').value = u; $('signup-password').value = p;
    submit('signup-form'); await sleep(1000); return feedback();
  }
  async function login(u, p) {
    $('auth-feedback').textContent = '';
    $('login-username').value = u; $('login-password').value = p;
    submit('login-form'); await sleep(1000); return feedback() || 'OK';
  }

  // Every XSS payload below calls this canary. It must stay at 0.
  window.__xssHits = 0;
  window.XSSHIT = () => { window.__xssHits += 1; };

  localStorage.clear();
  await reinit();

  /* === Weak Password Requirements (CWE-521) ========================================== */
  check('Weak password requirements: password under 8 chars rejected',
    (await signup('tester_01', '1234')).includes('between 8 and 128'));
  check('Weak password requirements: username containing HTML rejected',
    (await signup('<img src=x onerror=XSSHIT()>', 'CorrectHorse9')).includes('3-24 characters'));
  check('Weak password requirements: password containing the username rejected',
    (await signup('tester_01', 'tester_01xx')).includes('must not contain'));

  /* === Plaintext Storage of a Password (CWE-256/312) =========================================== */
  await signup('tester_01', 'CorrectHorse9');
  const rec = (JSON.parse(localStorage.getItem(K.USERS)) || [])[0] || {};
  check('Plaintext password storage: account created', rec.username === 'tester_01');
  check('Plaintext password storage: no plaintext password field on the record', !('password' in rec));
  check('Plaintext password storage: password unrecoverable from localStorage',
    JSON.stringify(localStorage).indexOf('CorrectHorse9') === -1);
  check('Plaintext password storage: PBKDF2 with 256-bit hash, 128-bit salt, 210k iterations',
    /^[0-9a-f]{64}$/.test(rec.hash) && /^[0-9a-f]{32}$/.test(rec.salt) && rec.iterations === 210000);

  /* === Authentication correctness ======================================== */
  $('logout-btn').click();
  const wrongPw = await login('tester_01', 'WrongPassword1');
  const noUser = await login('ghost_user', 'WrongPassword1');
  check('Plaintext password storage: wrong password rejected', wrongPw.includes('Invalid'));
  check('Plaintext password storage: unknown username rejected', noUser.includes('Invalid'));
  check('Username enumeration: identical message for wrong password and unknown user', wrongPw === noUser);
  check('Plaintext password storage: correct password accepted', (await login('tester_01', 'CorrectHorse9')) === 'OK');

  /* === Plaintext migration of pre-existing accounts ================================= */
  $('logout-btn').click();
  const users = JSON.parse(localStorage.getItem(K.USERS));
  users.push({ username: 'legacy_bob', password: 'OldPlainPass1', orders: [], wishlist: [], createdAt: '2025-01-01' });
  localStorage.setItem(K.USERS, JSON.stringify(users));
  check('Plaintext password storage: pre-existing plaintext account can still sign in',
    (await login('legacy_bob', 'OldPlainPass1')) === 'OK');
  const bob = JSON.parse(localStorage.getItem(K.USERS)).find((u) => u.username === 'legacy_bob');
  check('Plaintext password storage: plaintext upgraded to a salted hash on sign-in',
    !('password' in bob) && /^[0-9a-f]{64}$/.test(bob.hash || ''));
  $('logout-btn').click();
  check('Plaintext password storage: migrated account still rejects a wrong password',
    (await login('legacy_bob', 'nope12345')).includes('Invalid'));

  /* === Improper Input Validation on the review form (CWE-20) ==================================== */
  $('logout-btn').click();
  $('review-author').value = 'attacker1';
  $('review-comment').value = '<img src=x onerror=XSSHIT()><svg onload=XSSHIT()>"><iframe src=javascript:XSSHIT()>';
  submit('review-form'); await sleep(400);
  check('Stored XSS: review comment rendered as inert text',
    document.querySelectorAll('#reviews-list img, #reviews-list svg[onload], #reviews-list iframe, #reviews-list script').length === 0);
  const sel = $('review-product');
  sel.insertAdjacentHTML('beforeend', '<option value="ATTACKER_PRODUCT">x</option>');
  sel.value = 'ATTACKER_PRODUCT';
  $('review-author').value = 'attacker1'; $('review-comment').value = 'tampered select';
  const before = JSON.parse(localStorage.getItem(K.REVIEWS) || '[]').length;
  submit('review-form'); await sleep(300);
  check('Input validation: product outside the catalogue rejected',
    JSON.parse(localStorage.getItem(K.REVIEWS) || '[]').length === before);
  sel.value = 'General Atelier';

  /* === XSS written straight into storage (bypasses every form) ========== */
  const revs = JSON.parse(localStorage.getItem(K.REVIEWS)) || [];
  revs.unshift({
    id: 'x', username: '<img src=x onerror=XSSHIT()>', verified: true,
    rating: '<script>XSSHIT()<\/script>', product: '"><img src=x onerror=XSSHIT()>',
    comment: '<iframe src=javascript:XSSHIT()></iframe>', date: '"onmouseover="XSSHIT()',
  });
  localStorage.setItem(K.REVIEWS, JSON.stringify(revs));

  /* === Stored XSS sink: tampered order record (CWE-79) ====================================== */
  const us2 = JSON.parse(localStorage.getItem(K.USERS));
  us2.find((u) => u.username === 'legacy_bob').orders = [{
    date: '<img src=x onerror=XSSHIT()>', summary: '<script>XSSHIT()<\/script>',
    total: '0</span><img src=x onerror=XSSHIT()>',
  }];
  localStorage.setItem(K.USERS, JSON.stringify(us2));
  localStorage.setItem(K.SESSION, JSON.stringify('legacy_bob'));

  /* === Stored Client-Side DoS: hostile wishlist must not abort init (CWE-20/248) ============= */
  localStorage.setItem(K.WISHLIST, JSON.stringify([
    { id: '<img src=x onerror=XSSHIT()>', color: {} }, null, { id: '212' }, 42, { id: 'no-such-product', color: 'black' },
  ]));

  // Wipe the rendered UI first. renderProductGrid() runs near the END of the load
  // handler, so an exception thrown earlier (renderWishlist) leaves the grid empty.
  document.getElementById('product-grid').innerHTML = '';
  await reinit();

  check('Stored client-side DoS: initialisation survives a hostile wishlist (product grid)',
    document.querySelectorAll('[data-product-card]').length === 15);
  check('Stored client-side DoS: initialisation survives a hostile wishlist (3D canvas)',
    !!document.querySelector('#canvas-container canvas'));
  check('Stored client-side DoS: malformed wishlist entries discarded, valid one kept',
    document.querySelectorAll('#wishlist-items [data-wish-remove]').length === 1);
  check('Stored XSS: stored review payload inert after re-render',
    document.querySelectorAll('#reviews-list img, #reviews-list script, #reviews-list iframe, #reviews-list [onerror], #reviews-list [onload], #reviews-list [onmouseover]').length === 0);
  check('Stored XSS sink: stored order payload inert after re-render',
    $('profile-orders-list').querySelectorAll('img, script, iframe, svg, [onerror], [onload], [onmouseover]').length === 0);
  check('Stored XSS sink: ord.total coerced to a number',
    /(^|\s)0 DH(\s|$)/.test($('profile-orders-list').textContent.replace(/\s+/g, ' ')));

  /* === Missing Content Security Policy (CWE-693) ==================================== */
  check('Content Security Policy: policy present', !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'));
  // A REACHABLE third-party origin that is deliberately NOT in the allowlist.
  // An unreachable host would fail to load anyway and make this pass on a page
  // with no CSP at all - the test has to be able to actually succeed.
  const OFF_ALLOWLIST = 'https://cdn.jsdelivr.net/npm/left-pad@1.3.0/index.js';
  const remote = await new Promise((res) => {
    const sc = document.createElement('script');
    sc.src = OFF_ALLOWLIST;
    sc.onerror = () => res('BLOCKED'); sc.onload = () => res('LOADED');
    document.head.appendChild(sc); setTimeout(() => res('TIMEOUT'), 6000);
  });
  check('Content Security Policy: blocks an injected remote script', remote === 'BLOCKED', remote);
  const exfil = await fetch(OFF_ALLOWLIST, { mode: 'no-cors' })
    .then(() => 'ALLOWED').catch(() => 'BLOCKED');
  check('Content Security Policy: blocks exfiltration to a third-party origin', exfil === 'BLOCKED', exfil);
  // These two are only possible because all JS lives in app.js and all CSS in
  // styles.css: with no 'unsafe-inline', injected inline script and style are refused.
  window.__inlineScriptRan = false;
  const inline = document.createElement('script');
  inline.textContent = 'window.__inlineScriptRan = true;';
  document.head.appendChild(inline);
  await sleep(200);
  check('Content Security Policy: blocks an injected inline <script>', window.__inlineScriptRan === false);
  inline.remove();

  const probe = document.createElement('div');
  probe.innerHTML = '<span id="__cspStyleProbe" style="width:137px;display:block"></span>';
  document.body.appendChild(probe);
  const styleApplied = getComputedStyle(document.getElementById('__cspStyleProbe')).width === '137px';
  probe.remove();
  check('Content Security Policy: blocks an injected inline style attribute', !styleApplied);

  const base = document.createElement('base');
  base.href = 'https://cdn.jsdelivr.net/'; document.head.appendChild(base);
  const hijacked = document.baseURI.indexOf('https://cdn.jsdelivr.net') === 0;
  base.remove();
  check('Content Security Policy: blocks a <base> hijack', !hijacked);

  /* === Uncontrolled Resource Consumption (CWE-400/770) ============================================== */
  document.querySelector('[data-add-prod]').click(); await sleep(250);
  for (let i = 0; i < 150; i += 1) {
    const inc = document.querySelector('[data-cart-inc]');
    if (inc) inc.click();
  }
  const qty = (document.querySelector('#cart-items .w-5') || {}).textContent;
  check('Resource consumption: cart quantity capped at 99', qty === '99', qty);
  check('Resource consumption: WhatsApp deep link stays a sane length',
    $('wa-checkout-btn-1').href.length < 2000, $('wa-checkout-btn-1').href.length);

  const spam = [];
  for (let i = 0; i < 500; i += 1) {
    spam.push({ id: 'r' + i, username: 'spam' + i, rating: 5, product: 'General Atelier', comment: 'x', date: '01 Jan 2026' });
  }
  localStorage.setItem(K.REVIEWS, JSON.stringify(spam));
  await reinit();
  $('review-author').value = 'capcheck';
  $('review-comment').value = 'y'.repeat(5000);
  submit('review-form'); await sleep(400);
  const stored = JSON.parse(localStorage.getItem(K.REVIEWS));
  check('Resource consumption: stored reviews capped at 200', stored.length <= 200, stored.length);
  check('Resource consumption: comment truncated to 600 chars', stored[0].comment.length === 600, stored[0].comment.length);

  /* === Client-Side Enforcement of Integrity Checks (CWE-602) ================================== */
  let threw = false;
  try {
    const dec = document.querySelector('[data-cart-dec]');
    if (dec) { dec.dataset.cartDec = '9999'; dec.click(); }
  } catch (e) { threw = true; }
  check('Client-side enforcement: out-of-range cart index does not throw', !threw);

  /* === final canary ===================================================== */
  check('XSS canary never fired across the whole run', window.__xssHits === 0, 'hits=' + window.__xssHits);

  /* === report =========================================================== */
  const failed = out.filter((r) => !r.pass);
  console.table(out.map((r) => ({ result: r.pass ? 'PASS' : 'FAIL', test: r.name, detail: r.detail })));
  console.log(
    `%c${failed.length === 0 ? 'ALL PASS' : failed.length + ' FAILED'} — ${out.length - failed.length}/${out.length}`,
    `font-size:14px;font-weight:bold;color:${failed.length === 0 ? '#16a34a' : '#dc2626'}`
  );
  failed.forEach((f) => console.error('FAIL:', f.name, f.detail));
  localStorage.clear();
  console.log('%clocalStorage cleared. Reload the page for a clean state.', 'color:#999');
  return { total: out.length, passed: out.length - failed.length, failed: failed.map((f) => f.name) };
})();

