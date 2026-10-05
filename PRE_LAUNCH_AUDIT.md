> Archived audit: findings describe the earlier preparation snapshot and are superseded by PRODUCTION_READY_REPORT.md. Domain and contact literals have been normalized to the supplied production details; historical placeholder findings are not current status.

# Pre-launch SEO and Google AdSense readiness audit

Audit date: 2026-10-05  
Scope: all 30 HTML pages in English, German, and Spanish; shared CSS and JavaScript; localization catalogs and build configuration; favicon assets; sitemap.xml; robots.txt.  
Mode: read-only website audit. The only file created is PRE_LAUNCH_AUDIT.md. No site files, translations, calculator formulas, or JavaScript were modified.

## 1. Readiness decision

**Recommendation: resolve the launch blockers below before a public launch or AdSense application.**

The calculators provide a useful foundation: five distinct working tools, substantial explanations, worked examples, edge-case guidance, consistent navigation, and complete multilingual SEO annotations. However, the supporting pages still describe an unfinished earlier version, Contact has no functioning contact method, and Privacy does not yet describe a future advertising implementation. The intentionally temporary bizcalchub.top domain also needs replacement before production indexing.

This is an independent readiness assessment, not an AdSense approval prediction or legal compliance certification. Google decides approval. A short support page is not automatically a policy violation, and neither page count nor word count alone establishes approval readiness. Google's published readiness guidance emphasizes useful original content, user experience, and understandable navigation. [Google's AdSense readiness guidance](https://support.google.com/adsense/answer/7299563?hl=en)

### Priority definitions

- **P0 - launch gate:** resolve before the relevant public launch or ad activation.
- **P1 - important:** address before applying where practical.
- **P2 - improvement:** useful optimization; not independently an approval blocker.
- **Unverified:** requires deployed infrastructure, browser testing, or account information.

### Priority findings

| ID | Priority | Finding and affected scope | Recommended action |
|---|---|---|---|
| L01 | P0 before production indexing | All 30 canonicals, all hreflang URLs, and all 30 sitemap entries intentionally use https://bizcalchub.top. | Keep this during preparation as authorized. Replace the build BASE_URL with the actual production origin, regenerate, and validate before production is indexed. |
| L02 | P0 public launch | About, Privacy, and Terms contradict the working calculators in all three languages; all 30 footers refer to future estimates. | Update the English source and all catalogs together to describe the current service. Remove unfinished-version wording from titles/descriptions where applicable. |
| L03 | P0 practical launch readiness | All three Contact pages say a channel will be added later. There is no public email, contact form, or other actionable method. | Publish a real monitored contact method and explain its purpose. A contact form is optional; a working email can suffice. Do not invent an address or response-time promise. |
| L04 | P0 before ad activation | All three Privacy pages defer Google advertising and consent disclosures; hosting-provider details and privacy contact are unfinished. | Describe actual hosting and processing, calculator input handling, advertising technologies, data sharing, third parties, and user controls for the chosen implementation. |
| L05 | P0 if personalized ads are served in the EEA, UK, or Switzerland | No CMP or consent integration is present. German and Spanish pages increase the relevance of reviewing this traffic. | Select and configure a Google-certified CMP integrated with the IAB TCF for that advertising scenario; test consent and withdrawal before eligible ad requests. Language alone does not determine a visitor's location. |
| R01 | P1, unverified | No production origin or connected browser was available. Mobile layout, real ad placement, redirects, response headers, and Core Web Vitals cannot be certified. | Perform the production/browser checks in section 10. |
| C01 | P1 | About is generic and has no operator identity, editorial process, reviewer information, or review date. | Add truthful ownership and methodology details. Explain calculation scope and how issues are reported and corrected. |
| C02 | P1 | Homepage and About copy still identify the audience as English-speaking, including in German and Spanish. | Explain availability in all three languages and intended business users without implying the translated tools are English-only. |
| S01 | P2 | robots.txt permits crawling but has no Sitemap directive. | Add an absolute production sitemap URL after deployment, and submit it in Search Console. |
| S02 | P2 | Links use index.html while homepage canonicals/sitemap use directory URLs. Hosting redirect behavior is unknown. | Pick the directory URLs as the production convention; verify redirects from the three index.html aliases and consistent internal links. |
| S03 | P2 | Calculator breadcrumb schema uses relative index.html URLs and a homepage fragment rather than preferred absolute canonical URLs. | Consider absolute production URLs for breadcrumbs; validate deployed markup. A final breadcrumb item without an item URL is allowed. |
| S04 | P2 | FAQPage markup is accurate, but Google's FAQ rich-result feature is retired. | Keep useful visible FAQs. Treat retaining/removing redundant FAQPage markup as optional maintenance, not a launch requirement. |
| S05 | P2 | Some translated titles are verbose; one Spanish description is 175 characters. | Review clarity and likely truncation on real search previews. Length is a presentation consideration, not a fixed ranking rule. |
| A01 | P2 before monetization | Only ad placeholders exist; no AdSense site-verification setup, publisher ID, live units, or ads.txt was found. | Use the account-provided setup after policy decisions. Add a genuine publisher ads.txt entry when available; never invent one. |

Privacy disclosure obligations are described in [Google's privacy disclosures policy](https://support.google.com/publisherpolicies/answer/10437794?hl=en). The conditional certified-CMP requirement above comes from [Google's publisher consent management requirements](https://support.google.com/adsense/answer/13554116?hl=en). Contact and operator recommendations are this audit's practical trust/readiness judgment, not a claim that Google mandates a particular contact-page format.

## 2. What was checked and what passed

- Parsed and checked all 30 local HTML pages, not only the English templates.
- Re-ran tests/check_locales.py without running the build or changing generated files. It passed all 30 pages, 769 local references and fragments, and 35 distinct page/asset HTTP resources served locally.
- Re-ran all five original calculator suites directly with Node. They passed input validation, zero denominators, losses where applicable, overflow, examples, reset, and calculation checks.
- Re-ran tests/localization.test.cjs. It passed numeric/state parity in all three languages and 674 runtime translation cases.
- All pages have UTF-8 declarations, the expected html language, a viewport declaration, one H1, a nonempty title and description, one expected canonical, two favicon links, and en/de/es/x-default alternates.
- All 30 title strings and all 30 meta descriptions are unique as strings. All 30 main-content HTML blocks differ; this is an exact-duplicate check, not proof of editorial originality.
- All three catalogs have matching static/runtime keys, populated translations, and matching runtime placeholders. No missing translations or Chinese characters were detected by the automated checks.
- All 15 calculator pages contain parseable FAQPage and BreadcrumbList JSON-LD. Every one of their 168 schema questions/answers matches a visible FAQ pair.
- The sitemap has 30 unique entries and reciprocal language annotations matching the HTML.
- Navigation, language switches, footer links, skip links, stylesheets, script references, and favicon paths resolve locally. No broken internal reference or missing fragment was found.
- The one unique external editorial link, Google's Target ROAS guidance, was fetched successfully. It appears on the three ROAS pages and currently uses an English destination.

**Limits:** local HTTP checks do not prove public crawlability or production responses. No browser was connected, so there was no visual mobile inspection, rendered accessibility assessment, Lighthouse run, or live-ad verification. Search Console status, Google-selected canonicals, account eligibility, public DNS/TLS, host headers, real traffic, and content ownership were not accessible.

## 3. Page-by-page inventory

Main-content word counts are approximate whitespace counts, excluding navigation/footer and JSON-LD, and including visible guide/form/FAQ text. Language word counts are not directly comparable. They are diagnostic observations, not minimum content requirements.

T/D are decoded title/description character counts. Every row passed the local links, metadata-presence, canonical-pattern, hreflang, UTF-8, and H1 checks. The findings column records the remaining page-specific editorial or readiness concern; L01 and R01 apply to all rows.

| Page | Main words | T/D chars | Visible FAQs | Ad placeholders | Findings |
|---|---:|---:|---:|---:|---|
| about.html | 88 | 33/102 | 0 | 0 | L02; C01; C02 |
| calculators/break-even-calculator.html | 1270 | 49/149 | 12 | 1 | Helpful guide; S03/S04; review ad |
| calculators/markup-calculator.html | 991 | 52/148 | 10 | 1 | Helpful guide; S03/S04; review ad |
| calculators/profit-margin-calculator.html | 1210 | 52/157 | 10 | 1 | Helpful guide; S03/S04; review ad |
| calculators/roas-calculator.html | 1193 | 46/141 | 12 | 1 | Helpful guide; S03/S04; review ad |
| calculators/roi-calculator.html | 1079 | 47/153 | 12 | 1 | Helpful guide; S03/S04; review ad |
| contact.html | 55 | 35/105 | 0 | 0 | L03; unfinished page |
| de/about.html | 80 | 38/102 | 0 | 0 | L02; C01; C02 |
| de/calculators/break-even-calculator.html | 1067 | 62/149 | 12 | 1 | Helpful guide; S03/S04; review ad |
| de/calculators/markup-calculator.html | 884 | 68/145 | 10 | 1 | Helpful guide; S03/S04; review ad |
| de/calculators/profit-margin-calculator.html | 1021 | 66/144 | 10 | 1 | Helpful guide; S03/S04; review ad |
| de/calculators/roas-calculator.html | 1016 | 52/154 | 12 | 1 | Helpful guide; S03/S04; review ad |
| de/calculators/roi-calculator.html | 879 | 58/155 | 12 | 1 | Helpful guide; S03/S04; review ad |
| de/contact.html | 55 | 37/113 | 0 | 0 | L03; unfinished page |
| de/index.html | 200 | 55/152 | 3 | 1 | C02; S02; review homepage ad |
| de/privacy-policy.html | 128 | 50/109 | 0 | 0 | L02; L04; L05 conditional |
| de/terms.html | 146 | 49/110 | 0 | 0 | L02; finalize operator/terms |
| es/about.html | 103 | 47/114 | 0 | 0 | L02; C01; C02 |
| es/calculators/break-even-calculator.html | 1394 | 62/175 | 12 | 1 | Helpful guide; S03/S04; review ad |
| es/calculators/markup-calculator.html | 1091 | 55/144 | 10 | 1 | Helpful guide; S03/S04; review ad |
| es/calculators/profit-margin-calculator.html | 1207 | 59/138 | 10 | 1 | Helpful guide; S03/S04; review ad |
| es/calculators/roas-calculator.html | 1268 | 48/150 | 12 | 1 | Helpful guide; S03/S04; review ad |
| es/calculators/roi-calculator.html | 1054 | 47/157 | 12 | 1 | Helpful guide; S03/S04; review ad |
| es/contact.html | 62 | 46/107 | 0 | 0 | L03; unfinished page |
| es/index.html | 272 | 68/157 | 3 | 1 | C02; S02; review homepage ad |
| es/privacy-policy.html | 140 | 60/116 | 0 | 0 | L02; L04; L05 conditional |
| es/terms.html | 166 | 56/121 | 0 | 0 | L02; finalize operator/terms |
| index.html | 243 | 53/138 | 3 | 1 | C02; S02; review homepage ad |
| privacy-policy.html | 135 | 42/105 | 0 | 0 | L02; L04; L05 conditional |
| terms.html | 146 | 40/100 | 0 | 0 | L02; finalize operator/terms |

## 4. Supporting pages, navigation, and footer

### Privacy Policy - needs launch work

Affected: privacy-policy.html, de/privacy-policy.html, es/privacy-policy.html.

The pages exist and are reachable from every footer. They discuss hosting logs, cookies, analytics, and advertising, which is a useful outline. However, they say the site has no interactive calculators, refer to an initial static version, defer hosting-provider details, and promise a future contact channel.

The current statement that no advertising/analytics scripts or site-created cookies are installed is consistent with the inspected client code today. It must be reassessed when any such service is introduced. No current live-ad privacy violation is asserted, because no AdSense integration is present.

Before launch, describe the actual deployed operator and hosting arrangement, provide a privacy contact and effective/review date, and explain that calculator inputs are processed locally by the current calculator code. Before advertising, disclose applicable Google/third-party collection, cookies or similar technologies, sharing and use, and the applicable choice/consent flow. Google's policy specifically calls for relevant ad-serving disclosures; a prominent link explaining Google's data use is one supported approach. [Google privacy disclosures](https://support.google.com/publisherpolicies/answer/10437794?hl=en)

Do not claim that the entire website never sends any information to servers: ordinary requests already reach the host, and advertising can introduce additional requests. Keep the narrower calculator-input claim separate from hosting and advertising. Add retention/rights/transfer details only as appropriate to actual operations and applicable obligations, rather than copying promises that cannot be honored.

### Terms of Use - stale claims

Affected: terms.html, de/terms.html, es/terms.html.

Terms include general-information disclaimers, responsibility for verification, accuracy limitations, acceptable use, and future updates. The problem is factual: they describe calculator pages as placeholders and interactive calculations as unavailable. All five tools now work.

Update tool availability, current estimate limitations, operator/contact details, effective date, and any relevant permitted-use or content-rights statements. Preserve the distinction between educational estimates and professional advice. Do not present these generic terms as jurisdiction-specific legal advice or certified legal protection.

### About - too generic for strong publisher trust

Affected: about.html, de/about.html, es/about.html.

The main content is approximately 80-103 words and says interactive tools are coming soon. It does not identify who runs the site or how calculation/content accuracy is reviewed. Expand with truthful operator information, purpose, available tools, methodology, correction/contact process, and real qualifications if any. Never manufacture expert credentials, company history, or customer testimonials.

### Contact - unfinished

Affected: contact.html, de/contact.html, es/contact.html.

Approximately 55-62 main-content words currently offer ideas for feedback but no way to send it. The statement that messages are not accepted is honest, yet leaves visitors with an unfinished support experience. Add a monitored email or tested form, purposes such as formula corrections/accessibility reports, and an accurate support-language explanation. A phone number, physical office, or guaranteed response time should only be supplied if real and relevant.

### Navigation and footer - technically sound, editorially stale

All pages have Home, Calculators, About, and Contact in the header, corresponding-page language links, and About/Contact/Privacy/Terms in the footer. Calculator pages include breadcrumbs and a return-to-calculators link. The homepage lists all five tools. Local navigation remains in the selected language except deliberate language-switch links.

Mobile menu code supports toggling, Escape, and closing after navigation. With JavaScript disabled, the ordinary navigation remains visible and calculator use receives a localized noscript explanation. This is a source-code assessment, not a browser interaction certification.

All 30 footers still describe future calculator estimates. Update this wording together with the support pages. Consider more contextual related-tool links where useful; the header's Calculators link currently returns to the homepage section rather than a separate directory.

## 5. AdSense content-quality assessment

| Check | Assessment | Evidence and remaining work |
|---|---|---|
| Clear user purpose | Pass | Free business planning, pricing, profitability, investment, and advertising calculations are explicit. |
| Helpful calculator content | Strong foundation | All 15 language calculator pages include working tools, formulas, explanations, worked examples, and 10-12 FAQs. |
| Thin-content risk | Support-page concern | About/Contact are brief and generic or unfinished. Policies need accurate specifics. The homepage serves a directory purpose and need not resemble a long article. |
| Duplicate-content risk | No exact local main-content duplicates found | Shared layout/footer text and genuine translations are expected. Production index.html aliases need consolidation. |
| Originality | Not externally certified | Guides are topic-specific and add explanations/edge cases beyond bare formulas; ownership, plagiarism, and external similarity were not independently established. |
| Clear navigation | Local pass | All 769 local references/fragments passed; no missing destination identified. |
| Misleading claims | Needs correction | Support pages say working calculators are unavailable. No guaranteed earnings or fabricated real-company results were identified in the reviewed guides. |
| Suitable advertising content | No obvious topic restriction identified | Ordinary educational business tools; no inspected page centers on prohibited material. This is not an exhaustive future-content/account policy clearance. |
| Languages | Supported | English, German, and Spanish are listed as supported Google publisher languages. |
| Ads dominating content | Not currently assessable with live ads | One placeholder per homepage/calculator page; no live ads. Support pages have none. |

Google emphasizes original relevant content and an understandable visitor experience; copying or reproducing external material without meaningful value is not an adequate content strategy. [AdSense readiness guidance](https://support.google.com/adsense/answer/7299563?hl=en) The current language choice is supported by [Google's publisher-language list](https://support.google.com/adsense/answer/9727?hl=en).

Google prohibits ads on low-value, unfinished, and certain non-content screens. Keep unfinished Contact or error/confirmation pages outside ad inventory; continue keeping policy/support pages ad-free as a sensible site decision, rather than asserting that every completed policy page is universally prohibited inventory. [Google's publisher-content policy](https://support.google.com/publisherpolicies/answer/11112688?hl=en)

### Calculator-by-calculator editorial findings

- **Profit margin:** clear differences between revenue, costs, gross/net scope, and markup; handles losses and zero denominators. Add a transparent review/source note and a practical cost-scope checklist if useful.
- **Markup:** helpful comparison with margin, percentage-entry explanation, pricing example, and zero-cost limitations. Clarify which shipping/fees/overhead a reader should include for their intended pricing measure.
- **ROI:** defines total final return including recovered capital, allows signed final returns, and discloses that it is simple rather than annualized ROI. A dated review/methodology note would improve trust.
- **ROAS:** distinguishes attributed revenue from net profit and ROI, warns against universal benchmarks, and provides illustrative examples. Its only external source is Google Ads; localized outbound versions would improve the translated reader experience where available.
- **Break even:** explains constant unit economics, contribution margin, fractional versus whole-unit targets, and nonpositive contributions. Additional sensitivity scenarios would add distinct practical value without changing the calculator formula.

Retain original case explanations and genuinely useful comparisons. Do not add filler articles merely to hit a target number of pages. Google's people-first guidance favors material that serves the intended audience and makes its trust basis understandable. [Google helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)

Translations are not automatically an SEO duplicate-content problem. The language URLs are separated, the visible text is translated, and each version has its own canonical and reciprocal language alternatives. Do not canonicalize all German/Spanish pages to English. [Google multilingual site guidance](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)

## 6. Metadata, canonicals, hreflang, sitemap, and robots

### Titles and meta descriptions

All 30 have unique nonempty title/description strings and an appropriate single H1. No metadata is missing. Titles describe the tool or support-page intent; descriptions broadly align with content.

Presentation issues to review:

- de/calculators/markup-calculator.html: 68 title characters.
- de/calculators/profit-margin-calculator.html: 66 title characters.
- es/index.html: 68 title characters.
- de/calculators/break-even-calculator.html and es/calculators/break-even-calculator.html: 62 title characters each.
- es/calculators/break-even-calculator.html: 175 description characters.
- Support-page descriptions refer to initial policies, future updates, or English-speaking users and should change with the editorial repairs.

These are review flags, not invalid tags. Google may truncate or generate different title/snippet text; no universal character count guarantees the displayed result. Prefer concise, specific, natural phrasing rather than keyword repetition. [Google title guidance](https://developers.google.com/search/docs/appearance/title-link), [Google snippet guidance](https://developers.google.com/search/docs/appearance/snippet)

No Open Graph or social-card metadata was found. These are optional sharing improvements, not missing mandatory Google ranking metadata. A meta keywords tag is not a necessary addition.

### Canonical URLs

All 30 contain the expected unique absolute canonical pattern. Homepages canonicalize to /, /de/, and /es/; other pages use their language-specific .html paths. This is correct for the intended directory-index hosting design.

The bizcalchub.top origin is an authorized temporary placeholder, not an implementation surprise. It is a production launch gate because a deployed site must not keep canonicalizing to an unrelated placeholder domain. Replace it in the generator before the actual site is publicly indexed, not by editing translated output alone.

Internal links commonly use index.html while canonicals use directory URLs. If both return 200 in production, canonical tags help consolidate, but redirects and consistent linking are stronger cleanup. Verify HTTP-to-HTTPS, preferred host, and index-alias behavior on the real host. [Google canonicalization guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

### Hreflang

Pass locally: all 30 pages have en/de/es/x-default annotations, including their own language and matching return links. Each alternate maps to the same page topic; x-default points to English. The sitemap agrees. Language switches are normal crawlable links, and no automatic language redirect was identified.

Preserve language self-canonicals and keep the annotations synchronized after any URL/domain change. Public alternatives must actually be accessible at the advertised URLs; local validation cannot establish that. [Google localized-version guidance](https://developers.google.com/search/docs/specialty/international/localized-versions)

### Sitemap.xml

Pass structurally: UTF-8 XML, 30 unique canonical-pattern locations, all language versions included, and matching xhtml alternative entries with the required namespace. There is no lastmod value; that is not a broken sitemap. If added later, use genuine meaningful update dates.

Replace the placeholder origin, confirm the root sitemap returns the intended XML publicly, then submit it in Search Console. Keep redirects, error URLs, or deliberate non-indexable pages out of the submitted sitemap. [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

### Robots.txt

Current contents permit all crawling through User-agent: * and Allow: /. No accidental language-folder disallow was found. A comment promises an eventual Sitemap URL, but the actual directive is missing. Recommend adding Sitemap: https://PRODUCTION-DOMAIN/sitemap.xml after the origin is known; omission is not itself a crawler block.

No HTML noindex was identified. Production X-Robots-Tag headers remain unverified. Allowing crawling does not guarantee indexing, and a staging site should not rely on an bizcalchub.top canonical as its only indexing safeguard.

## 7. Structured data

All 15 calculator pages contain FAQPage and BreadcrumbList. The 168 FAQ question/answer pairs agree with visible content in the corresponding language. JSON syntax is valid, breadcrumb positions are ordered, and missing an item URL on the last breadcrumb is permitted. This is local syntax/content validation, not a Google Rich Results Test result. [Google breadcrumb guidance](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)

Recommended breadcrumb cleanup: replace ../index.html and ../index.html#calculators with deliberate absolute production canonical destinations when practical. Relative URLs are a consistency concern rather than a conclusively invalid schema claim. There is no separate Calculators directory page today, so choose the breadcrumb hierarchy accordingly.

**Current Google change:** FAQ rich results stopped appearing from May 7, 2026, and Google removed the feature documentation in June 2026. Do not use obsolete government/health-only eligibility advice as the current opportunity assessment. Retaining accurate FAQPage markup is optional; the visible FAQs remain helpful. [Google Search documentation changelog](https://developers.google.com/search/updates)

The home/support pages have no JSON-LD. That is not a mandatory-metadata failure. Optional WebSite/Organization identity markup should reflect the real brand, operator, production URLs, and real contact data. Add a calculator-appropriate application schema only if its claims/properties are accurate; do not invent ratings, review counts, expertise, or a guaranteed rich-result benefit.

## 8. Mobile responsiveness and loading speed

### Source-level positives

All pages specify the viewport. CSS includes responsive breakpoints at 640, 900, and 960 pixels. Calculator layouts, result cards, homepage cards, and footer columns adapt to smaller widths. Input widths are constrained; calculator buttons wrap; result text can wrap. Tables are intentionally inside horizontally scrollable regions with a 520px minimum table width. Header language links wrap and stay independent of the collapsed mobile navigation. Focus styles, skip links, labels, live results, and reduced-motion handling are present.

Static translated HTML makes page text and SEO metadata available without a translation fetch. Shared script.js is 23,340 bytes; style.css is 12,465 bytes; localization.js is 1,911 bytes. HTML ranges from roughly 3.3 KB to 31.6 KB uncompressed. The translated calculator pages embed the full runtime-message dictionary, contributing repeated bytes but avoiding an extra request.

### Unverified risks and recommendations

- Test all 30 pages at representative widths such as 320, 375, 390, 640, 768, and 1024 pixels, including portrait/landscape and long German labels.
- Check whole-page horizontal overflow separately from intentional table scrolling.
- Check header/menu/language-switch wrapping, footer wrapping, and comfortably usable tap targets. The compact language links warrant inspection; no universal AdSense-specific tap-size rule is asserted.
- Test decimal entry, negative permitted final returns, large results, error text, example buttons, and reset in actual browsers. Numeric formatting intentionally remains en-US; provide clear locale-appropriate input instructions without changing formulas.
- Check keyboard navigation and screen-reader announcements, including whether the display-only mutation observer produces duplicate or initially English error announcements.
- Use Lighthouse/PageSpeed and, when available, field data to evaluate loading, interactivity, and layout stability. Do not infer a Core Web Vitals pass from small file sizes.
- Configure production compression/caching and re-measure after CMP/AdSense integration. Render-blocking CSS, host latency, and third-party ad scripts are not represented by local asset-size checks.
- If repetition becomes material, consider building page-specific runtime dictionaries while preserving the existing arithmetic and behavior. This is an optional performance improvement.

## 9. Ad placement and integration readiness

There are **18 placeholders**: the three homepages and 15 calculator pages each have one. The 12 supporting pages have none. Placeholders are visibly labeled Advertisement or its translation, separated from content, and are not links, simulated Calculate buttons, or live ads.

Homepage placeholders sit between the hero and calculator directory. Calculator placeholders follow the calculator panel in DOM order and appear alongside it in the desktop grid; the layout stacks at smaller widths. This is a reasonable starting structure, but the mobile calculator ad will be between the tool/results and explanatory guide. Evaluate the actual ad size and separation before activation.

No live AdSense code, publisher identifier, consent integration, ads.txt, auto-refresh, or ad overlay was identified. Placeholder presence is not evidence of approval or policy-compliant live inventory.

Before enabling ads:

1. Keep the tool and explanatory content prominent; start conservatively on complete helpful pages.
2. Keep clear separation from Calculate, Reset, example buttons, navigation, inputs, and interactive results. Do not style an ad as a calculator action or invite clicks.
3. Check actual desktop/mobile rendering and avoid overlays or ads obscuring the tool.
4. Reserve appropriate space for the chosen responsive units. Current minimum heights of 125px, or 100px in some stacked calculator layouts, do not guarantee zero layout shift for a real unit.
5. Do not trigger ad refreshes on each calculation/reset or expose calculator input values in ad targeting or analytics requests.
6. If using Auto ads, review exclusions and injected placements rather than assuming the current manual placeholder controls all inventory.
7. Complete the actual account-provided site verification/code setup and evaluate the CMP/data flow for targeted regions.
8. Add the real ads.txt record supplied for the publisher account when available, and verify public availability. Google describes ads.txt as highly recommended, not mandatory. [Google ads.txt guide](https://support.google.com/adsense/answer/12171612?hl=en)

Google's placement guidance requires avoiding misleading presentation and accidental clicks near interactive controls. These are design checks, not a universal pixel-separation formula. [Google ad placement policies](https://support.google.com/adsense/answer/1346295?hl=en) Review the general program rules again at implementation time, including legitimate traffic and prohibitions on self-clicking. [AdSense program policies](https://support.google.com/adsense/answer/48182?hl=en)

## 10. Missing pages and practical launch sequence

### Pages/functions that need completion

- A **working contact channel** on the existing Contact pages; a new page is not needed.
- A more informative **About/operator section** and updated Privacy/Terms in all languages.
- A **custom 404 experience**, configured to return a real HTTP 404, with navigation back to useful content and no ad inventory. No custom 404 file or hosting behavior was available to verify.
- A **privacy/consent settings entry point** where the chosen advertising/consent implementation requires it; this may be a UI control rather than a separate page.

### Optional additions with real user value

- A calculation-methodology/editorial-review page explaining assumptions, update practices, limitations, and correction reporting.
- Focused guides on margin versus markup, cost classification, ROAS versus ROI, or break-even scenario planning, with original cases and contextual tool links.
- A dedicated calculator directory if the collection grows beyond the current five; the homepage section is adequate now.
- An accessibility feedback statement if it accurately describes supported testing and a real reporting route.
- Jurisdiction-specific operator/legal information if the real business and audience require it. German/Spanish translations alone are insufficient to determine legal obligations.

A blog, dozens of extra pages, analytics installation, or fabricated reviewer credentials are not prerequisites to recommend simply for approval. None of the core About/Contact/Privacy/Terms pages is missing as a URL; their accuracy and usefulness need improvement.

### Recommended sequence

1. Finish truthful operator/contact information and repair stale English/support/footer statements.
2. Update all locale catalogs and rebuild translated pages together; re-run local checks without changing calculator logic.
3. Deploy to the actual HTTPS origin; replace placeholder SEO origins; configure the preferred host and homepage aliases.
4. Verify all 30 advertised URLs, sitemap, robots, asset paths, real status codes, mobile layouts, calculator interactions, and server indexing headers.
5. Verify the Search Console property, submit the production sitemap, inspect representative pages from each language, and validate breadcrumb structured data on live URLs. Search Console is a verification aid, not a guarantee of indexing or an AdSense prerequisite.
6. Finalize advertising disclosures and applicable consent/CMP behavior; select inventory and placements conservatively; complete legitimate publisher setup.
7. Re-test layout/performance and privacy behavior with actual third-party integration; then consider the AdSense application.

### Production acceptance checklist

- [ ] No bizcalchub.top origin remains in production canonicals, hreflang, or submitted sitemap.
- [ ] All 30 canonical destinations return the intended page without an authentication barrier; language alternatives work reciprocally.
- [ ] HTTP/host/index aliases consolidate intentionally; missing URLs return 404 rather than an unrelated 200 page.
- [ ] Navigation, switches, footer and related-tool links work on real devices.
- [ ] Support pages describe the live service and contain a real contact method.
- [ ] Privacy/consent information matches actual hosting, advertising, and data flows.
- [ ] Browser/mobile/performance tests complete, including long translated labels and loaded ad units.
- [ ] No ads obscure controls, imitate navigation/actions, dominate publisher content, or appear on unfinished/error screens.
- [ ] Original-content ownership and factual review are confirmed by the operator.
- [ ] Search Console, public sitemap/robots, and relevant structured-data validation have been reviewed.

## 11. Exact metadata inventory

Values below are the current decoded text. Their presence/uniqueness passed; this does not imply every editorial statement is launch-ready. Canonical/hreflang checks passed against the authorized temporary origin.

| Page | Current title | Current meta description |
|---|---|---|
| about.html | About \| Free Business Calculators | Learn about our mission to make business planning simpler for English-speaking users around the world. |
| calculators/break-even-calculator.html | Break Even Calculator - Free Units & Revenue Tool | Calculate break even units, revenue, and contribution margin from fixed costs, unit price, and variable cost. Free calculator with examples and FAQs. |
| calculators/markup-calculator.html | Markup Calculator - Free Selling Price & Margin Tool | Calculate selling price, profit amount, and profit margin from cost and markup percentage. Free markup calculator with formulas, examples, and FAQs. |
| calculators/profit-margin-calculator.html | Profit Margin Calculator - Free Margin & Markup Tool | Calculate profit, profit margin percentage, and markup from revenue and cost with our free Profit Margin Calculator. Includes formulas, an example, and FAQs. |
| calculators/roas-calculator.html | ROAS Calculator - Free Return on Ad Spend Tool | Calculate ROAS ratio, ROAS percentage, and revenue minus ad spend. Free advertising calculator with examples, benchmarks, formulas, and FAQs. |
| calculators/roi-calculator.html | ROI Calculator - Free Return on Investment Tool | Calculate profit and return on investment from initial investment and final return. Free ROI calculator with examples, loss handling, formulas, and FAQs. |
| contact.html | Contact \| Free Business Calculators | Find contact and feedback information for Free Business Calculators and learn about support availability. |
| de/about.html | Über uns - Kostenlose Business-Rechner | Erfahren Sie, wie wir die Geschäftsplanung für englischsprachige Nutzer weltweit vereinfachen möchten. |
| de/calculators/break-even-calculator.html | Break-even-Rechner - Kostenloses Werkzeug für Menge und Umsatz | Break-even-Menge, Umsatz und Deckungsbeitrag aus Fixkosten, Stückpreis und variablen Kosten berechnen. Kostenloser Rechner mit Beispielen und Fragen. |
| de/calculators/markup-calculator.html | Aufschlagsrechner - Kostenloses Werkzeug für Verkaufspreis und Marge | Verkaufspreis, Gewinnbetrag und Gewinnmarge aus Kosten und Aufschlag berechnen. Kostenloser Aufschlagsrechner mit Formeln, Beispielen und Fragen. |
| de/calculators/profit-margin-calculator.html | Gewinnmargenrechner - Kostenloses Werkzeug für Marge und Aufschlag | Gewinn, Gewinnmarge und Aufschlag aus Umsatz und Kosten mit unserem kostenlosen Gewinnmargenrechner berechnen. Mit Formeln, Beispiel und Fragen. |
| de/calculators/roas-calculator.html | ROAS-Rechner - Kostenloses Werkzeug für Werberendite | ROAS-Verhältnis, ROAS-Prozentsatz und Umsatz minus Werbeausgaben berechnen. Kostenloser Werberechner mit Beispielen, Vergleichswerten, Formeln und Fragen. |
| de/calculators/roi-calculator.html | ROI-Rechner - Kostenloses Werkzeug für Investitionsrendite | Gewinn und Investitionsrendite aus Anfangsinvestition und Endwert berechnen. Kostenloser ROI-Rechner mit Beispielen, Verlustbehandlung, Formeln und Fragen. |
| de/contact.html | Kontakt - Kostenlose Business-Rechner | Kontakt- und Feedbackinformationen für Kostenlose Business-Rechner sowie Hinweise zur Verfügbarkeit des Supports. |
| de/index.html | Kostenlose Business-Rechner - Gewinnmarge, ROI und mehr | Kostenlose Rechner für Gewinnmarge, Aufschlag, ROI, ROAS und Break-even für Unternehmen in den USA und weltweit. Klare Formeln und praktische Beispiele. |
| de/privacy-policy.html | Datenschutzerklärung - Kostenlose Business-Rechner | Lesen Sie die erste Datenschutzerklärung zu Datenerfassung, Werbeplatzhaltern und künftigen Aktualisierungen. |
| de/terms.html | Nutzungsbedingungen - Kostenlose Business-Rechner | Lesen Sie die Bedingungen zu Bildungszwecken, Rechnerverfügbarkeit und den Grenzen geschäftlicher Schätzungen. |
| es/about.html | Acerca de: calculadoras empresariales gratuitas | Conoce nuestra misión de simplificar la planificación empresarial para usuarios de habla inglesa de todo el mundo. |
| es/calculators/break-even-calculator.html | Calculadora de punto de equilibrio: unidades e ingresos gratis | Calcula unidades de equilibrio, ingresos y margen de contribución con costes fijos, precio unitario y coste variable. Calculadora gratuita con ejemplos y preguntas frecuentes. |
| es/calculators/markup-calculator.html | Calculadora de recargo: precio de venta y margen gratis | Calcula precio de venta, beneficio y margen a partir del coste y el recargo. Calculadora gratuita con fórmulas, ejemplos y preguntas frecuentes. |
| es/calculators/profit-margin-calculator.html | Calculadora de margen de beneficio: margen y recargo gratis | Calcula beneficio, porcentaje de margen y recargo con ingresos y coste. Calculadora gratuita con fórmulas, ejemplo y preguntas frecuentes. |
| es/calculators/roas-calculator.html | Calculadora de ROAS: retorno publicitario gratis | Calcula proporción ROAS, porcentaje ROAS e ingresos menos publicidad. Calculadora gratuita con ejemplos, referencias, fórmulas y preguntas frecuentes. |
| es/calculators/roi-calculator.html | Calculadora de ROI: retorno de inversión gratis | Calcula beneficio y retorno de inversión con inversión inicial y retorno final. Calculadora gratuita con ejemplos, pérdidas, fórmulas y preguntas frecuentes. |
| es/contact.html | Contacto: calculadoras empresariales gratuitas | Información de contacto y comentarios de Calculadoras empresariales gratuitas y disponibilidad del soporte. |
| es/index.html | Calculadoras empresariales gratuitas: margen de beneficio, ROI y más | Calculadoras gratuitas de margen de beneficio, recargo, ROI, ROAS y punto de equilibrio para empresas de todo el mundo. Fórmulas claras y ejemplos prácticos. |
| es/privacy-policy.html | Política de privacidad: calculadoras empresariales gratuitas | Lee la política de privacidad inicial sobre recopilación de datos, espacios publicitarios y futuras actualizaciones. |
| es/terms.html | Condiciones de uso: calculadoras empresariales gratuitas | Lee las condiciones sobre uso educativo, disponibilidad de calculadoras y limitaciones de las estimaciones empresariales. |
| index.html | Free Business Calculators \| Profit Margin, ROI & More | Use free profit margin, markup, ROI, ROAS, and break even calculators for US and global businesses. Clear formulas and practical examples. |
| privacy-policy.html | Privacy Policy \| Free Business Calculators | Read the initial privacy policy, including data collection, advertising placeholders, and future updates. |
| terms.html | Terms of Use \| Free Business Calculators | Read terms covering educational use, calculator availability, and limitations of business estimates. |

## 12. Change record

Created only: PRE_LAUNCH_AUDIT.md.

Website files remain unchanged. No approval submission, ad integration, deployment, domain replacement, calculator modification, or policy rewrite was performed. Recommendations above require a separate implementation request.

This report separates observed local evidence from Google policy references and from production checks that could not be performed.

