(() => {
  "use strict";
  gsap.registerPlugin(ScrollTrigger);

  const CHAPTERS = [
    { trigger: "t1", vid: "v1", num: "01", title: "Into the Canopy" },
    { trigger: "t2", vid: "v2", num: "02", title: "Mist & Root" },
    { trigger: "t3", vid: "v3", num: "03", title: "Ancient Light" },
    { trigger: "t4", vid: "v4", num: "04", title: "Silence Below" },
    { trigger: "t5", vid: "v5", num: "05", title: "Wild Breath" },
  ];

  const vids = CHAPTERS.map(c => document.getElementById(c.vid));
  const triggers = CHAPTERS.map(c => document.getElementById(c.trigger));
  const chOverlay = document.getElementById("chapter-overlay");
  const chNum = document.getElementById("ch-num");
  const chTitle = document.getElementById("ch-title");
  const chFill = document.getElementById("ch-fill");
  const nav = document.getElementById("nav");

  let targetTimes = new Array(vids.length).fill(0);
  let activeIdx = 0;

  // 1. Smooth, non-blocking hardware-friendly scrubbing loop
  function scrubLoop() {
    vids.forEach((vid, i) => {
      if (i === activeIdx && vid.duration) {
        const target = targetTimes[i];
        // Only update frame if decoder is not currently seeking (prevents lag/stutter)
        if (!vid.seeking && Math.abs(vid.currentTime - target) > 0.04) {
          vid.currentTime = target;
        }
      }
    });
    requestAnimationFrame(scrubLoop);
  }

  // Pre-roll & pause videos for immediate seeking capability
  vids.forEach(v => {
    v.pause();
    v.currentTime = 0;
  });

  function switchVideo(newIdx) {
    if (newIdx === activeIdx) return;

    vids.forEach((v, idx) => {
      if (idx === newIdx) {
        v.classList.add("active");
      } else {
        v.classList.remove("active");
      }
    });

    activeIdx = newIdx;
    chNum.textContent = CHAPTERS[newIdx].num;
    chTitle.textContent = CHAPTERS[newIdx].title;
  }

  function setupScrollTriggers() {
    triggers.forEach((trigger, i) => {
      ScrollTrigger.create({
        trigger: trigger,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          if (vids[i].duration) {
            targetTimes[i] = self.progress * vids[i].duration;
          }
          if (i === activeIdx) {
            chFill.style.width = (self.progress * 100).toFixed(1) + "%";
          }
        },
        onEnter: () => {
          switchVideo(i);
          chOverlay.classList.add("show");
        },
        onEnterBack: () => {
          switchVideo(i);
          chOverlay.classList.add("show");
        },
        onLeaveBack: () => {
          if (i === 0) chOverlay.classList.remove("show");
        },
        onLeave: () => {
          if (i === vids.length - 1) chOverlay.classList.remove("show");
        }
      });
    });
  }

  // CURSOR
  const cursor = document.getElementById("cursor");
  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; });
  function moveCursor() {
    cx += (mx - cx) * 0.15;
    cy += (my - cy) * 0.15;
    cursor.style.left = cx + "px";
    cursor.style.top = cy + "px";
    requestAnimationFrame(moveCursor);
  }

  // LOADER & INITIALIZATION
  function runLoader() {
    const loaderEl = document.getElementById("loader");
    const loaderCount = document.getElementById("loader-count");
    let val = 0;

    const tick = setInterval(() => {
      val += Math.floor(Math.random() * 12) + 5;
      if (val >= 100) {
        val = 100;
        clearInterval(tick);
        gsap.to(loaderEl, {
          yPercent: -100,
          duration: 1,
          ease: "power4.inOut",
          onComplete: () => {
            loaderEl.style.display = "none";
            animateHero();
          }
        });
      }
      loaderCount.textContent = String(val).padStart(2, "0");
    }, 40);
  }

  function animateHero() {
    gsap.timeline({ defaults: { ease: "power4.out" } })
      .to(".nav-logo, .nav-index, .nav-loc", { opacity: 1, duration: 1, stagger: 0.1 })
      .to(".hl", { y: "0%", duration: 1.2, stagger: 0.12 }, "-=0.8")
      .to(".hero-bottom", { opacity: 1, duration: 1 }, "-=0.6")
      .to(".hero-vertical-text", { opacity: 0.6, duration: 1 }, "-=0.6");
  }

  function setupExtras() {
    ScrollTrigger.create({
      start: "top -60px",
      onEnter: () => nav.classList.add("scrolled"),
      onLeaveBack: () => nav.classList.remove("scrolled"),
    });

    document.querySelectorAll(".stat-num").forEach(el => {
      const target = parseFloat(el.dataset.target);
      const isFloat = String(target).includes(".");
      const obj = { val: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter() {
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: "power3.out",
            onUpdate() {
              el.textContent = isFloat ? obj.val.toFixed(1) : Math.floor(obj.val).toLocaleString();
            }
          });
        }
      });
    });

    gsap.to(".q-text", {
      scrollTrigger: { trigger: ".q-text", start: "top 80%" },
      opacity: 1, y: 0, duration: 1.2, ease: "power3.out"
    });
    gsap.to(".q-cite", {
      scrollTrigger: { trigger: ".q-cite", start: "top 85%" },
      opacity: 1, duration: 1, delay: 0.2, ease: "power2.out"
    });
  }

  // BOOT
  moveCursor();
  scrubLoop();
  setupScrollTriggers();
  setupExtras();
  runLoader();
})();