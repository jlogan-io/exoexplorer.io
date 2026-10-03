# exoexplorer.io

The website for [ExoExplorer](https://exoexplorer.io/), an iOS app that draws every confirmed planetary
system in NASA's Exoplanet Archive in 3D. It is also where the App Store listing's support,
marketing and privacy-policy URLs point.

Plain HTML and CSS, no build step, served by GitHub Pages from `main`.

```
index.html            home page
support/index.html    contact + FAQ          → App Store "Support URL"
privacy/index.html    privacy policy         → App Store "Privacy Policy URL"
terms/index.html      terms of use
404.html              GitHub Pages' not-found page
assets/site.css       all styles
assets/transit.js     the hero animation (the only script on the site)
assets/img/           icons, social card, app screenshots
CNAME                 exoexplorer.io
```

## Previewing

```bash
python3 -m http.server 4321
```

then open http://localhost:4321.

## Rules the site keeps

- **Nothing loads from another domain** — no web fonts, analytics, embeds or CDNs. The privacy
  policy says so; adding any of them means changing the policy first.
- **The privacy policy describes the app as built.** If the app gains a network request, an SDK or
  any data collection, update `privacy/index.html` (and the app's own `app/privacy.tsx`) before that
  version ships, and change the effective date.
- **Figures are real.** The hero's planet counts come from the app's bundled archive snapshot, and the
  light curve is computed from the drawn geometry (see the comment at the top of `transit.js`).

## When the app goes live

Replace the "Coming soon" status in `index.html` with the comment's link:

```html
<a class="store" href="https://apps.apple.com/app/id6804550234">Download on the App Store</a>
```

## DNS (Cloudflare)

Apex records point at GitHub Pages, set to **DNS only** (grey cloud) so GitHub can issue the HTTPS
certificate:

| Type  | Name | Content                                                                            |
| ----- | ---- | ---------------------------------------------------------------------------------- |
| A     | @    | 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153                 |
| AAAA  | @    | 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153 |
| CNAME | www  | jlogan-io.github.io                                                                |

Mail for support@exoexplorer.io is iCloud+ Custom Email Domain; its MX, SPF, DKIM and verification
records come from iCloud Settings.
