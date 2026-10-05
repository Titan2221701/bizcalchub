# Multilingual website maintenance

English is the default language at the original root URLs. German is under `/de/` and Spanish under `/es/`. The header links open the equivalent page in each language; there is no automatic redirect or language cookie.

All page text, metadata, accessibility labels, FAQ content, and schema text are rendered statically. Language pages share the same styles, favicon assets, and unchanged `script.js`. `assets/localization.js` translates only result notes and validation messages on translated calculator pages. It observes two text elements and never changes calculator inputs, state, numeric output, number formatting, or formulas. Numeric output remains in the original format, including N/A and decimal points. Formula labels are localized; mathematical operations and values are identical.

`locales/en.json`, `locales/de.json`, and `locales/es.json` contain matching static message keys, runtime message templates, runtime labels, and contextual brand labels. JSON files are build inputs, not extra network requests in the visitor's browser. No translation API, dependency, or third-party script is needed.

Edit the original English HTML and the matching locale entries, then rebuild. Run from the repository on Windows:

```powershell
powershell -NoProfile -File tools/build-locales.ps1
```

The wrapper sets the process console and Python to UTF-8 and runs the build and static validation. Python can also be invoked directly from any directory:

```powershell
python -X utf8 tools/build_locales.py
python -X utf8 tests/check_locales.py
```

All file reads and writes use explicit UTF-8. New navigation arrows use ASCII `->`; translated accents are preserved. Existing mathematical multiplication and minus symbols remain intact to preserve formulas. Use `Get-Content -Encoding UTF8` when reading these files with Windows PowerShell; its legacy default encoding can display UTF-8 accents incorrectly even when the files themselves are valid.

Run the JavaScript suites directly, avoiding the subprocess isolation used by `node --test` in restricted Windows environments:

```powershell
Get-ChildItem tests -Filter '*.test.cjs' | ForEach-Object {
    node $_.FullName
    if ($LASTEXITCODE -ne 0) { throw "Test failed: $($_.Name)" }
}
```

The production domain is `https://bizcalchub.top`, configured by `BASE_URL` in `tools/build_locales.py`. Rebuild after any future origin change; robots.txt is regenerated automatically. This regenerates every canonical URL, hreflang URL, and sitemap entry consistently. Homepages canonicalize to `/`, `/de/`, and `/es/`; other pages use their `.html` URLs. English also supplies the `x-default` alternative.

Generated files are deterministic. Rebuilds replace only generated SEO and switcher blocks in English source pages, then regenerate the translations. A missing translation causes a build error. Validation checks matching catalogs and placeholders, translated page content and schema, unchanged calculator input attributes, formula operations, all internal links and fragments, HTTP asset loading, unique canonicals, reciprocal alternatives, sitemap coverage, valid UTF-8, and absence of Chinese characters. External editorial links are retained and do not depend on translation services.

The audit fixes expanded the English About, Contact, Privacy Policy, and Terms and regenerated both translations. Advertising Disclosure is available in all three languages and linked from every header and footer. Contact, Privacy Policy, Terms, and Advertising Disclosure publish the supplied business address `support@bizcalchub.top` as an email link in every language. Mailbox delivery must be tested by the operator. Advertising and analytics disclosures distinguish planned services from the current version, which has no active advertising, analytics, or CMP.


The site now has 33 indexable pages and three translated 404 documents (36 HTML files total). Error documents use noindex, follow and are excluded from the sitemap. Each has a root-relative language base URL so its assets and navigation can resolve when served for a missing nested path. Configure the production host to return these documents with HTTP 404 for missing URLs; the files alone cannot configure a hosting provider.

Internal homepage links and language switches use directory URLs consistent with canonical homepages. Breadcrumb schema uses absolute language-specific URLs. The build also regenerates the robots.txt Sitemap directive from BASE_URL. Google policy/reference links on translated pages receive the corresponding hl language parameter.

Run the follow-up audit checks with:

```powershell
python -X utf8 tests/check_launch_readiness.py
```

The Windows build wrapper runs both Python validators. The JavaScript suites should still be run directly using the command above. Keep calculator source, formulas, validation constraints, and number formatting unchanged when editing site content.

PRE_LAUNCH_AUDIT.md records the original audit. POST_FIX_AUDIT.md records the implementation outcome, remaining deployment/account requirements, and checks that could not be run without a connected browser or real production origin.

## BizCalcHub branding

The supplied official PNG at assets/bizcalchub-logo.png is used unchanged in every header and as the PNG favicon. Header image dimensions reserve its 3:1 aspect ratio; CSS limits its height to 58px on desktop and 42px at widths up to 768px. Logo links use root-relative localized homepage routes, while navigation and language-switcher links retain their existing routing. Root-relative asset URLs are preserved by the translation builder.

Homepage titles, descriptions, and hero slogans are localized from the new BizCalcHub copy. Other pages keep descriptive page-specific titles with BizCalcHub branding. Open Graph site branding, policy text, and footer branding use the same platform name. Update the locale entries and rebuild when changing these strings.
