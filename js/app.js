const API_BASE = "http://localhost:5000/api";

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
        localStorage.removeItem("blogifyToken");
        localStorage.removeItem("blogifyUser");
        location.href = "login.html";
      });
    }
  });

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

  // Login -> real backend API
  const login = document.getElementById("login-form");
  login?.addEventListener("submit", async e => {
    e.preventDefault();

    const email = document.getElementById("login-email");
    const password = document.getElementById("login-password");

    if (!email.validity.valid || password.value.length < 6) {
      if (!email.validity.valid) email.closest("label").querySelector(".field-error").textContent = "Enter a valid email address.";
      if (password.value.length < 6) password.closest("label").querySelector(".field-error").textContent = "Password must be at least 6 characters.";
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

  // Registration -> real backend API
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
      if (!terms.checked) toast("Please accept the terms.");
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

  // Create Blog -> real backend API
  const blogForm = document.getElementById("blog-form");
  const content = document.getElementById("blog-content");
  const count = document.getElementById("word-count");

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

  document.getElementById("save-draft")?.addEventListener("click", async () => {
    if (!requireLogin() || !validateBlog()) return;

    try {
      await api("/blogs", { method: "POST", body: JSON.stringify(collectBlog("draft")) });
      toast("Draft saved to the backend.");
    } catch (error) {
      toast(error.status === 401 ? "Session expired. Please login again." : error.message);
    }
  });

  blogForm?.addEventListener("submit", async e => {
    e.preventDefault();
    if (!requireLogin() || !validateBlog()) return;

    try {
      await api("/blogs", { method: "POST", body: JSON.stringify(collectBlog("published")) });
      toast("Story published successfully!");
      setTimeout(() => location.href = "dashboard.html", 800);
    } catch (error) {
      toast(error.status === 401 ? "Session expired. Please login again." : error.message);
    }
  });

  // Dashboard: load current user's real backend data
  const table = document.getElementById("story-table");
  if (table) {
    if (!requireLogin()) return;

    const renderDashboard = async () => {
      try {
        const data = await api("/blogs/my");
        const blogs = data.blogs || [];
        const published = blogs.filter(blog => blog.status === "published");
        const drafts = blogs.filter(blog => blog.status === "draft");

        document.getElementById("published-count").textContent = published.length;
        document.getElementById("draft-count").textContent = drafts.length;
        document.getElementById("view-count").textContent = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0).toLocaleString();

        table.innerHTML = "";
        if (!blogs.length) {
          table.innerHTML = '<tr><td colspan="5" class="empty-row">No stories yet. Create your first blog.</td></tr>';
          return;
        }

        blogs.forEach(blog => {
          const row = document.createElement("tr");
          row.dataset.status = blog.status;
          row.dataset.id = blog.id;
          row.innerHTML =
            '<td><strong>' + escapeHtml(blog.title) + '</strong><small>' + escapeHtml(blog.category) + '</small></td>' +
            '<td><span class="status ' + blog.status + '">' + (blog.status === "published" ? "Published" : "Draft") + '</span></td>' +
            '<td>' + new Date(blog.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + '</td>' +
            '<td>' + (blog.views || 0) + '</td>' +
            '<td><button class="icon-btn delete-story" title="Delete">⌫</button></td>';

          row.querySelector(".delete-story").addEventListener("click", async () => {
            if (!confirm("Delete this story?")) return;
            try {
              await api("/blogs/" + encodeURIComponent(blog.id), { method: "DELETE" });
              row.remove();
              toast("Story deleted.");
              renderDashboard();
            } catch (error) {
              toast(error.message);
            }
          });

          table.appendChild(row);
        });
      } catch (error) {
        toast(error.status === 401 ? "Session expired. Please login again." : error.message);
      }
    };

    renderDashboard();

    document.querySelectorAll(".tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const filter = tab.dataset.filter;
        document.querySelectorAll("#story-table tr").forEach(row => {
          row.style.display = filter === "all" || row.dataset.status === filter ? "" : "none";
        });
      });
    });
  }

  // Home: pull published blogs from the API and display them above the static examples.
  const homeGrid = document.querySelector(".blog-grid");
  if (homeGrid) {
    api("/blogs")
      .then(data => {
        const blogs = data.blogs || [];
        blogs.forEach(blog => {
          const card = document.createElement("article");
          card.className = "blog-card";
          card.innerHTML =
            '<div class="post-image image-tech"><span>' + escapeHtml(blog.category).toUpperCase() + '</span><b>NEW</b></div>' +
            '<div class="post-body"><div class="meta">' +
            new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
            '</div><h3>' + escapeHtml(blog.title) + '</h3><p>' + escapeHtml(blog.description) + '</p>' +
            '<div class="author-row"><span class="author-avatar">' +
            escapeHtml((blog.authorName || "BU").split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase()) +
            '</span><span><strong>' + escapeHtml(blog.authorName) + '</strong><small>' + escapeHtml(blog.category) + '</small></span></div></div>';
          homeGrid.prepend(card);
        });
      })
      .catch(() => {
        // Static sample stories remain visible when the API isn't running.
      });
  }
});
