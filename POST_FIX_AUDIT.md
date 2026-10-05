> Archived audit: findings describe the earlier preparation snapshot and are superseded by PRODUCTION_READY_REPORT.md. Domain and contact literals have been normalized to the supplied production details; historical placeholder findings are not current status.

# Post-fix pre-launch audit

Date: 2026-10-05  
Scope: 33 indexable pages in English, German, and Spanish, plus three translated error documents (36 HTML files total).  
Original reference: [PRE_LAUNCH_AUDIT.md](PRE_LAUNCH_AUDIT.md).

## Outcome

The requested content and local technical fixes are implemented. About now explains the global calculator platform and methodology; Contact has the requested clearly labeled support placeholder; Privacy covers current processing and planned Google AdSense, third-party advertising, cookies, and analytics; Terms describe the working tools and user responsibilities. Advertising Disclosure is published in all three languages and linked in every header and footer.

**The site is not yet cleared for public launch or live advertising.** The remaining items are listed below. The contact address and domain intentionally remain placeholders under the user's instructions. Real operator/hosting details and publisher-account configuration cannot be inferred or invented.

## Original findings and disposition

| Finding | Disposition | Evidence or remaining action |
|---|---|---|
| L01 - production domain | Intentionally remaining | https://bizcalchub.top remains the authorized temporary origin. Replace BASE_URL with the real HTTPS origin before production indexing and rebuild all SEO URLs and robots. |
| L02 - stale service/policy/footer claims | Fixed | All languages describe the five working calculators. No visible claims remain that calculations are unavailable or that estimates are future functionality. |
| L03 - contact method | Placeholder implementation complete; launch item remains | support@bizcalchub.top is visibly identified as inactive in all three Contact pages. It is plain text, not a misleading mailto link. Replace it with a monitored verified mailbox before public launch. |
| L04 - privacy/advertising disclosures | Content fixed; operator details remain | Current calculator processing, hosting requests, planned ad/analytics technologies, third-party data use, and choices are described. Operator, host, retention and privacy-contact details still need real deployment information. |
| L05 - consent/CMP | Remains before applicable ad activation | No CMP or live tracking was installed. Configure an appropriate consent system before services requiring it; personalized Google ads in the EEA/UK/Switzerland require the applicable Google-certified TCF-integrated CMP. |
| R01 - production/browser verification | Unverified | No browser is connected and no production origin is supplied. Live rendering, Core Web Vitals, server headers, TLS, redirects, real ad units, and account checks remain. |
| C01 - publisher trust | Purpose/methodology improved; identity remains | About now has original guidance, worked reasoning, tool-selection advice, assumptions, accessibility/feedback information and an update date. No fake owner, expert credentials or professional review was invented. Confirm the real legal operator. |
| C02 - global/language audience | Fixed | Homepage FAQ and About explain availability for worldwide users in English, German and Spanish. |
| S01 - robots sitemap discovery | Fixed locally | robots.txt now includes Sitemap: https://bizcalchub.top/sitemap.xml, generated from BASE_URL. Replace the origin with the production domain when known. |
| S02 - homepage URL consistency | Local links fixed; host redirects remain | Navigation, language switches, and content links use directory URLs matching /, /de/, and /es/ canonicals. Production redirects from index.html, alternate hosts, and HTTP still require host configuration. |
| S03 - breadcrumb URLs | Fixed | All 15 calculator breadcrumbs use absolute, language-specific homepage URLs and valid calculator-directory anchors. |
| S04 - retired FAQ rich results | Deliberate retention | Visible FAQs and accurate FAQPage markup were retained to preserve the existing SEO structure. No Google FAQ rich-result benefit is claimed. |
| S05 - verbose metadata | Fixed for flagged strings | Flagged German calculator titles, Spanish homepage/break-even titles, and the long Spanish break-even description were shortened. All current titles are 33-60 characters and descriptions 66-157; these are measurements, not ranking thresholds. |
| A01 - ad account/code/ads.txt | Disclosure and placement guidance added; integration deferred | Advertising Disclosure explains status, partner responsibilities, editorial independence, labels, and privacy. No publisher ID or verification details were supplied, so no fake ads.txt, ad script, or account claim was added. |

