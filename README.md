# JNGLA — Into the Wild

JNGLA is an interactive web experience exploring Earth's rainforests through scroll-driven video scrubbing. 

The main goal of this project was solving a classic creative development headache: **making HTML5 video frame scrubbing feel like a smooth 60fps canvas animation** without browser stuttering, thread locking, or dropped frames during fast scrolling.

---
[Screen Recording 2026-09-03 20.42.webm](https://github.com/user-attachments/assets/15a193d9-0381-446a-a3cb-8022aca13fb5)


## 🎬 Live Preview & Aesthetics

Designed with an editorial brutalist layout, heavy typography (`Bebas Neue`, `Playfair Display`, `Inter`), high-contrast dark modes, and dynamic scroll HUD overlays.

+-----------------------------------------------------------------------+|  J N G L E                                                            ||  A L I V E .                                                          ||                                                                       ||  [ Scroll-driven 60fps video scrub engine running in background ]     ||                                                                       ||  01  Into the Canopy ----------------------------- [Progress Bar]     |+-----------------------------------------------------------------------+
---

## ⚡ How the Performance Fix Works

If you've ever hooked up GSAP ScrollTrigger directly to `video.currentTime`, you know browsers usually choke. Rapidly overriding `currentTime` forces the video decoder to cancel current frame decodes and queue new ones, causing severe UI jank.

JNGLA solves this with a **decoupled, non-blocking seek loop**:

1. **Decoder Lock Guard**: Before assigning a new target frame, the loop checks `!video.seeking`. If the decoder is busy processing a frame, we drop the frame-skip attempt and let the browser catch up smoothly.
2. **Smooth Lerp Scrubbing**: Scroll deltas update a lightweight numeric target rather than touching the DOM/video element directly.
3. **Hardware Acceleration Layering**: Videos sit in a GPU-promoted layer with `will-change: opacity, transform`.

```javascript
// Decoupled frame-scrubbing loop
function scrubLoop() {
  vids.forEach((vid, i) => {
    if (i === activeIdx && vid.duration) {
      const target = targetTimes[i];
      
      // Skip updates while the hardware decoder is seeking
      if (!vid.seeking && Math.abs(vid.currentTime - target) > 0.04) {
        vid.currentTime = target;
      }
    }
  });
  requestAnimationFrame(scrubLoop);
}
🛠️ Stack & LibrariesCategoryTechnology / LibraryCoreVanilla HTML5, CSS3, JavaScript (ES6+)Animation EngineGSAP 3.12.5Scroll TrackingScrollTrigger PluginFontsGoogle Fonts (Bebas Neue, Playfair Display, Inter)📁 Repository StructurePlaintext├── Assets/
│   ├── jungle1.mp4          # Chapter 01 footage
│   ├── Jungle2.mp4          # Chapter 02 footage
│   ├── jungle4.mp4          # Chapter 03 footage
│   ├── jungle5.mp4          # Chapter 04 footage
│   └── jungle6.mp4          # Chapter 05 footage
├── index.html               # Semantic markup & video stage layout
├── style.css                # Custom layout, responsive grids, variables
└── main.js                  # RAF scrub loop, custom cursor, GSAP timelines
🚀 Running LocallyNo npm installs or complex build pipelines required.Clone the repoBashgit clone [https://github.com/your-username/jngla.git](https://github.com/your-username/jngla.git)
cd jngla
Run a local server(Since modern browsers restrict local video playback policies over plain file protocols, run it through a local HTTP server)Bash# Using Node's serve
npx serve .

# Or using Python
python3 -m http.server 8000
Open in browserNavigate to http://localhost:3000 (or http://localhost:8000).📝 LicenseThis project is open-source under the MIT License. Feel free to fork it, use the video scrub engine in your own builds, or drop a star if you found the code helpful!
