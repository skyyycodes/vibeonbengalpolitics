# vibeonbengalpolitics.fun

A one-page vibe station — full-bleed background, live Kolkata clock, CRT grain, scrolling
ticker, and a YouTube playlist that loops the music. In the spirit of
[saloon.wtf](https://saloon.wtf/), [town-bus](https://town-bus.vercel.app/),
[roadways.wtf](https://roadways.wtf/).

No build step, no dependencies. Three files do the work: `index.html`, `styles.css`, `app.js`.

---

## Run it

```bash
cd vibeonbengalpolitics.fun
python3 -m http.server 8000
# → http://localhost:8000
```

Serve it over HTTP rather than opening `index.html` directly — YouTube's embedded player
refuses to load from `file://`.

## Add your stuff

**1. Songs** → YouTube video IDs in `config.js`. Nothing is hosted here.

```js
playlist: [
  '02e9eWn41NI',   // Mach Chor · Sagar Ghosh
  '8HXska9SEnQ',   // File Chor · Sagar Ghosh
],
shuffle: false,
playerPosition: 'right',   // 'center' | 'left' | 'right'
```

Paste the bit after `?v=` from a `youtube.com` or `music.youtube.com` link — full URLs are
accepted too and get parsed down to the ID. Titles come from YouTube, so there's nothing to
type. `shuffle: true` randomises the order on load.

Playback runs through YouTube's IFrame API. The player itself is parked off-screen
(`.yt-host` — rendered at 320x180 at `left:-10000px`, because a `display:none` or zero-size
iframe gets its playback blocked), and the pill proxies every control onto it: play, pause,
next, previous, seek, volume, mute, shuffle. Title, artist, artwork, duration and playlist
position are all read back from YouTube.

Note this is against YouTube's terms, which require the embedded player be visible and
unobscured. Nothing enforces it automatically, but it's worth knowing. Ads can still play,
and a video whose owner disables embedding is skipped after a moment.

**2. Background** → one ships with the site (`assets/bg/street.jpg`). To swap it, drop an
image or video into `assets/bg/` and point the `backgrounds` entry at it.

```js
backgrounds: [
  { src: 'assets/bg/street.jpg', focus: 'center 60%', dim: 0 },
],
```

- `focus` picks which slice survives the crop — `0%` pins the image's top edge (frame sits
  as low as it can go), `100%` pins the bottom edge (as high as it can go). `75%` trims sky
  `60%` keeps the billboards whole up top and the road in the foreground below.
- `dim` is how much black sits over the art. It's `0` — the picture runs at full
  brightness with nothing tinting it.

The image is **static** — no zoom, no pan, no vignette. The only thing over it is film
grain, and the clock and player each carry their own glass panel so the picture never
has to be darkened to keep text readable.

Add a second entry and a ⟳ button appears top-right to cross-fade between them (`b` on the
keyboard); `backgroundRotateSeconds: 30` auto-advances instead. With only one background
the button hides itself.

Videos autoplay muted and loop. Empty list — or a broken path — falls back to the built-in
animated gradient.

**3. Everything else** → `config.js`: title, the ticker lines, the
`grain` / `scanlines` / `flicker` toggles, and the birds.

```js
birds: true,
birdsEverySeconds: 15,   // one flight from each top corner per cycle
```

Two flocks cross the sky, one side at a time — nine birds in from the top left, then
`birdsEverySeconds` later seven from the top right, then left again. Each flock runs on a
double-length cycle offset by one interval, which is what staggers them. Sizes vary within
a flock so it reads as depth, and between flights they park off-screen so the loop restart
is never seen.
Pure CSS: the flight is a `transform` keyframe and the wingbeat animates the SVG `d`. Only `grain` is on — `scanlines` and `flicker`
are the CRT look, and they darken the picture.

## Keys

| | |
|---|---|
| `space` | play / pause |
| `←` `→` | seek 5s |
| `shift` + `←` `→` | prev / next track |
| `↑` `↓` | volume |
| `m` | mute |
| `s` | shuffle |
| `b` | change backdrop (with 2+ backgrounds) |
| `?` | key sheet |

Media keys and the OS lock-screen controls work too — track title and artwork are pushed
to the Media Session API.

## Mobile

Built for phones, not just shrunk for them:

- Layout is tuned at 900 / 640 / 380px, plus a landscape-phone case.
- Hover effects are gated behind `@media (hover: hover)` so they don't stick after a tap.
- Fixed elements respect `env(safe-area-inset-*)`, so nothing hides under a notch, a home
  indicator, or a rounded corner.
- Tap targets grow to 42-52px under `@media (pointer: coarse)`; the scrubber sets
  `touch-action: none` so dragging it seeks instead of scrolling the page.
- Add-to-home-screen metadata is set, so it opens chrome-less on iOS and Android.

Autoplay is blocked on mobile the same as desktop — tap play to start. iOS is stricter than
most: Safari can refuse programmatic playback of an off-screen iframe, so if it ever fails
there, the cause is the hidden player, not the wiring.

## Notes

- The clock is top-left and always shows `Asia/Kolkata` regardless of where the listener
  is — change `clockTimeZone` in `config.js`.
- There's no enter screen. The playlist is cued and waits for the first click on the
  player — browsers won't autoplay audio, and YouTube won't either.
- Volume, mute and shuffle persist in `localStorage`.
- Fonts come from Google Fonts (Anek Bangla + Space Mono). To go fully offline, drop the
  `<link>` tags in `index.html`; the CSS falls back to system Bengali fonts.
- Respects `prefers-reduced-motion`.

## Deploy

It's static. Any host works:

```bash
npx vercel deploy --prod      # or netlify deploy --prod --dir .
```

Point the `vibeonbengalpolitics.fun` domain at it and you're live.