Google's advertising disclosures and consent requirements were checked against its current official guidance: [Privacy disclosures](https://support.google.com/publisherpolicies/answer/10437794?hl=en), [publisher CMP requirements](https://support.google.com/adsense/answer/13554116?hl=en), and [Google's partner-site data explanation](https://policies.google.com/technologies/partner-sites). Text explains planned services without claiming they are already installed. This report does not certify legal compliance or guarantee AdSense approval.

## Content and navigation audit

### About

The three pages now explain the platform's actual purpose, available tools and languages. They distinguish consistent cost/time/currency inputs, illustrate why omitted expenses change margin, explain rounding and undefined denominators, and identify each tool's limitations. Main-content lengths are 445 words (English), 378 (German), and 468 (Spanish), excluding header/footer and schema. Word count is not an approval criterion.

Operator identity is explicitly unconfirmed. No fabricated business history, certification, customer results, or editorial-review credentials were supplied.

### Contact

Each page has a professional support purpose, an explicit support-email placeholder, report-preparation guidance, privacy/advertising links, and instructions to use non-confidential sample data. The English page has 204 main-content words. The placeholder is not presented as a working mailbox or a guaranteed response channel.

A real monitored email remains a public-launch requirement. The user explicitly requested a placeholder, so this audit does not incorrectly mark contact operations as complete.

### Privacy Policy

The pages distinguish calculator input processing from ordinary host requests. They describe:
- Current browser-side calculations without sending the amounts to a calculation server or storing them in browser storage.
- Technical hosting logs and the details that still require confirmation.
- Current absence of site-created cookies, analytics and live advertising.
- Possible future cookies, web beacons, IP/device identifiers and third-party advertising technologies.
- Google AdSense data processing and potential personalization.
- Future analytics scope and a commitment not to intentionally include calculator values in analytics or ad targeting.
- Browser choices, advertising-preference links and the consent setup required before applicable services activate.
- Update dates and current contact limitations.

All additions are translated. The actual host configuration and any future third-party implementation must match these disclosures.

### Terms

Terms now describe the working browser calculators, JavaScript requirement, cost/input scope, estimate limitations, educational purpose, user verification responsibilities, illustrative examples, acceptable use, service availability, and third-party terms. They distinguish simple ROI, ROAS revenue efficiency and break-even assumptions rather than promising professional advice or guaranteed returns.

### Advertising Disclosure

New documents:
- advertising-disclosure.html
- de/advertising-disclosure.html
- es/advertising-disclosure.html

They are ad-free, have unique localized titles/descriptions, self-canonicals and reciprocal language alternatives, and appear in the sitemap. They describe the 18 current placeholders and possible future funding while distinguishing paid ads from tool results and recommendations. Every header and footer links to its corresponding language document.

### Navigation and footer

All 36 HTML pages use the updated advice disclaimer and include Advertising Disclosure. The primary navigation can wrap; compact language links have at least 44px height, and mobile primary/footer navigation links also receive larger targets. Contact email text can wrap on narrow screens.

Actual desktop/mobile rendering remains unverified without a connected browser. Source CSS support is not a substitute for a visual or assistive-technology audit.

## SEO and technical audit

- **Titles/descriptions:** 36 unique titles and 36 unique descriptions, one H1 per page, UTF-8 and viewport declarations. Flagged localized titles/descriptions were shortened.
- **Canonicals:** preserved language-specific canonical structure; homepage directory URLs remain consistent with the existing sitemap design.
- **Hreflang:** en/de/es/x-default remain reciprocal across each topic, including each page's own language.
- **Sitemap:** 33 unique indexable URLs, including all three Advertising Disclosure versions. The three 404 documents are excluded.
- **Robots:** crawling remains allowed and the sitemap directive is now present. Production robots and X-Robots-Tag headers must still be checked.
- **Structured data:** FAQPage and BreadcrumbList remain present on 15 calculator pages. All 168 FAQ question/answer pairs match visible content; absolute breadcrumb targets and fragments resolve locally. FAQ rich results are retired in current Google Search guidance; visible FAQ usefulness is preserved. [Google Search changelog](https://developers.google.com/search/updates)
- **Homepage aliases:** no internal homepage index.html links remain. Production alias redirects still need deployment configuration.
- **404 documents:** 404.html, de/404.html and es/404.html have localized content, no ads, noindex/follow, working language links and a root-relative language base for asset/navigation resolution on nested missing paths. Configure the host to serve them with HTTP 404; creating the files does not configure production routing.
- **External links:** translated Google reference/privacy/preference links now request the corresponding hl language. This changes link destinations, not website translation or calculator behavior.
- **Loading:** content and metadata remain static. No external translation API, ad network, analytics script, extra JavaScript library or artificial consent banner was installed.
- **Duplicates/thin content:** no exact duplicate main-content blocks were found. Shared navigation and genuine language equivalents are expected. About and policy content is now more substantive; Contact still needs a real channel. This does not establish worldwide content originality or a Google approval outcome.
- **Ad placements:** existing 18 labeled placeholders remain; support/disclosure/error pages have none. Disclosure specifies separation from forms, results and navigation. Real slot sizes, layout shifts, Auto ads, accidental-click separation and consent behavior need testing after genuine integration.

## Validation results

Executed successfully:
1. Windows UTF-8 build wrapper: rebuild plus both Python audit validators.
2. tests/check_locales.py: all 36 pages, **1,036 local references/fragments**, 41 distinct page/asset HTTP resources, 33 sitemap entries, complete locale catalogs, metadata and language checks.
3. tests/check_launch_readiness.py: unique metadata/content, advertising/footer links, explicit inactive contact placeholders, no stale visible service claims, non-indexed error pages, valid breadcrumb destinations and 168 visible/schema FAQ pairs.
4. All five original calculator JavaScript suites.
5. tests/localization.test.cjs: numerical/state parity across all three languages and **674 runtime translation cases**.
6. JavaScript syntax check for the unchanged localization display script.
7. Rebuild stability check: generated HTML, sitemap and robots are byte-for-byte stable across repeated builds.
8. Regression comparison against the pre-change baseline: **script.js and assets/localization.js unchanged; all 15 calculator formula blocks byte-for-byte unchanged**. Favicons and the original audit were also preserved.
9. UTF-8 and no-Chinese-character checks passed for all website pages and catalogs.

No broken internal link or missing local fragment was found. Local HTTP validation cannot prove production DNS/TLS, Google crawlability, SMTP delivery, account approval, or actual rendered ad compliance.

## Remaining items before launch

| Priority | Remaining item | Why it cannot be completed from the current information |
|---|---|---|
| Public launch | Replace support@bizcalchub.top with a real monitored mailbox and confirm support languages. | The user requested a placeholder; no actual mailbox was supplied or verified. |
| Public launch | Confirm legal operator, hosting provider, privacy contact, retention practices, and applicable policy details. | Real business/deployment facts are unavailable and must not be invented. |
| Production indexing | Replace bizcalchub.top in BASE_URL; rebuild and verify real canonicals, hreflang, sitemap and robots. | The user explicitly authorized the temporary origin. |
| Deployment | Configure HTTPS/preferred-host/index-alias redirects, custom 404 routing and correct HTTP statuses. | No hosting provider or deployed configuration is available. |
| Before applicable tracking/ads | Select the actual analytics/ad providers, implement matching disclosures and consent controls, and test preference withdrawal. | Disclosure text alone does not implement services or consent. |
| Before monetization | Complete real AdSense site/account setup and add its valid publisher ads.txt entry when available. | No publisher identifier or account configuration was supplied. |
| Verification | Run visual checks across all languages and representative mobile widths, keyboard/screen-reader tests, PageSpeed/Lighthouse and production headers. | No browser is connected and no real production origin is supplied. |
| Live advertising | Verify actual units, non-obstruction, spacing around actions, layout stability, inventory exclusions and consent behavior. | Only placeholders exist, so live behavior cannot be audited. |

No fake tracking configuration, legal identity, publisher record, account approval, active contact channel or production compliance claim was added to bypass these gaps.

## Page inventory after fixes

Counts exclude header/footer/schema and are approximate. The error documents are intentionally short, ad-free utility pages, not advertising inventory.

| Page | Main words | Title/description characters | Indexable | Ad placeholders |
|---|---:|---:|---|---:|
| 404.html | 27 | 42/92 | No (404 document) | 0 |
| about.html | 445 | 33/134 | Yes, after origin configuration | 0 |
| advertising-disclosure.html | 302 | 50/142 | Yes, after origin configuration | 0 |
| calculators/break-even-calculator.html | 1270 | 49/149 | Yes, after origin configuration | 1 |
| calculators/markup-calculator.html | 991 | 52/148 | Yes, after origin configuration | 1 |
| calculators/profit-margin-calculator.html | 1210 | 52/157 | Yes, after origin configuration | 1 |
| calculators/roas-calculator.html | 1193 | 46/141 | Yes, after origin configuration | 1 |
| calculators/roi-calculator.html | 1079 | 47/153 | Yes, after origin configuration | 1 |
| contact.html | 204 | 35/145 | Yes, after origin configuration | 0 |
| de/404.html | 23 | 50/66 | No (404 document) | 0 |
| de/about.html | 378 | 38/113 | Yes, after origin configuration | 0 |
| de/advertising-disclosure.html | 239 | 43/124 | Yes, after origin configuration | 0 |
| de/calculators/break-even-calculator.html | 1067 | 37/149 | Yes, after origin configuration | 1 |
| de/calculators/markup-calculator.html | 884 | 43/145 | Yes, after origin configuration | 1 |
| de/calculators/profit-margin-calculator.html | 1021 | 41/144 | Yes, after origin configuration | 1 |
| de/calculators/roas-calculator.html | 1016 | 52/154 | Yes, after origin configuration | 1 |
| de/calculators/roi-calculator.html | 879 | 58/155 | Yes, after origin configuration | 1 |
| de/contact.html | 166 | 37/105 | Yes, after origin configuration | 0 |
| de/index.html | 204 | 55/152 | Yes, after origin configuration | 1 |
| de/privacy-policy.html | 439 | 50/122 | Yes, after origin configuration | 0 |
| de/terms.html | 352 | 49/114 | Yes, after origin configuration | 0 |
| es/404.html | 25 | 48/85 | No (404 document) | 0 |
| es/about.html | 468 | 47/131 | Yes, after origin configuration | 0 |
| es/advertising-disclosure.html | 284 | 52/133 | Yes, after origin configuration | 0 |
| es/calculators/break-even-calculator.html | 1394 | 56/139 | Yes, after origin configuration | 1 |
| es/calculators/markup-calculator.html | 1091 | 55/144 | Yes, after origin configuration | 1 |
| es/calculators/profit-margin-calculator.html | 1207 | 59/138 | Yes, after origin configuration | 1 |
| es/calculators/roas-calculator.html | 1268 | 48/150 | Yes, after origin configuration | 1 |
| es/calculators/roi-calculator.html | 1054 | 47/157 | Yes, after origin configuration | 1 |
| es/contact.html | 219 | 46/124 | Yes, after origin configuration | 0 |
| es/index.html | 274 | 45/157 | Yes, after origin configuration | 1 |
| es/privacy-policy.html | 557 | 60/129 | Yes, after origin configuration | 0 |
| es/terms.html | 397 | 56/135 | Yes, after origin configuration | 0 |
| index.html | 251 | 53/138 | Yes, after origin configuration | 1 |
| privacy-policy.html | 564 | 42/127 | Yes, after origin configuration | 0 |
| terms.html | 428 | 40/130 | Yes, after origin configuration | 0 |

## Changed files

See [changed-files.md](changed-files.md) for the complete file list. The original pre-launch audit is retained as historical evidence.

