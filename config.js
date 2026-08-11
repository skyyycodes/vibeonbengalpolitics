/* ─────────────────────────────────────────────────────────────
   vibeonbengalpolitics.fun — the only file you need to edit.

   Music plays through YouTube's embedded player, so nothing is
   hosted here: add or reorder the `playlist` IDs below.
   Backgrounds go in assets/bg/ and are listed under `backgrounds`.
   ───────────────────────────────────────────────────────────── */

window.VIBE_CONFIG = {
  // ── Site identity ──────────────────────────────────────────
  title:    'ভাইব অন বেঙ্গল পলিটিক্স',
  subtitle: 'vibeonbengalpolitics.fun',
  // Clock, top-left. Always shows this zone's time, wherever the listener is.
  clockTimeZone: 'Asia/Kolkata',

  // ── Background ─────────────────────────────────────────────
  //   src    path to the file (.jpg .png .webp .gif .mp4 .webm)
  //   focus  which slice of the image survives the crop to the viewport
  //          ('center 30%' — 0% is the top edge, 100% the bottom edge)
  //   dim    0 = full brightness, 1 = blacked out
  //
  // Add more entries and a ⟳ button appears to cross-fade between them.
  // Empty list → built-in animated gradient.
  backgrounds: [
    {
      src:   'assets/bg/street.jpg',
      label: 'ma ader moddhe k bhalo?',
      focus: 'center 60%',   // Raise toward 100% to lift the frame, lower toward 0%
                             // to drop it. 60% keeps the billboards whole up top and
                             // the road with the pair in the foreground down below.
      dim:   0,      // 0 = picture at full brightness
    },
  ],

  // Auto-advance to the next background every N seconds. 0 = manual only.
  backgroundRotateSeconds: 0,

  // Loop background videos silently (ignored for images).
  backgroundVideoLoop: true,

  // ── Vibe knobs ─────────────────────────────────────────────
  grain:      true,    // film grain over the picture
  scanlines:  false,   // CRT scanlines (darkens the image)
  flicker:    false,   // subtle CRT flicker (needs scanlines)

  birds:            true,   // flocks crossing the sky
  birdsEverySeconds: 15,    // one flight from each top corner per cycle

  // ── Ticker (top news-crawl). Edit freely, add as many as you like.
  ticker: [
    'দাদা, একটু চা হবে?',
    'BREAKING — পাড়ার মোড়ে তর্ক এখনও চলছে',
    'ভোট আসে, ভোট যায় · গান থেকে যায়',
    'সব দলের ইস্তেহারে এবার লুচি-আলুরদম',
    'মিছিলে আজ ৩ জন, মাইকে ৩০০ ওয়াট',
    'ভোটের আগে রাস্তা · ভোটের পরে গর্ত',
    'দেওয়াল লিখন শেষ · দেওয়ালের মালিক এখনও জানেন না',
    'দলবদলের মরসুম শুরু · ট্রান্সফার উইন্ডো খোলা',
    'কফি হাউসে বিপ্লব · বাড়ি ফেরা ১০টার মধ্যে',
    'পাড়ার মিটিং সন্ধে ৭টায় · অর্থাৎ ৯টায়',
    'প্রতিশ্রুতি ১০০টি · বাস্তবায়ন লোডিং…',
    'উন্নয়ন এসেছিল · রাস্তা খুঁজে পায়নি',
    'BREAKING — বন্‌ধ ডাকা হয়েছে · আড্ডা যথারীতি চলবে',
    'বাম-ডান-মধ্য · চা-টা কিন্তু এক দোকানেই',
    'ফ্লেক্স টাঙানো হয়ে গেছে · রাস্তা এখনও কাঁচা',
    'তর্ক চলছে · চলবে',
  ],

  // ── The playlist ───────────────────────────────────────────
  // YouTube video IDs, played in order and looped. Paste the bit after
  // `?v=` from a youtube.com or music.youtube.com link.
  // Titles come from YouTube itself — nothing to type here.
  playlist: [
    '02e9eWn41NI',   // Mach Chor · Sagar Ghosh
    '8HXska9SEnQ',   // File Chor · Sagar Ghosh
    '_0JXiSCpOSw',   // Parech Chakri Chor · ASHIS CBD Vlogs
    '7M5Vl7sWwFo',   // Pisi Palalo Bangladesh · Sagar Ghosh
    'H8R-fr_kC8g',   // Didi Ora Khub Mereche · Sagar Ghosh
    'D81-nSdrihY',   // Bengal Heist · Sagar Ghosh
    'AWdHKVgV_b8',   // Khela Hobe (Dj Remix) · Dj Amin Kolkata
    '9VuO0pUUZ40',   // Mamata Di Arek Bar (Dj Remix) · Dj Amin Kolkata
    'Am2XE3sOFok',   // TMC Anthem · Keshab Dey
    'yLv-dXasbvU',   // Je Lorche Sobar Daake
    'bPw9eQ0hUtU',   // Paltano Dorkar Chai BJP Sarkar
  ],

  // Shuffle the playlist on load?
  shuffle: false,

  // Where the YouTube player sits: 'center' | 'left' | 'right'.
  playerPosition: 'center',
};
