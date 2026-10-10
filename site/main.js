(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lenis = null;

  if (!window.gsap) {
    const intro = document.getElementById("intro");
    if (intro) intro.remove();
    document.body.classList.remove("is-intro");
    document.querySelectorAll(".hero-copy, .hero-media").forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    setupOrder();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const clockEl = document.getElementById("clock");
  const hudIndex = document.getElementById("hud-index");
  const hudName = document.getElementById("hud-name");
  const frames = [
    "../assets/images/scarlet_glaze.jpg",
    "../assets/images/dolci_flame.jpg",
    "../assets/images/shroom_melt.jpg",
    "../assets/images/the_stack.jpg",
  ];

  function lahoreTime() {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Karachi",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());
  }

  function tickClock() {
    if (clockEl) clockEl.textContent = lahoreTime();
  }

  tickClock();
  setInterval(tickClock, 1000);

  if (!reduced && window.Lenis) {
    lenis = new Lenis({
      duration: 1.2,
      easing: function (t) {
        return 1 - Math.pow(1 - t, 4);
      },
      smoothWheel: true,
      wheelMultiplier: 0.85,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  function scrollToHash(hash) {
    const target = document.querySelector(hash);
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: -8 });
    else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }

  document.querySelectorAll("a[href^='#']").forEach(function (link) {
    link.addEventListener("click", function (event) {
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      event.preventDefault();
      closeSheet();
      scrollToHash(hash);
    });
  });

  const sheet = document.getElementById("sheet");
  const menuBtn = document.querySelector(".menu-btn");

  function openSheet() {
    if (!sheet) return;
    sheet.hidden = false;
    menuBtn && menuBtn.setAttribute("aria-expanded", "true");
    gsap.fromTo(sheet, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(
      sheet.querySelectorAll("a"),
      { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: "power3.out" }
    );
  }

  function closeSheet() {
    if (!sheet || sheet.hidden) return;
    menuBtn && menuBtn.setAttribute("aria-expanded", "false");
    gsap.to(sheet, {
      opacity: 0,
      duration: 0.25,
      onComplete: function () {
        sheet.hidden = true;
        gsap.set(sheet, { opacity: 1 });
      },
    });
  }

  menuBtn && menuBtn.addEventListener("click", openSheet);
  const sheetClose = document.querySelector(".sheet-close");
  sheetClose && sheetClose.addEventListener("click", closeSheet);

  let loopsOn = false;

  function duplicateTrack(track) {
    const kids = Array.from(track.children);
    kids.forEach(function (node) {
      const clone = node.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("img").forEach(function (img) {
        img.alt = "";
      });
      track.appendChild(clone);
    });
  }

  function marqueeX(id, duration, reverse) {
    const track = document.getElementById(id);
    if (!track) return null;
    duplicateTrack(track);
    const from = reverse ? -50 : 0;
    const to = reverse ? 0 : -50;
    return gsap.fromTo(
      track,
      { xPercent: from },
      { xPercent: to, duration: duration, ease: "none", repeat: -1, force3D: true }
    );
  }

  function startLoops() {
    if (loopsOn) return;
    loopsOn = true;

    const mask = document.querySelector(".fill-mask");
    const fill = mask && mask.querySelector(".fill");
    if (mask && fill) {
      const wipe = { p: 0 };
      gsap.to(wipe, {
        p: 1,
        duration: 2.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        repeatDelay: 0.4,
        onUpdate: function () {
          const p = Math.max(wipe.p, 0.015);
          mask.style.transform = "scaleX(" + p + ")";
          fill.style.transform = "scaleX(" + 1 / p + ")";
        },
      });
    }

    gsap.to(".rule", {
      scaleX: 0.2,
      duration: 2.8,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      transformOrigin: "left center",
      force3D: true,
    });

    gsap.utils.toArray(".lane-rail i").forEach(function (head, index) {
      const rail = head.parentElement;
      gsap.fromTo(
        head,
        { x: 0 },
        {
          x: function () {
            return Math.max(0, rail.offsetWidth - head.offsetWidth);
          },
          duration: 3.2 + index * 0.9,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: index * 0.4,
          force3D: true,
        }
      );
    });

    gsap.to(".hero-media img", {
      scale: 1.06,
      duration: 14,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      force3D: true,
    });

    let nextFrame = 2;
    const shotA = document.querySelector(".shot-a");
    const shotB = document.querySelector(".shot-b");

    function crossfade() {
      gsap.to(shotA, {
        autoAlpha: 0,
        duration: 1.05,
        delay: 3.6,
        ease: "sine.inOut",
        onComplete: function () {
          shotA.src = shotB.src;
          gsap.set(shotA, { autoAlpha: 1 });
          const upcoming = frames[nextFrame];
          nextFrame = (nextFrame + 1) % frames.length;
          const preload = new Image();
          preload.onload = preload.onerror = function () {
            shotB.src = upcoming;
            crossfade();
          };
          preload.src = upcoming;
        },
      });
    }

    crossfade();

    marqueeX("hero-marquee", 28, false);
    marqueeX("sauce-marquee", 36, true);
    marqueeX("foot-marquee", 42, false);

    gsap.utils.toArray(".col").forEach(function (col) {
      const track = col.querySelector(".col-track");
      duplicateTrack(track);
      const speed = Number(col.dataset.speed) || 24;
      const down = col.dataset.dir === "down";
      const tween = gsap.fromTo(
        track,
        { yPercent: down ? -50 : 0 },
        {
          yPercent: down ? 0 : -50,
          duration: speed,
          ease: "none",
          repeat: -1,
          force3D: true,
        }
      );
      col.addEventListener("mouseenter", function () {
        gsap.to(tween, { timeScale: 0.2, duration: 0.4 });
      });
      col.addEventListener("mouseleave", function () {
        gsap.to(tween, { timeScale: 1, duration: 0.4 });
      });
    });

    gsap.to(".visit > img", {
      scale: 1.06,
      duration: 18,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      force3D: true,
    });
  }

  function bindScroll() {
    const chapters = [
      ["#top", "01", "Hero"],
      ["#parallel", "02", "Parallel"],
      ["#line", "03", "The line"],
      ["#board", "04", "Menu"],
      ["#visit", "05", "Visit"],
    ];

    chapters.forEach(function (chapter) {
      ScrollTrigger.create({
        trigger: chapter[0],
        start: "top center",
        end: "bottom center",
        onToggle: function (self) {
          if (!self.isActive || !hudIndex) return;
          hudIndex.textContent = chapter[1];
          hudName.textContent = chapter[2];
          document.querySelectorAll(".nav-links a").forEach(function (link) {
            link.classList.toggle("is-on", link.getAttribute("href") === chapter[0]);
          });
        },
      });
    });

    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: function (self) {
        gsap.set(".progress i", { scaleX: self.progress });
      },
    });

    gsap.utils.toArray(".reveal").forEach(function (el) {
      gsap.from(el, {
        y: 36,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 86%" },
      });
    });

    const mm = gsap.matchMedia();
    mm.add("(min-width: 981px)", function () {
      const track = document.querySelector(".reel-track");
      const tween = gsap.to(track, {
        x: function () {
          return -(track.scrollWidth - window.innerWidth);
        },
        ease: "none",
        scrollTrigger: {
          trigger: ".reel",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          end: function () {
            return "+=" + (track.scrollWidth - window.innerWidth);
          },
        },
      });

      gsap.utils.toArray(".plate-visual img").forEach(function (img) {
        gsap.fromTo(
          img,
          { scale: 1.16 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: img.closest(".plate"),
              containerAnimation: tween,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          }
        );
      });
    });

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const preview = document.querySelector(".preview");
    const previewImg = preview && preview.querySelector("img");
    if (fine && preview && previewImg) {
      document.querySelectorAll(".ticket[data-img]").forEach(function (ticket) {
        ticket.addEventListener("pointerenter", function (event) {
          previewImg.src = ticket.dataset.img;
          gsap.set(preview, { x: event.clientX + 22, y: event.clientY - 120 });
          gsap.to(preview, { opacity: 1, duration: 0.3, overwrite: "auto" });
        });
        ticket.addEventListener("pointermove", function (event) {
          gsap.to(preview, {
            x: event.clientX + 22,
            y: event.clientY - 140,
            duration: 0.45,
            ease: "power3.out",
            overwrite: "auto",
          });
        });
        ticket.addEventListener("pointerleave", function () {
          gsap.to(preview, { opacity: 0, duration: 0.2, overwrite: "auto" });
        });
      });
    }
  }

  let introDone = false;

  function finishIntro() {
    if (introDone) return;
    introDone = true;
    const intro = document.getElementById("intro");
    if (intro) intro.remove();
    document.body.classList.remove("is-intro");
    gsap.set(".hero-media, .word, .tag, .kicker, .lanes", { autoAlpha: 1, y: 0 });
    gsap.set(".rule", { scaleX: 1 });
    requestAnimationFrame(function () {
      if (!reduced) startLoops();
      if (lenis) lenis.start();
      ScrollTrigger.refresh();
    });
  }

  function boot() {
    bindScroll();

    if (reduced) {
      const intro = document.getElementById("intro");
      if (intro) intro.remove();
      gsap.set(".fill-mask, .word .fill, .rule", { scaleX: 1, clearProps: "transform" });
      gsap.set(".hero-media, .word, .tag, .kicker, .lanes", { autoAlpha: 1, y: 0 });
      finishIntro();
      return;
    }

    const counter = { n: 0 };
    const countEl = document.querySelector(".intro-count");
    let shown = -1;
    const master = gsap.timeline({ onComplete: finishIntro });

    master
      .fromTo(".intro-count", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 0)
      .to(
        counter,
        {
          n: 100,
          duration: 1.6,
          ease: "power2.inOut",
          onUpdate: function () {
            const next = Math.round(counter.n);
            if (next === shown) return;
            shown = next;
            countEl.textContent = String(next).padStart(3, "0");
          },
        },
        0
      )
      .fromTo(
        ".intro-word i",
        { y: 42, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.07, ease: "power4.out", immediateRender: true },
        0.15
      )
      .fromTo(
        ".intro-line",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.85, ease: "power3.inOut", immediateRender: false },
        0.55
      )
      .fromTo(
        ".intro-sub",
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, ease: "power3.out", immediateRender: true },
        0.72
      )
      .to(".intro", { autoAlpha: 0, duration: 0.65, ease: "power2.inOut" }, 2.7)
      .to(".word", { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, 3.15)
      .to(".rule", { scaleX: 1, duration: 0.7, ease: "power3.inOut" }, 3.45)
      .to(".tag", { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, 3.55)
      .to(".kicker, .lanes", { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, 3.2)
      .to(".hero-media", { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out" }, 3.15);

    document.querySelector(".skip").addEventListener("click", function () {
      if (introDone) return;
      master.kill();
      gsap.set(".hero-media, .word, .tag, .kicker, .lanes", { autoAlpha: 1, y: 0 });
      gsap.to(".intro", {
        autoAlpha: 0,
        duration: 0.55,
        ease: "power2.out",
        onComplete: finishIntro,
      });
    });
  }

  setupOrder();

  function setupOrder() {
    const bag = document.getElementById("bag");
    const linesEl = document.getElementById("bag-lines");
    const emptyEl = document.getElementById("bag-empty");
    const form = document.getElementById("bag-form");
    const totalEl = document.getElementById("bag-total");
    const errorEl = document.getElementById("bag-error");
    const countEl = document.getElementById("order-count");
    const addressField = document.getElementById("address-field");
    if (!bag || !linesEl || !form) return;

    const phone = "923255048602";
    let lines = [];
    let how = "Takeaway";

    try {
      const saved = JSON.parse(sessionStorage.getItem("burvado-order") || "[]");
      if (Array.isArray(saved)) lines = saved;
    } catch (err) {
      lines = [];
    }

    function save() {
      sessionStorage.setItem("burvado-order", JSON.stringify(lines));
    }

    function count() {
      return lines.reduce(function (sum, line) { return sum + line.qty; }, 0);
    }

    function total() {
      return lines.reduce(function (sum, line) { return sum + line.pkr * line.qty; }, 0);
    }

    function lock(on) {
      document.body.classList.toggle("bag-open", on);
      if (!lenis) return;
      if (on) lenis.stop();
      else if (reduced || introDone) lenis.start();
    }

    function openBag() {
      bag.hidden = false;
      lock(true);
      const close = bag.querySelector(".bag-close");
      if (close) close.focus();
    }

    function closeBag() {
      bag.hidden = true;
      lock(false);
    }

    function render() {
      const n = count();
      if (countEl) {
        countEl.hidden = n === 0;
        countEl.textContent = String(n);
      }
      linesEl.innerHTML = "";
      lines.forEach(function (line, index) {
        const li = document.createElement("li");
        li.innerHTML =
          "<div><strong></strong><em></em></div>" +
          "<div class=\"qty\"><button type=\"button\" data-dec>-</button><span></span><button type=\"button\" data-inc>+</button></div>" +
          "<span class=\"line-total\"></span>";
        li.querySelector("strong").textContent = line.name;
        li.querySelector("em").textContent = line.cut + " · " + line.pkr + " RS";
        li.querySelector(".qty span").textContent = String(line.qty);
        li.querySelector(".line-total").textContent = (line.pkr * line.qty) + " RS";
        li.querySelector("[data-dec]").addEventListener("click", function () {
          if (line.qty <= 1) lines.splice(index, 1);
          else line.qty -= 1;
          save();
          render();
        });
        li.querySelector("[data-inc]").addEventListener("click", function () {
          line.qty += 1;
          save();
          render();
        });
        linesEl.appendChild(li);
      });
      emptyEl.hidden = lines.length > 0;
      form.hidden = lines.length === 0;
      totalEl.textContent = total() + " RS";
    }

    document.querySelectorAll(".add").forEach(function (button) {
      button.addEventListener("click", function () {
        const item = {
          id: button.dataset.id,
          name: button.dataset.name,
          cut: button.dataset.cut,
          pkr: Number(button.dataset.pkr),
          qty: 1,
        };
        const existing = lines.find(function (line) {
          return line.id === item.id && line.cut === item.cut;
        });
        if (existing) existing.qty += 1;
        else lines.push(item);
        save();
        render();
        openBag();
      });
    });

    function showError(message) {
      errorEl.hidden = !message;
      errorEl.textContent = message || "";
    }

    bag.querySelectorAll(".how-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        how = button.dataset.how;
        bag.querySelectorAll(".how-btn").forEach(function (el) {
          el.classList.toggle("is-on", el === button);
        });
        const delivery = how === "Delivery";
        addressField.hidden = !delivery;
        addressField.querySelector("input").required = delivery;
        showError("");
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const address = String(data.get("address") || "").trim();
      const note = String(data.get("note") || "").trim();
      if (!name) {
        showError("Add a name for the order.");
        return;
      }
      if (how === "Delivery" && !address) {
        showError("Add a delivery address.");
        return;
      }
      if (!lines.length) {
        showError("Add something from the board.");
        return;
      }
      const message = [
        "BURVADO ORDER",
        "Name: " + name,
        "How: " + how,
        how === "Delivery" ? "Address: " + address : "Pickup: Park View City, Lahore",
        note ? "Notes: " + note : "",
        "",
      ].concat(lines.map(function (line) {
        return line.qty + " x " + line.name + " (" + line.cut + ") — " + (line.pkr * line.qty) + " RS";
      }), ["", "Total: " + total() + " RS"]).filter(Boolean).join("\n");
      showError("");
      window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(message), "_blank", "noopener");
    });

    document.getElementById("open-order").addEventListener("click", function () {
      if (!lines.length) {
        scrollToHash("#board");
        return;
      }
      openBag();
    });
    document.querySelector(".sheet-order").addEventListener("click", function () {
      const sheet = document.getElementById("sheet");
      const menuBtn = document.querySelector(".menu-btn");
      if (sheet && !sheet.hidden && window.gsap) closeSheet();
      else if (sheet) {
        sheet.hidden = true;
        if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
      }
      if (!lines.length) {
        scrollToHash("#board");
        return;
      }
      openBag();
    });
    bag.querySelector(".bag-close").addEventListener("click", closeBag);
    bag.addEventListener("click", function (event) {
      if (event.target === bag) closeBag();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !bag.hidden) closeBag();
    });

    render();
  }

  const waitFonts = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([
    waitFonts,
    new Promise(function (resolve) {
      setTimeout(resolve, 1400);
    }),
    ]).then(boot);

  window.addEventListener("load", function () {
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
})();
