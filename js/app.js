const API_BASE = window.location.protocol === "file:" ? "http://localhost:5000/api" : "/api";

document.addEventListener("DOMContentLoaded", () => {
  const toast = (message) => {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  };

  const getToken = () => localStorage.getItem("blogifyToken");

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("blogifyUser") || "null");
    } catch {
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("blogifyToken");
    localStorage.removeItem("blogifyUser");
    location.href = "login.html";
  };

  async function api(path, options = {}) {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = "Bearer " + token;

    const response = await fetch(API_BASE + path, { ...options, headers });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || "Something went wrong.");
      error.status = response.status;
      throw error;
    }

    return data;
  }

  const requireLogin = () => {
    if (!getToken()) {
      toast("Please login first.");
      setTimeout(() => location.href = "login.html", 700);
      return false;
    }
    return true;
  };

  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[ch]));

  const formatDate = (value) =>
    new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    });

  // Responsive navigation
  document.querySelectorAll(".menu-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const nav = btn.nextElementSibling;
      const open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "×" : "☰";
    });
  });

  // Logout
  document.querySelectorAll('a[href="login.html"]').forEach(link => {
    if (link.textContent.trim().toLowerCase().includes("log out")) {
      link.addEventListener("click", e => {
        e.preventDefault();
        logout();
      });
    }
  });
  document.querySelectorAll("[data-logout]").forEach(button => {
    button.addEventListener("click", e => {
      e.preventDefault();
      logout();
    });
  });


  // Module 5: protect private pages and verify the JWT with the backend.
  if (document.body.dataset.private === "true") {
    if (!getToken()) {
      toast("Please login to access this page.");
      setTimeout(() => location.href = "login.html", 500);
      return;
    }

    api("/auth/me")
      .then(data => {
        localStorage.setItem("blogifyUser", JSON.stringify(data.user));
        document.querySelectorAll("[data-user-name]").forEach(el => {
          el.textContent = data.user.name;
        });
        document.querySelectorAll("[data-user-email]").forEach(el => {
          el.textContent = data.user.email;
        });
        document.getElementById("dashboard-profile-initials")?.replaceChildren(
          document.createTextNode(
            data.user.name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase()
          )
        );
      })
      .catch(error => {
        if (error.status === 401 || error.status === 404) {
          toast("Your session has expired. Please login again.");
          setTimeout(logout, 700);
        }
      });
  }

  // Password visibility
  document.querySelectorAll(".password-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      input.type = input.type === "password" ? "text" : "password";
      btn.textContent = input.type === "password" ? "Show" : "Hide";
    });
  });

  // Newsletter
  const newsletter = document.getElementById("newsletter-form");
  newsletter?.addEventListener("submit", e => {
    e.preventDefault();
    const input = newsletter.querySelector("input");
    if (!input.checkValidity()) return input.reportValidity();
    input.value = "";
    toast("You're subscribed. Welcome to Blogify!");
  });

  // Login
  const login = document.getElementById("login-form");
  login?.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("login-email");
    const password = document.getElementById("login-password");

    if (!email.validity.valid || password.value.length < 8) {
      if (!email.validity.valid) email.closest("label").querySelector(".field-error").textContent = "Enter a valid email address.";
      if (password.value.length < 8) password.closest("label").querySelector(".field-error").textContent = "Password must be at least 8 characters.";
      return;
    }

    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.value.trim(), password: password.value })
      });
      localStorage.setItem("blogifyToken", data.token);
      localStorage.setItem("blogifyUser", JSON.stringify(data.user));
      toast("Login successful. Opening dashboard…");
      setTimeout(() => location.href = "dashboard.html", 700);
    } catch (error) {
      toast(error.message);
    }
  });

  document.getElementById("forgot-password")?.addEventListener("click", e => {
    e.preventDefault();
    toast("Password reset is not implemented in this internship module.");
  });

  // Registration
  const regPassword = document.getElementById("reg-password");
  regPassword?.addEventListener("input", () => {
    const value = regPassword.value;
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    const bar = document.getElementById("strength-bar");
    const strengthText = document.getElementById("strength-text");
    bar.style.width = (score * 25) + "%";
    strengthText.textContent =
      score <= 1 ? "Weak — add length, numbers and symbols." :
      score === 2 ? "Fair — add another character type." :
      score === 3 ? "Good password." : "Strong password.";
  });

  const register = document.getElementById("register-form");
  register?.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("reg-name");
    const email = document.getElementById("reg-email");
    const password = document.getElementById("reg-password");
    const confirm = document.getElementById("reg-confirm");
    const terms = document.getElementById("terms");

    if (!name.value.trim() || !email.validity.valid || password.value.length < 8 ||
        confirm.value !== password.value || !terms.checked) {
      toast("Please fix the highlighted fields.");
      if (!name.value.trim()) name.closest("label").querySelector(".field-error").textContent = "Enter your name.";
      if (!email.validity.valid) email.closest("label").querySelector(".field-error").textContent = "Enter a valid email.";
      if (password.value.length < 8) password.closest("label").querySelector(".field-error").textContent = "Minimum 8 characters.";
      if (confirm.value !== password.value) confirm.closest("label").querySelector(".field-error").textContent = "Passwords do not match.";
      return;
    }

    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.value.trim(),
          email: email.value.trim(),
          password: password.value
        })
      });
      toast("Account created. Redirecting to login…");
      setTimeout(() => location.href = "login.html", 800);
    } catch (error) {
      toast(error.message);
    }
  });


  // Module 5: user profile
  const profileCard = document.getElementById("profile-card");
  if (profileCard) {
    api("/auth/me")
      .then(data => {
        const user = data.user;
        document.getElementById("profile-name").textContent = user.name;
        document.getElementById("profile-email").textContent = user.email;
        document.getElementById("profile-email-detail").textContent = user.email;
        document.getElementById("profile-joined").textContent = formatDate(user.createdAt);
        document.getElementById("profile-initials").textContent = user.name
          .split(" ")
          .map(part => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        localStorage.setItem("blogifyUser", JSON.stringify(user));
      })
      .catch(error => {
        if (error.status === 401 || error.status === 404) logout();
        else toast(error.message);
      });
  }

  // Create / Edit Blog
  const blogForm = document.getElementById("blog-form");
  const content = document.getElementById("blog-content");
  const count = document.getElementById("word-count");
  const editId = new URLSearchParams(location.search).get("edit");
  const isEditMode = Boolean(blogForm && editId);

  const updateCount = () => {
    const words = content?.value.trim() ? content.value.trim().split(/\s+/).length : 0;
    if (count) count.textContent = words + (words === 1 ? " word" : " words");
  };

  content?.addEventListener("input", updateCount);
  updateCount();

  const collectBlog = (status) => ({
    title: document.getElementById("blog-title").value.trim(),
    description: document.getElementById("blog-description").value.trim(),
    content: content.value.trim(),
    category: document.getElementById("blog-category").value,
    image: document.getElementById("blog-image").value.trim(),
    tags: document.getElementById("blog-tags").value.split(",").map(x => x.trim()).filter(Boolean),
    status
  });

  const validateBlog = () => {
    let valid = true;
    ["blog-title", "blog-description", "blog-content"].forEach(id => {
      const input = document.getElementById(id);
      const error = input.closest("label").querySelector(".field-error");
      if (!input.value.trim()) {
        error.textContent = "This field is required.";
        input.style.borderColor = "#d64545";
        valid = false;
      } else {
        error.textContent = "";
        input.style.borderColor = "";
      }
    });
    return valid;
  };

  const populateEditor = async () => {
    if (!isEditMode || !requireLogin()) return;

    try {
      const data = await api("/blogs/my");
      const blog = (data.blogs || []).find(item => item.id === editId);
      if (!blog) {
        toast("Blog not found or you don't own it.");
        setTimeout(() => location.href = "dashboard.html", 800);
        return;
      }

      document.title = "Edit Story — Blogify";
      document.querySelector(".editor-head .eyebrow").textContent = "Edit story";
      document.querySelector(".editor-head h1").textContent = "Refine your idea.";
      document.querySelector(".editor-head p").textContent = "Update your story and save the changes to MongoDB.";
      document.querySelector(".editor-head .text-link").textContent = "← Back to dashboard";
      document.querySelector(".editor-main button")?.remove();

      document.getElementById("blog-title").value = blog.title || "";
      document.getElementById("blog-description").value = blog.description || "";
      document.getElementById("blog-content").value = blog.content || "";
      document.getElementById("blog-category").value = blog.category || "Technology";
      document.getElementById("blog-image").value = blog.image || "";
      document.getElementById("blog-tags").value = (blog.tags || []).join(", ");
      updateCount();

      const publishButton = blogForm.querySelector('button[type="submit"]');
      publishButton.textContent = blog.status === "draft" ? "Update draft →" : "Update story →";
      document.getElementById("save-draft").textContent = blog.status === "draft" ? "Keep as draft" : "Save as draft";
    } catch (error) {
      toast(error.message);
    }
  };

  if (isEditMode) populateEditor();

  document.getElementById("save-draft")?.addEventListener("click", async () => {
    if (!requireLogin() || !validateBlog()) return;

    try {
      const payload = collectBlog("draft");
      if (isEditMode) {
        await api("/blogs/" + encodeURIComponent(editId), { method: "PUT", body: JSON.stringify(payload) });
        toast("Draft updated.");
      } else {
        await api("/blogs", { method: "POST", body: JSON.stringify(payload) });
        toast("Draft saved to the backend.");
      }
      setTimeout(() => location.href = "dashboard.html", 700);
    } catch (error) {
      toast(error.status === 401 ? "Session expired. Please login again." : error.message);
    }
  });

  blogForm?.addEventListener("submit", async e => {
    e.preventDefault();
    if (!requireLogin() || !validateBlog()) return;

    try {
      const payload = collectBlog("published");
      if (isEditMode) {
        await api("/blogs/" + encodeURIComponent(editId), { method: "PUT", body: JSON.stringify(payload) });
        toast("Story updated successfully!");
      } else {
        await api("/blogs", { method: "POST", body: JSON.stringify(payload) });
        toast("Story published successfully!");
      }
      setTimeout(() => location.href = "dashboard.html", 800);
    } catch (error) {
      toast(error.status === 401 ? "Session expired. Please login again." : error.message);
    }
  });

  // Dashboard CRUD management + local search/filter
  const table = document.getElementById("story-table");
  if (table) {
    if (!requireLogin()) return;

    let allBlogs = [];
    let activeFilter = "all";

    const searchInput = document.getElementById("story-search");

    const renderDashboard = (blogs = allBlogs) => {
      const query = (searchInput?.value || "").trim().toLowerCase();
      const visible = blogs.filter(blog => {
        const matchesFilter = activeFilter === "all" || blog.status === activeFilter;
        const haystack = [blog.title, blog.description, blog.category, ...(blog.tags || [])].join(" ").toLowerCase();
        return matchesFilter && (!query || haystack.includes(query));
      });

      const published = allBlogs.filter(blog => blog.status === "published");
      const drafts = allBlogs.filter(blog => blog.status === "draft");
      document.getElementById("published-count").textContent = published.length;
      document.getElementById("draft-count").textContent = drafts.length;
      document.getElementById("view-count").textContent =
        allBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0).toLocaleString();

      table.innerHTML = "";
      if (!visible.length) {
        table.innerHTML = '<tr><td colspan="5" class="empty-row">No stories match your current filter.</td></tr>';
        return;
      }

      visible.forEach(blog => {
        const row = document.createElement("tr");
        row.dataset.status = blog.status;
        row.dataset.id = blog.id;
        row.innerHTML =
          '<td><strong>' + escapeHtml(blog.title) + '</strong><small>' + escapeHtml(blog.category) + '</small></td>' +
          '<td><span class="status ' + blog.status + '">' + (blog.status === "published" ? "Published" : "Draft") + '</span></td>' +
          '<td>' + formatDate(blog.updatedAt) + '</td>' +
          '<td>' + (blog.views || 0) + '</td>' +
          '<td class="story-actions">' +
            (blog.status === "published"
              ? '<a class="icon-btn" title="View story" href="blog.html?id=' + encodeURIComponent(blog.id) + '">View</a>'
              : '') +
            '<a class="icon-btn" title="Edit story" href="create-blog.html?edit=' + encodeURIComponent(blog.id) + '">Edit</a>' +
            '<button class="icon-btn delete-story" title="Delete story">Delete</button>' +
          '</td>';

        row.querySelector(".delete-story").addEventListener("click", async () => {
          if (!confirm("Delete this story permanently?")) return;
          try {
            await api("/blogs/" + encodeURIComponent(blog.id), { method: "DELETE" });
            allBlogs = allBlogs.filter(item => item.id !== blog.id);
            renderDashboard();
            toast("Story deleted.");
          } catch (error) {
            toast(error.message);
          }
        });

        table.appendChild(row);
      });
    };

    const loadDashboard = async () => {
      try {
        const data = await api("/blogs/my");
        allBlogs = data.blogs || [];
        renderDashboard();
      } catch (error) {
        toast(error.status === 401 ? "Session expired. Please login again." : error.message);
      }
    };

    document.querySelectorAll(".tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        activeFilter = tab.dataset.filter;
        renderDashboard();
      });
    });

    searchInput?.addEventListener("input", () => renderDashboard());
    loadDashboard();
  }

  // Home: load published blogs from the API.
  const homeGrid = document.querySelector(".blog-grid");
  if (homeGrid) {
    api("/blogs")
      .then(data => {
        const blogs = data.blogs || [];
        blogs.forEach(blog => {
          const card = document.createElement("article");
          card.className = "blog-card";
          const initials = (blog.authorName || "BU")
            .split(" ")
            .map(x => x[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          card.innerHTML =
            '<div class="post-image image-tech"><span>' + escapeHtml(blog.category).toUpperCase() + '</span><b>NEW</b></div>' +
            '<div class="post-body"><div class="meta">' + formatDate(blog.createdAt) + '</div>' +
            '<h3>' + escapeHtml(blog.title) + '</h3><p>' + escapeHtml(blog.description) + '</p>' +
            '<a class="text-link" href="blog.html?id=' + encodeURIComponent(blog.id) + '">Read article →</a>' +
            '<div class="author-row"><span class="author-avatar">' + escapeHtml(initials) + '</span>' +
            '<span><strong>' + escapeHtml(blog.authorName) + '</strong><small>' + escapeHtml(blog.category) + '</small></span></div></div>';

          homeGrid.prepend(card);
        });
      })
      .catch(() => {
        // Static sample stories remain visible when the API isn't running.
      });
  }

  // Motion system: scroll reveal, magnetic buttons, tilt, pointer spotlight, page transitions.
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reducedMotion) {
    const transition = document.createElement("div");
    transition.className = "page-transition";
    document.body.appendChild(transition);
    requestAnimationFrame(() => transition.classList.add("out"));

    document.querySelectorAll("a[href]").forEach(link => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || link.target === "_blank") return;
      if (href.startsWith("http") && !href.startsWith(location.origin)) return;
      link.addEventListener("click", event => {
        const target = link.href;
        if (!target || target === location.href) return;
        event.preventDefault();
        transition.classList.remove("out");
        transition.classList.add("in");
        setTimeout(() => { location.href = target; }, 420);
      });
    });

    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);
    document.addEventListener("mousemove", event => {
      const x = event.clientX;
      const y = event.clientY;
      document.documentElement.style.setProperty("--mx", x + "px");
      document.documentElement.style.setProperty("--my", y + "px");
      glow.style.left = x + "px";
      glow.style.top = y + "px";

      const card = event.target.closest?.(".blog-card,.category-grid a,.stat-card,.side-card,.auth-card,.profile-card");
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--card-x", ((x - rect.left) / rect.width * 100) + "%");
        card.style.setProperty("--card-y", ((y - rect.top) / rect.height * 100) + "%");
      }
    }, { passive: true });

    document.querySelectorAll("a.btn, button.btn, .theme-toggle").forEach(el => {
      el.addEventListener("mouseenter", () => glow.classList.add("hover"));
      el.addEventListener("mouseleave", () => {
        glow.classList.remove("hover");
        el.style.transform = "";
      });
      el.addEventListener("mousemove", event => {
        const rect = el.getBoundingClientRect();
        const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
        const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
        el.style.transform = "translate(" + (dx * 8) + "px," + (dy * 8) + "px)";
      });
    });

    document.querySelectorAll(".hero-card").forEach(card => {
      card.addEventListener("mousemove", event => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - .5;
        const py = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = "perspective(900px) rotateX(" + (-py * 5) + "deg) rotateY(" + (px * 7) + "deg) translateY(-2px) rotateZ(-1deg)";
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });

    document.querySelectorAll(".hero-art").forEach(art => {
      art.addEventListener("mousemove", event => {
        const rect = art.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - .5;
        const py = (event.clientY - rect.top) / rect.height - .5;
        art.querySelectorAll(".orb").forEach((orb, index) => {
          const depth = index === 0 ? 10 : -7;
          orb.style.transform = "translate(" + (px * depth) + "px," + (py * depth) + "px)";
        });
      });
    });

    const reveals = document.querySelectorAll(".section, .categories, .newsletter, .dash-panel, .stat-grid, .editor-layout, .profile-strip");
    reveals.forEach(el => el.classList.add("reveal"));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: "0px 0px -50px" });
    reveals.forEach(el => observer.observe(el));

    const header = document.querySelector(".site-header");
    const onScroll = () => header?.classList.toggle("scrolled", window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (!reducedMotion) {
    // Global scroll progress + cinematic scroll state.
    const updateScrollState = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / max));
      doc.style.setProperty("--scroll-progress", progress);
      doc.style.setProperty("--scroll-y", window.scrollY + "px");
    };
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    // Lightweight cursor trail on desktop.
    if (window.innerWidth > 850) {
      const trail = Array.from({ length: 7 }, (_, i) => {
        const node = document.createElement("span");
        node.className = "cursor-trail" + (i > 3 ? " small" : "");
        node.style.opacity = String(Math.max(.08, .55 - i * .065));
        document.body.appendChild(node);
        return { node, x: innerWidth / 2, y: innerHeight / 2, delay: i + 1 };
      });
      let mouseX = innerWidth / 2;
      let mouseY = innerHeight / 2;
      document.addEventListener("mousemove", e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      }, { passive: true });

      const animateTrail = () => {
        let leadX = mouseX;
        let leadY = mouseY;
        trail.forEach(item => {
          item.x += (leadX - item.x) * (.18 - Math.min(.07, item.delay * .007));
          item.y += (leadY - item.y) * (.18 - Math.min(.07, item.delay * .007));
          item.node.style.left = item.x + "px";
          item.node.style.top = item.y + "px";
          leadX = item.x;
          leadY = item.y;
        });
        requestAnimationFrame(animateTrail);
      };
      requestAnimationFrame(animateTrail);
    }

    // Add a slight depth response to cards while scrolling.
    const depthCards = document.querySelectorAll(".blog-card, .category-grid a, .stat-card");
    const updateDepth = () => {
      const vh = window.innerHeight;
      depthCards.forEach(card => {
        const r = card.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) return;
        const center = (r.top + r.height / 2) / vh;
        const shift = (center - .5) * -5;
        card.style.setProperty("--depth-shift", shift.toFixed(2) + "deg");
      });
    };
    updateDepth();
    window.addEventListener("scroll", updateDepth, { passive: true });

    // Add a soft spotlight to the entire page and keep it responsive to movement.
    const spotlight = document.querySelector(".cursor-glow");
    if (spotlight) {
      spotlight.style.mixBlendMode = "screen";
    }
  }

  // Cinematic scroll layer: independent of GSAP/Three.js and always visible.
  if (!reducedMotion) {
    document.body.classList.add("cinematic-scroll");

    const hero = document.querySelector(".hero");
    const heroArt = document.querySelector(".cinematic-hero");

    if (hero && heroArt) {
      const hint = document.createElement("div");
      hint.className = "hero-scroll-hint";
      hint.innerHTML = "<span>Scroll to explore</span><i></i>";
      heroArt.appendChild(hint);
    }

    // Give each major content block its own ambient light source.
    document.querySelectorAll(".section, .categories, .newsletter").forEach(section => {
      if (!section.querySelector(":scope > .cinematic-section-glow")) {
        const glow = document.createElement("div");
        glow.className = "cinematic-section-glow";
        glow.setAttribute("aria-hidden", "true");
        section.appendChild(glow);
      }
    });

    // Animated divider under section headings.
    document.querySelectorAll(".section-head h2").forEach(h2 => {
      const line = document.createElement("div");
      line.className = "cinematic-divider";
      line.setAttribute("aria-hidden", "true");
      h2.insertAdjacentElement("afterend", line);
    });

    const scrollElements = () => {
      const y = window.scrollY || 0;
      const vh = window.innerHeight || 1;
      const heroH = hero ? hero.offsetHeight : 650;

      // Hero layers move at deliberately different speeds.
      document.documentElement.style.setProperty("--scroll-y-px", y + "px");
      document.documentElement.style.setProperty(
        "--hero-copy-shift",
        Math.max(-72, -y * 0.14) + "px"
      );
      document.documentElement.style.setProperty(
        "--hero-art-shift",
        Math.min(52, y * 0.065) + "px"
      );

      if (heroArt) {
        const heroRect = heroArt.getBoundingClientRect();
        const center = heroRect.top + heroRect.height / 2;
        const delta = center - vh / 2;
        heroArt.style.setProperty("--scene-card-y", (-delta * 0.065).toFixed(1) + "px");
        heroArt.style.setProperty("--scene-card-r", (delta / vh * 2.2).toFixed(2) + "deg");
        heroArt.style.setProperty("--scene-card-s", Math.max(.96, 1 - Math.abs(delta / vh) * .025).toFixed(3));
        heroArt.style.setProperty("--scene-core-y", (-delta * 0.035).toFixed(1) + "px");

        heroArt.querySelectorAll(".hero-chip").forEach((chip, index) => {
          const dir = index % 2 === 0 ? 1 : -1;
          chip.style.setProperty("--chip-x", (delta / vh * 16 * dir).toFixed(1) + "px");
          chip.style.setProperty("--chip-y", (-delta / vh * 10).toFixed(1) + "px");
        });
      }

      // Cards form a small "wave" while entering the viewport.
      document.querySelectorAll(".blog-card").forEach((card, index) => {
        const r = card.getBoundingClientRect();
        if (r.bottom < -120 || r.top > vh + 120) return;
        const progress = (r.top + r.height / 2 - vh * .5) / vh;
        const clamped = Math.max(-1, Math.min(1, progress));
        const direction = index % 2 === 0 ? 1 : -1;
        card.style.setProperty("--card-scroll-x", (clamped * 10 * direction).toFixed(1) + "px");
        card.style.setProperty("--card-scroll-y", (-clamped * 22).toFixed(1) + "px");
        card.style.setProperty("--card-scroll-r", (clamped * 1.4 * direction).toFixed(2) + "deg");
        card.style.setProperty("--card-scroll-s", Math.min(1.018, 1.008 - Math.abs(clamped) * .009).toFixed(3));
      });

      // Topic tiles sweep in from alternating sides.
      document.querySelectorAll(".category-grid a").forEach((item, index) => {
        const r = item.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const p = Math.max(-1, Math.min(1, (r.top - vh * .72) / (vh * .72)));
        const side = index % 2 === 0 ? -1 : 1;
        item.style.setProperty("--topic-x", (p * 24 * side).toFixed(1) + "px");
        item.style.setProperty("--topic-y", (-Math.abs(p) * 6).toFixed(1) + "px");
        item.style.setProperty("--topic-r", (p * 1.8 * side).toFixed(2) + "deg");
      });

      document.querySelectorAll(".section-head, .categories .section-head").forEach(head => {
        const r = head.getBoundingClientRect();
        const p = Math.max(-1, Math.min(1, (r.top - vh * .75) / (vh * .75)));
        head.style.setProperty("--heading-y", (p * 24).toFixed(1) + "px");
        head.style.setProperty("--heading-o", Math.max(.45, 1 - Math.abs(p) * .55).toFixed(2));
        head.style.setProperty("--heading-s", Math.min(1.035, 1.015 - Math.abs(p) * .02).toFixed(3));
      });

      const newsletter = document.querySelector(".newsletter");
      if (newsletter) {
        const r = newsletter.getBoundingClientRect();
        const p = Math.max(-1, Math.min(1, (r.top - vh * .75) / vh));
        newsletter.style.setProperty("--newsletter-y", (-p * 20).toFixed(1) + "px");
        newsletter.style.setProperty("--newsletter-s", Math.min(1.012, 1 + (1 - Math.abs(p)) * .012).toFixed(3));
      }

      document.querySelectorAll(".section, .categories, .newsletter").forEach(section => {
        const r = section.getBoundingClientRect();
        const active = r.top < vh * .75 && r.bottom > vh * .2;
        const glow = section.querySelector(":scope > .cinematic-section-glow");
        if (glow) glow.classList.toggle("is-live", active);
        const divider = section.querySelector(".cinematic-divider");
        if (divider) divider.classList.toggle("is-live", active);
      });
    };

    let ticking = false;
    const requestScrollFrame = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        scrollElements();
        ticking = false;
      });
    };
    scrollElements();
    window.addEventListener("scroll", requestScrollFrame, { passive: true });
    window.addEventListener("resize", requestScrollFrame, { passive: true });
  }

});
