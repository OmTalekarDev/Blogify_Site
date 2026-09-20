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

  // Login
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
});
