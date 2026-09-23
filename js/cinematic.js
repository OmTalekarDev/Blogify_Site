
(() => {
  const start = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.gsap) return;

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    if (window.Lenis && !window.__blogifyLenis) {
      const lenis = new window.Lenis({
        duration: 1.15,
        smoothWheel: true,
        smoothTouch: false,
        wheelMultiplier: 0.9
      });
      window.__blogifyLenis = lenis;
      if (ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(1000, 16);
    }

    const progress = document.createElement("div");
    progress.className = "cinematic-progress";
    document.body.appendChild(progress);

    gsap.to(progress, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: ScrollTrigger ? { start: 0, end: "max", scrub: 0.15 } : undefined
    });

    const hero = document.querySelector(".hero");
    if (hero) {
      const copy = hero.querySelectorAll(".hero-copy > *");
      gsap.fromTo(copy,
        { y: 42, opacity: 0, filter: "blur(9px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.05, stagger: 0.11, ease: "power4.out" }
      );
      const art = hero.querySelector(".hero-art");
      if (art && ScrollTrigger) {
        gsap.to(art, {
          yPercent: -12,
          rotateX: 4,
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
        });
      }
      const card = hero.querySelector(".hero-card");
      if (card) {
        gsap.to(card, {
          y: -18,
          rotateZ: 1.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          duration: 3.8
        });
      }
    }

    const cards = gsap.utils.toArray(".blog-card");
    cards.forEach((card, i) => {
      if (!ScrollTrigger) return;
      gsap.fromTo(card,
        { y: 80, opacity: 0, rotateX: 8, scale: .94 },
        {
          y: 0, opacity: 1, rotateX: 0, scale: 1,
          duration: .9,
          delay: (i % 3) * .07,
          ease: "power4.out",
          scrollTrigger: { trigger: card, start: "top 88%", once: true }
        }
      );
    });

    gsap.utils.toArray(".category-grid a").forEach((item, i) => {
      if (!ScrollTrigger) return;
      gsap.fromTo(item,
        { x: i % 2 ? 40 : -40, opacity: 0 },
        { x: 0, opacity: 1, duration: .8, delay: (i % 3) * .06, ease: "power3.out",
          scrollTrigger: { trigger: item, start: "top 92%", once: true } }
      );
    });

    gsap.utils.toArray(".section-head, .newsletter, .dash-head, .profile-strip, .editor-head").forEach(el => {
      if (!ScrollTrigger) return;
      gsap.fromTo(el,
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: .9, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true } }
      );
    });

    document.querySelectorAll(".btn, .blog-card, .category-grid a").forEach(el => {
      el.addEventListener("mouseenter", () => gsap.to(el, { y: -5, scale: 1.025, duration: .25, overwrite: true, ease: "power2.out" }));
      el.addEventListener("mouseleave", () => gsap.to(el, { y: 0, scale: 1, duration: .35, overwrite: true, ease: "power3.out" }));
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
