const CodexiaApp = (() => {
  const CONFIG = {
    adminEmail: "abirxxdbrine2024@gmail.com",
    adminPassword: "#youtuber#69#",
    adminRole: "owner",
    legacyAdminRole: "admin",
    maintenanceMode: true,
    currencyLabel: "৳",
    emailjsPublicKey: "",
    emailjsServiceId: "",
    emailjsTemplateId: "",
  };

  const STORAGE = {
    users: "Codexia_users",
    session: "Codexia_session",
    pendingOtp: "Codexia_pending_otp",
    projects: "Codexia_projects",
    templates: "Codexia_templates",
    systems: "Codexia_systems",
    clients: "Codexia_clients",
    history: "Codexia_history",
    userLogs: "Codexia_user_logs",
    adminLogs: "Codexia_admin_logs",
    specs: "Codexia_specs",
    prefs: "Codexia_prefs",
    geo: "Codexia_geo_state",
  };

  const LEGACY_STORAGE_SETS = [
    {
      users: "CYBRLY_users",
      session: "CYBRLY_session",
      pendingOtp: "CYBRLY_pending_otp",
      projects: "CYBRLY_projects",
      templates: "CYBRLY_templates",
      systems: "CYBRLY_systems",
      clients: "CYBRLY_clients",
      history: "CYBRLY_history",
      userLogs: "CYBRLY_user_logs",
      adminLogs: "CYBRLY_admin_logs",
      specs: "CYBRLY_specs",
      prefs: "CYBRLY_prefs",
      geo: "CYBRLY_geo_state",
    },
    {
      users: "devport_users",
      session: "devport_session",
      pendingOtp: "devport_pending_otp",
      projects: "devport_projects",
      templates: "devport_templates",
      systems: "devport_systems",
      clients: "devport_clients",
      history: "devport_history",
      userLogs: "devport_user_logs",
      adminLogs: "devport_admin_logs",
      specs: "devport_specs",
      prefs: "devport_prefs",
      geo: "devport_geo_state",
    },
  ];

  const DEFAULT_HISTORY = {
    years: 1,
    essay:
      "I began coding with a focus on structure, clarity, and systems that scale. Each year has pushed me to build cleaner architecture, stronger UI logic, and workflows that stay reliable under real use. Codexia tracks that journey with a focus on intentional builds, measurable growth, and a calm, predictable experience for every user.",
    milestones: [],
  };

  const DEFAULT_SPECS = {
    laptop: [
      { label: "Laptop Model", value: "HP Pavilion 15-cc1xx" },
      { label: "CPU", value: "Intel Core i5 (8th Gen, 6-core)" },
      { label: "RAM", value: "8 GB DDR3" },
      { label: "Storage", value: "1000 GB HDD" },
      { label: "GPU", value: "NVIDIA GeForce 940 MX" },
      { label: "Operating System", value: "Windows 11 Home (64-bit)" },
    ],
    mobile: [
      { label: "Phone Model", value: "Android Test Device" },
      { label: "Chipset", value: "Qualcomm Snapdragon Series" },
      { label: "RAM", value: "6 GB" },
      { label: "Storage", value: "128 GB" },
      { label: "OS", value: "Android 13" },
      { label: "Primary Apps", value: "Chrome, Figma Mirror, DevTools" },
    ],
  };

  const DEFAULT_PREFS = {
    theme: "dark",
    compact: false,
    layoutDensity: "comfortable",
    onboardingSeen: false,
    displayName: "",
    bio: "",
    avatarType: "auto",
    avatarData: "",
    accentColor: "#35f6ff",
    glowIntensity: 70,
    fontScale: 1,
    radius: 20,
    animationIntensity: "full",
    respectReducedMotion: true,
    scrollBehavior: "smooth",
    privacy: {
      publicProfile: true,
      showEmail: true,
      showActivity: true,
      showDeviceSpecs: true,
    },
    user: {
      dashboardLayout: "standard",
      notifications: true,
      showPurchases: true,
    },
    admin: {
      controlCenterLayout: "standard",
      logVerbosity: "detailed",
      defaultUploadVisibility: "public",
    },
  };

  let sessionStartMs = null;
  let pendingDelete = null;
  let toastContainer = null;
  let explorerState = {
    mode: "full",
    countryCode: "BD",
    checkedAt: 0,
  };

  const safeParse = (value, fallback) => {
    if (!value) return fallback;
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch {
      return fallback;
    }
  };

  const applyMaintenanceMode = () => {
    document.body.classList.add("maintenance-mode", "loaded");

    let overlay = document.querySelector("[data-maintenance-overlay]");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "maintenance-overlay";
      overlay.dataset.maintenanceOverlay = "true";
      overlay.innerHTML = `
        <div class="maintenance-card glass">
          <p class="eyebrow">Site Disabled</p>
          <h1>Codexia is temporarily offline</h1>
          <p>This site has been disabled. The developers are working on a better version of it.</p>
          <p class="maintenance-note">Please check back later.</p>
        </div>
      `;
      document.body.appendChild(overlay);
    }
  };

  const loadUsers = () => safeParse(localStorage.getItem(STORAGE.users), {});

  const saveUsers = (users) => {
    localStorage.setItem(STORAGE.users, JSON.stringify(users));
  };

  const loadCollection = (key, fallback) => {
    const parsed = safeParse(localStorage.getItem(key), null);
    return Array.isArray(parsed) ? parsed : fallback;
  };

  const saveCollection = (key, items) => {
    localStorage.setItem(key, JSON.stringify(items));
  };

  const loadObject = (key, fallback) => {
    const parsed = safeParse(localStorage.getItem(key), null);
    return parsed && !Array.isArray(parsed) ? parsed : fallback;
  };

  const saveObject = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const migrateLegacyStorage = () => {
    LEGACY_STORAGE_SETS.forEach((legacyStorage) => {
      Object.keys(legacyStorage).forEach((key) => {
        const legacyKey = legacyStorage[key];
        const nextKey = STORAGE[key];
        if (!legacyKey || !nextKey) return;
        const currentRaw = localStorage.getItem(nextKey);
        const legacyRaw = localStorage.getItem(legacyKey);
        if (legacyRaw === null) return;
        if (currentRaw === null) {
          localStorage.setItem(nextKey, legacyRaw);
          return;
        }
        const currentParsed = safeParse(currentRaw, null);
        const legacyParsed = safeParse(legacyRaw, null);
        const isEmptyArray = Array.isArray(currentParsed) && currentParsed.length === 0;
        const isEmptyObject =
          currentParsed &&
          typeof currentParsed === "object" &&
          !Array.isArray(currentParsed) &&
          Object.keys(currentParsed).length === 0;
        const legacyHasArrayData = Array.isArray(legacyParsed) && legacyParsed.length > 0;
        const legacyHasObjectData =
          legacyParsed &&
          typeof legacyParsed === "object" &&
          !Array.isArray(legacyParsed) &&
          Object.keys(legacyParsed).length > 0;

        if ((isEmptyArray && legacyHasArrayData) || (isEmptyObject && legacyHasObjectData)) {
          localStorage.setItem(nextKey, legacyRaw);
        }
      });
    });
  };

  const mergePrefs = (defaults, stored) => {
    if (!stored) return { ...defaults };
    const result = Array.isArray(defaults) ? [...defaults] : { ...defaults };
    Object.keys(defaults).forEach((key) => {
      const value = defaults[key];
      if (value && typeof value === "object" && !Array.isArray(value)) {
        result[key] = mergePrefs(value, stored[key] || {});
      } else if (stored[key] !== undefined) {
        result[key] = stored[key];
      }
    });
    Object.keys(stored).forEach((key) => {
      if (result[key] === undefined) result[key] = stored[key];
    });
    return result;
  };

  const loadSpecs = () => {
    const stored = loadObject(STORAGE.specs, DEFAULT_SPECS);
    return {
      laptop: Array.isArray(stored?.laptop) ? stored.laptop : DEFAULT_SPECS.laptop,
      mobile: Array.isArray(stored?.mobile) ? stored.mobile : DEFAULT_SPECS.mobile,
    };
  };

  const saveSpecs = (specs) => {
    saveObject(STORAGE.specs, specs);
  };

  const loadHistory = () => {
    const stored = loadObject(STORAGE.history, DEFAULT_HISTORY);
    return {
      years: Number(stored?.years) || DEFAULT_HISTORY.years,
      essay: stored?.essay || DEFAULT_HISTORY.essay,
      milestones: Array.isArray(stored?.milestones) ? stored.milestones : [],
    };
  };

  const saveHistory = (history) => {
    saveObject(STORAGE.history, history);
  };

  const ensureAdmin = () => {
    const users = loadUsers();
    Object.keys(users).forEach((email) => {
      if (users[email]?.role === CONFIG.legacyAdminRole) {
        users[email].role = CONFIG.adminRole;
      }
    });
    const existing = users[CONFIG.adminEmail];
    const createdAt = existing?.createdAt || new Date().toISOString();
    users[CONFIG.adminEmail] = {
      password: CONFIG.adminPassword,
      role: CONFIG.adminRole,
      createdAt,
      themePreference: existing?.themePreference || "dark",
    };
    saveUsers(users);
  };

  const ensureProjectSeed = () => {
    const existing = safeParse(localStorage.getItem(STORAGE.projects), null);
    if (!Array.isArray(existing)) {
      saveCollection(STORAGE.projects, []);
    }
  };

  const ensureSystemsSeed = () => {
    const existing = safeParse(localStorage.getItem(STORAGE.systems), null);
    if (!Array.isArray(existing)) {
      saveCollection(STORAGE.systems, []);
    }
  };

  const ensureClientsSeed = () => {
    const existing = safeParse(localStorage.getItem(STORAGE.clients), null);
    if (!Array.isArray(existing)) {
      saveCollection(STORAGE.clients, []);
    }
  };

  const ensureHistorySeed = () => {
    const existing = safeParse(localStorage.getItem(STORAGE.history), null);
    if (!existing || typeof existing !== "object" || Array.isArray(existing)) {
      saveHistory(DEFAULT_HISTORY);
      return;
    }
    const next = {
      years: Number(existing.years) || DEFAULT_HISTORY.years,
      essay: existing.essay || DEFAULT_HISTORY.essay,
      milestones: Array.isArray(existing.milestones) ? existing.milestones : [],
    };
    saveHistory(next);
  };

  const ensureSpecsSeed = () => {
    const existing = safeParse(localStorage.getItem(STORAGE.specs), null);
    if (!existing || typeof existing !== "object" || Array.isArray(existing)) {
      saveSpecs(DEFAULT_SPECS);
      return;
    }
    const next = {
      laptop: Array.isArray(existing.laptop) ? existing.laptop : DEFAULT_SPECS.laptop,
      mobile: Array.isArray(existing.mobile) ? existing.mobile : DEFAULT_SPECS.mobile,
    };
    saveSpecs(next);
  };

  const getSession = () => {
    const session = safeParse(localStorage.getItem(STORAGE.session), null);
    if (!session) return null;
    if (session.role === CONFIG.legacyAdminRole) {
      const next = { ...session, role: CONFIG.adminRole };
      localStorage.setItem(STORAGE.session, JSON.stringify(next));
      return next;
    }
    return session;
  };

  const setSession = (session) => {
    localStorage.setItem(STORAGE.session, JSON.stringify(session));
  };

  const clearSession = () => {
    localStorage.removeItem(STORAGE.session);
  };

  const isAdmin = (session) =>
    !!session && (session.role === CONFIG.adminRole || session.role === CONFIG.legacyAdminRole);

  const showMessage = (el, message, type = "info") => {
    if (!el) return;
    el.textContent = message;
    el.dataset.state = type;
  };

  const ensureToastContainer = () => {
    if (toastContainer) return toastContainer;
    toastContainer = document.querySelector(".toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.className = "toast-container";
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  };

  const showToast = (message, type = "success", options = {}) => {
    const container = ensureToastContainer();
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const text = document.createElement("p");
    text.textContent = message;
    toast.appendChild(text);

    const actions = document.createElement("div");
    actions.className = "toast-actions";

    if (options.actionLabel && typeof options.onAction === "function") {
      const action = document.createElement("button");
      action.type = "button";
      action.className = "toast-action";
      action.textContent = options.actionLabel;
      action.addEventListener("click", () => {
        options.onAction();
        toast.remove();
      });
      actions.appendChild(action);
    }

    const dismiss = document.createElement("button");
    dismiss.type = "button";
    dismiss.className = "toast-action toast-dismiss";
    dismiss.textContent = "Close";
    dismiss.addEventListener("click", () => toast.remove());
    actions.appendChild(dismiss);

    toast.appendChild(actions);
    container.appendChild(toast);

    const duration = typeof options.duration === "number" ? options.duration : 4000;
    window.setTimeout(() => toast.remove(), duration);
  };

  const setLoadingState = (el, isLoading) => {
    if (!el) return;
    el.classList.toggle("hidden", !isLoading);
  };

  const getGeoState = () => {
    const cached = loadObject(STORAGE.geo, null);
    if (!cached || typeof cached !== "object") {
      return { mode: "full", countryCode: "BD", checkedAt: 0 };
    }
    return {
      mode: cached.mode === "explorer" ? "explorer" : "full",
      countryCode: typeof cached.countryCode === "string" ? cached.countryCode : "BD",
      checkedAt: Number(cached.checkedAt) || 0,
    };
  };

  const saveGeoState = (state) => {
    const normalized = {
      mode: state?.mode === "explorer" ? "explorer" : "full",
      countryCode: typeof state?.countryCode === "string" ? state.countryCode : "BD",
      checkedAt: Number(state?.checkedAt) || Date.now(),
    };
    explorerState = normalized;
    saveObject(STORAGE.geo, normalized);
  };

  const isExplorerMode = () => explorerState.mode === "explorer";

  const isExplorerRestrictedPage = (page = document.body.dataset.page) =>
    ["login", "signup", "template"].includes(page || "");

  const detectCountryCode = async () => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 4500);
    try {
      const response = await fetch("https://ipapi.co/json/", {
        method: "GET",
        signal: controller.signal,
      });
      if (response.ok) {
        const payload = await response.json();
        const code = (payload?.country_code || payload?.country || "").toString().toUpperCase();
        if (code) return code;
      }
    } catch {
      // fallback below
    } finally {
      window.clearTimeout(timeoutId);
    }

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.toLowerCase().includes("dhaka")) return "BD";
    return "UNKNOWN";
  };

  const resolveGeoState = async () => {
    const cached = getGeoState();
    const age = Date.now() - cached.checkedAt;
    const isFresh = cached.checkedAt && age >= 0 && age < 1000 * 60 * 60 * 24;
    if (isFresh) {
      explorerState = cached;
      return cached;
    }

    const code = await detectCountryCode();
    const next = {
      mode: code === "BD" ? "full" : "explorer",
      countryCode: code || "UNKNOWN",
      checkedAt: Date.now(),
    };
    saveGeoState(next);
    return next;
  };

  const ensureExplorerModal = () => {
    let modal = document.querySelector('[data-modal="explorer-mode"]');
    if (modal) return modal;
    modal = document.createElement("div");
    modal.className = "modal";
    modal.dataset.modal = "explorer-mode";
    modal.dataset.locked = "true";
    modal.innerHTML = `
      <div class="modal-content glass explorer-modal">
        <h3>Explorer Mode Enabled</h3>
        <p data-explorer-message>You are outside Bangladesh. Continue in Explorer Mode or return.</p>
        <div class="modal-actions">
          <button class="btn btn-outline" type="button" data-explorer-continue>Continue Explorer Mode</button>
          <button class="btn btn-primary" type="button" data-explorer-return>Return</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  };

  const showExplorerModal = (restrictedPage) => {
    const modal = ensureExplorerModal();
    const message = modal.querySelector("[data-explorer-message]");
    if (message) {
      message.textContent = restrictedPage
        ? "You are outside Bangladesh. Login, registration, contact, and template vault are restricted in Explorer Mode."
        : "You are outside Bangladesh. Explorer Mode lets you browse public content only.";
    }
    modal.dataset.locked = restrictedPage ? "true" : "false";
    showModal(modal);
    return modal;
  };

  const applyExplorerRestrictions = () => {
    const active = isExplorerMode();
    document.body.classList.toggle("explorer-mode", active);
    if (!active) return;

    const lockElements = (selector, reason) => {
      document.querySelectorAll(selector).forEach((el) => {
        el.dataset.explorerBlocked = reason;
        if (el.tagName === "A") {
          el.setAttribute("aria-disabled", "true");
          el.setAttribute("tabindex", "-1");
        }
        if (el.tagName === "BUTTON") {
          el.setAttribute("type", "button");
        }
      });
    };

    lockElements('[data-auth-link="login"], [data-auth-link="signup"]', "Authentication is disabled in Explorer Mode.");
    lockElements('a[href="login.html"], a[href="sign.html"]', "Authentication is disabled in Explorer Mode.");
    lockElements('[data-action="buy-templates"], a[href="template.html"], a[href="templates.html"]', "Template vault is unavailable in Explorer Mode.");
    lockElements("[data-contact-form]", "Contact is available only for visitors inside Bangladesh.");
  };

  const setupExplorerInteractions = (restrictedPage) => {
    if (!isExplorerMode()) return;
    const modal = showExplorerModal(!!restrictedPage);
    modal.querySelector("[data-explorer-continue]")?.addEventListener("click", () => {
      hideModal(modal);
      if (restrictedPage) {
        window.location.href = "index.html";
      }
    });
    modal.querySelector("[data-explorer-return]")?.addEventListener("click", () => {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      window.location.href = "index.html";
    });

    document.addEventListener("click", (event) => {
      if (!isExplorerMode()) return;
      const blocked = event.target.closest("[data-explorer-blocked]");
      if (!blocked) return;
      event.preventDefault();
      showToast(blocked.dataset.explorerBlocked || "Restricted in Explorer Mode.", "error");
      showExplorerModal(isExplorerRestrictedPage());
    });
  };

  const ensureTopbarControls = () => {
    const navActions = document.querySelector(".nav-actions");
    const profileTrigger = document.querySelector("[data-user-menu-trigger]");
    if (!navActions || !profileTrigger) return {};

    let accountPill = navActions.querySelector("[data-account-pill]");
    let notificationTrigger = navActions.querySelector("[data-notification-trigger]");

    if (!accountPill) {
      accountPill = document.createElement("div");
      accountPill.className = "account-pill hidden";
      accountPill.dataset.accountPill = "true";

      notificationTrigger = document.createElement("button");
      notificationTrigger.type = "button";
      notificationTrigger.className = "notification-trigger";
      notificationTrigger.dataset.notificationTrigger = "true";
      notificationTrigger.setAttribute("aria-label", "Open owner updates");
      notificationTrigger.setAttribute("aria-haspopup", "dialog");
      notificationTrigger.setAttribute("aria-expanded", "false");
      notificationTrigger.innerHTML = `
        <svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
          <path d="M10 17a2 2 0 0 0 4 0" />
        </svg>
        <span class="notification-count hidden" data-notification-count>0</span>
      `;

      const anchor = navActions.querySelector('[data-auth-link="login"]') || navActions.firstElementChild;
      if (anchor) {
        navActions.insertBefore(accountPill, anchor);
      } else {
        navActions.appendChild(accountPill);
      }

      accountPill.appendChild(notificationTrigger);
      accountPill.appendChild(profileTrigger);
    }

    let notificationMenu = document.querySelector("[data-notification-menu]");
    if (!notificationMenu) {
      notificationMenu = document.createElement("div");
      notificationMenu.className = "notification-menu glass";
      notificationMenu.dataset.notificationMenu = "true";
      notificationMenu.innerHTML = `
        <div class="notification-menu-header">
          <p class="eyebrow">Owner Updates</p>
          <h3 class="user-menu-title" data-notification-menu-title>Latest Uploads</h3>
          <p class="notification-menu-sub" data-notification-menu-sub>Fresh uploads from the owner will appear here.</p>
        </div>
        <div class="notification-empty" data-notification-empty>
          <span>No uploads yet</span>
          Owner releases will appear here as soon as something new goes live.
        </div>
        <div class="notification-list" data-notification-list></div>
      `;

      const userMenu = document.querySelector("[data-user-menu]");
      if (userMenu?.parentElement) {
        userMenu.insertAdjacentElement("afterend", notificationMenu);
      } else {
        document.body.appendChild(notificationMenu);
      }
    }

    return { accountPill, notificationTrigger, notificationMenu };
  };

  const initNav = () => {
    const { accountPill, notificationTrigger, notificationMenu } = ensureTopbarControls();
    const session = getSession();
    const loginLink = document.querySelector('[data-auth-link="login"]');
    const signupLink = document.querySelector('[data-auth-link="signup"]');
    const logoutButtons = document.querySelectorAll('[data-action="logout"]');
    const profileTrigger = document.querySelector('[data-user-menu-trigger]');
    const profileEmail = document.querySelector("[data-profile-email]");
    const profileAvatar = document.querySelector("[data-profile-avatar]");
    const profileLabel = document.querySelector(".profile-label");

    const initialsFor = (email) => {
      if (!email) return "DP";
      const base = email.split("@")[0] || email;
      const clean = base.replace(/[^a-zA-Z0-9]/g, "");
      const chars = clean.slice(0, 2).toUpperCase();
      return chars || "DP";
    };

    if (session?.loggedInUser) {
      const prefs = loadPrefs(session.loggedInUser);
      const displayName = prefs.displayName?.trim();
      if (accountPill) accountPill.classList.remove("hidden");
      if (profileTrigger) profileTrigger.classList.remove("hidden");
      if (profileEmail) {
        profileEmail.textContent = displayName || session.loggedInUser;
        profileEmail.title = session.loggedInUser;
      }
      if (profileAvatar) {
        const initials = initialsFor(session.loggedInUser);
        setAvatarElement(profileAvatar, prefs, initials);
      }
      if (profileTrigger) {
        profileTrigger.title = displayName || session.loggedInUser;
        profileTrigger.setAttribute(
          "aria-label",
          `Open ${isAdmin(session) ? "owner" : "user"} menu`
        );
      }
      if (profileLabel) profileLabel.textContent = isAdmin(session) ? "Owner" : "User";
      if (loginLink) loginLink.classList.add("hidden");
      if (signupLink) signupLink.classList.add("hidden");
      logoutButtons.forEach((btn) => btn.classList.add("visible"));
      if (notificationTrigger) notificationTrigger.disabled = false;
      refreshNotificationsMenu();
    } else {
      if (accountPill) accountPill.classList.add("hidden");
      if (profileTrigger) profileTrigger.classList.add("hidden");
      if (profileEmail) profileEmail.textContent = "";
      if (profileAvatar) {
        profileAvatar.textContent = "DP";
        profileAvatar.style.backgroundImage = "";
        profileAvatar.classList.remove("has-image");
      }
      if (loginLink) loginLink.classList.remove("hidden");
      if (signupLink) signupLink.classList.remove("hidden");
      logoutButtons.forEach((btn) => btn.classList.remove("visible"));
      if (notificationTrigger) {
        notificationTrigger.disabled = true;
        notificationTrigger.classList.remove("has-updates");
        notificationTrigger.setAttribute("aria-expanded", "false");
      }
      const notificationCount = document.querySelector("[data-notification-count]");
      if (notificationCount) {
        notificationCount.textContent = "0";
        notificationCount.classList.add("hidden");
      }
      if (notificationMenu) {
        notificationMenu.classList.remove("open");
      }
    }
  };

  const setupLogout = () => {
    document.querySelectorAll('[data-action="logout"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        clearSession();
        initNav();
        window.location.href = "login.html";
      });
    });
  };

  const protectRoutes = () => {
    const page = document.body.dataset.page;
    if (isExplorerMode() && isExplorerRestrictedPage(page)) {
      return;
    }
    if (page === "template") {
      const session = getSession();
      if (!session || !session.loggedInUser) {
        window.location.href = "login.html";
      }
    }
    if (page === "logs") {
      const session = getSession();
      if (!session || !session.loggedInUser) {
        window.location.href = "login.html";
        return;
      }
      if (!isAdmin(session)) {
        window.location.href = "access.html";
      }
    }
  };

  const applyAdminMode = () => {
    const session = getSession();
    const adminOnly = document.querySelectorAll("[data-admin-only]");
    if (isAdmin(session)) {
      document.body.classList.add("admin-mode");
      adminOnly.forEach((el) => el.classList.add("show"));
    } else {
      document.body.classList.remove("admin-mode");
      adminOnly.forEach((el) => el.classList.remove("show"));
    }
  };

  const setupBuyButtons = () => {
    document.querySelectorAll('[data-action="buy-templates"]').forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        if (isExplorerMode()) {
          showToast("Template vault is unavailable in Explorer Mode.", "error");
          showExplorerModal(false);
          return;
        }
        const session = getSession();
        if (!session || !session.loggedInUser) {
          window.location.href = "login.html";
          return;
        }
        window.location.href = "template.html";
      });
    });
  };

  let revealObserver;

  const setupReveal = () => {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );
    }
    items.forEach((item) => {
      if (!item.classList.contains("in-view")) {
        revealObserver.observe(item);
      }
    });
  };

  const setupScrollIndicator = () => {
    const bar = document.querySelector("[data-scroll-progress]");
    if (!bar) return;
    let ticking = false;

    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? (scrollTop / height) * 100 : 0;
      bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick);
  };

  const setupPasswordToggles = () => {
    document.querySelectorAll("[data-toggle-password]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;
        const input = targetId
          ? document.getElementById(targetId)
          : btn.closest(".input-group")?.querySelector("input");
        if (!input) return;

        const shouldShow = input.type === "password";
        input.type = shouldShow ? "text" : "password";
        btn.classList.toggle("is-visible", shouldShow);
        btn.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
        btn.setAttribute("aria-pressed", String(shouldShow));
      });
    });
  };

  const showModal = (modal) => {
    if (!modal) return;
    modal.classList.remove("closing");
    modal.classList.add("show");
    updateScrollLock();
  };

  const canCloseModal = (modal) => modal?.dataset?.locked !== "true";

  const hideModal = (modal) => {
    if (!modal || !modal.classList.contains("show")) return;
    if (modal.dataset?.modal === "confirm-delete") {
      pendingDelete = null;
    }
    modal.classList.add("closing");
    window.setTimeout(() => {
      modal.classList.remove("show");
      modal.classList.remove("closing");
      updateScrollLock();
    }, 240);
  };

  const openModal = (key) => {
    const modal = document.querySelector(`[data-modal="${key}"]`);
    showModal(modal);
  };

  const setupModalTriggers = () => {
    document.querySelectorAll("[data-open-modal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.openModal;
        openModal(key);
      });
    });

    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        hideModal(btn.closest(".modal"));
      });
    });

    document.querySelectorAll(".modal[data-modal]").forEach((modal) => {
      modal.addEventListener("click", (event) => {
        if (event.target === modal && canCloseModal(modal)) hideModal(modal);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const openModals = document.querySelectorAll(".modal.show");
        if (!openModals.length) return;
        openModals.forEach((modal) => {
          if (canCloseModal(modal)) hideModal(modal);
        });
      }

      if (event.key === "Enter") {
        const confirmModal = document.querySelector('[data-modal="confirm-delete"].show');
        if (!confirmModal) return;
        confirmModal.querySelector("[data-confirm-approve]")?.click();
      }
    });
  };

  const getUserLogs = () => loadObject(STORAGE.userLogs, {});

  const saveUserLogs = (logs) => {
    saveObject(STORAGE.userLogs, logs);
  };

  const ensureUserRecord = (logs, email) => {
    const record = logs[email] || {
      visits: 0,
      totalTimeMs: 0,
      purchases: [],
      activities: [],
    };
    record.purchases = Array.isArray(record.purchases) ? record.purchases : [];
    record.activities = Array.isArray(record.activities) ? record.activities : [];
    logs[email] = record;
    return record;
  };

  const addUserActivity = (email, type, message, target = "") => {
    if (!email) return;
    const logs = getUserLogs();
    const record = ensureUserRecord(logs, email);
    record.activities.unshift({
      type,
      message,
      target,
      time: new Date().toISOString(),
    });
    record.activities = record.activities.slice(0, 60);
    logs[email] = record;
    saveUserLogs(logs);
  };

  const getAdminLogs = () =>
    loadObject(STORAGE.adminLogs, {
      visits: 0,
      purchases: 0,
      uploads: 0,
      activities: [],
    });

  const saveAdminLogs = (logs) => {
    saveObject(STORAGE.adminLogs, logs);
  };

  const addAdminActivity = (type, message, meta = {}, countKey = null) => {
    const logs = getAdminLogs();
    if (countKey) {
      logs[countKey] = (logs[countKey] || 0) + 1;
    }
    const entry = {
      type,
      message,
      time: new Date().toISOString(),
      ...meta,
    };
    logs.activities = Array.isArray(logs.activities) ? logs.activities : [];
    logs.activities.unshift(entry);
    logs.activities = logs.activities.slice(0, 60);
    saveAdminLogs(logs);
    refreshNotificationsMenu();
  };

  const formatDuration = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const registerVisit = () => {
    const session = getSession();
    if (!session?.loggedInUser) return;
    const email = session.loggedInUser;
    const logs = getUserLogs();
    const record = ensureUserRecord(logs, email);
    record.visits += 1;
    record.lastVisit = new Date().toISOString();
    logs[email] = record;
    saveUserLogs(logs);

    const page = document.body.dataset.page || "page";
    addAdminActivity("visit", `Visit: ${email} on ${page}`, { email, target: page }, "visits");
    addUserActivity(email, "visit", `Visited ${page}`, page);

    sessionStartMs = Date.now();
    window.addEventListener("beforeunload", () => {
      if (!sessionStartMs) return;
      const elapsed = Date.now() - sessionStartMs;
      const updated = getUserLogs();
      const entry = ensureUserRecord(updated, email);
      entry.totalTimeMs = (entry.totalTimeMs || 0) + elapsed;
      updated[email] = entry;
      saveUserLogs(updated);
      addAdminActivity("session", `Session time: ${email} +${formatDuration(elapsed)}`, { email, target: "session" });
      addUserActivity(email, "session", `Session time +${formatDuration(elapsed)}`, "session");
    });
  };

  const logPurchase = (templateName) => {
    const session = getSession();
    if (!session?.loggedInUser) return;
    const email = session.loggedInUser;
    const logs = getUserLogs();
    const record = ensureUserRecord(logs, email);
    record.purchases.unshift({
      name: templateName,
      time: new Date().toISOString(),
    });
    logs[email] = record;
    saveUserLogs(logs);
    addAdminActivity("purchase", `Purchase: ${email} -> ${templateName}`, { email, target: templateName }, "purchases");
    addUserActivity(email, "purchase", `Purchased ${templateName}`, templateName);
  };

  const logUpload = (label) => {
    const session = getSession();
    if (!session?.loggedInUser) return;
    addAdminActivity(
      "upload",
      `Upload: ${session.loggedInUser} -> ${label}`,
      { email: session.loggedInUser, target: label },
      "uploads"
    );
    addUserActivity(session.loggedInUser, "upload", `Uploaded ${label}`, label);
  };

  const logDelete = (label) => {
    const session = getSession();
    if (!session?.loggedInUser) return;
    addAdminActivity("delete", `Delete: ${session.loggedInUser} -> ${label}`, {
      email: session.loggedInUser,
      target: label,
    });
    addUserActivity(session.loggedInUser, "delete", `Deleted ${label}`, label);
  };

  const logFeatureToggle = (label, featured) => {
    const session = getSession();
    if (!session?.loggedInUser) return;
    const action = featured ? "Feature" : "Unfeature";
    addAdminActivity("feature", `${action}: ${session.loggedInUser} -> ${label}`, {
      email: session.loggedInUser,
      target: label,
    });
    addUserActivity(session.loggedInUser, "feature", `${action} ${label}`, label);
  };

  const logThemeChange = (theme) => {
    const session = getSession();
    if (!session?.loggedInUser) return;
    addAdminActivity("theme", `Theme: ${session.loggedInUser} -> ${theme}`, {
      email: session.loggedInUser,
      target: theme,
    });
    addUserActivity(session.loggedInUser, "theme", `Theme set to ${theme}`, theme);
  };

  const logRestore = (label) => {
    const session = getSession();
    if (!session?.loggedInUser) return;
    addAdminActivity("restore", `Restore: ${session.loggedInUser} -> ${label}`, {
      email: session.loggedInUser,
      target: label,
    });
    addUserActivity(session.loggedInUser, "restore", `Restored ${label}`, label);
  };

  const logUpdate = (label) => {
    const session = getSession();
    if (!session?.loggedInUser) return;
    addAdminActivity("update", `Update: ${session.loggedInUser} -> ${label}`, {
      email: session.loggedInUser,
      target: label,
    });
    addUserActivity(session.loggedInUser, "update", `Updated ${label}`, label);
  };

  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const maskCredential = (value = "") => {
    if (!value) return "--";
    return "•".repeat(Math.max(6, Math.min(14, value.length)));
  };

  const renderOwnerAccounts = () => {
    const dashboard = document.querySelector("[data-admin-dashboard]");
    if (!dashboard) return;

    let wrapper = dashboard.querySelector("[data-owner-accounts]");
    let list = dashboard.querySelector("[data-owner-account-list]");
    if (!wrapper || !list) {
      wrapper = document.createElement("section");
      wrapper.className = "owner-accounts";
      wrapper.dataset.ownerAccounts = "true";

      const title = document.createElement("h4");
      title.textContent = "Registered Accounts";
      wrapper.appendChild(title);

      list = document.createElement("div");
      list.className = "menu-log";
      list.dataset.ownerAccountList = "true";
      wrapper.appendChild(list);

      dashboard.appendChild(wrapper);
    }

    const users = loadUsers();
    const allPrefs = loadObject(STORAGE.prefs, {});
    const entries = Object.entries(users).sort((a, b) => {
      const left = new Date(a[1]?.createdAt || 0).getTime();
      const right = new Date(b[1]?.createdAt || 0).getTime();
      return right - left;
    });

    if (!entries.length) {
      list.innerHTML = '<div class="menu-log-item"><span>No users yet</span>Registered accounts appear here.</div>';
      return;
    }

    list.innerHTML = entries
      .map(([accountEmail, info]) => {
        const displayName = allPrefs?.[accountEmail]?.displayName?.trim() || "No display name";
        const role = info?.role === CONFIG.adminRole || info?.role === CONFIG.legacyAdminRole ? "Owner" : "User";
        const created = info?.createdAt ? new Date(info.createdAt).toLocaleString() : "--";
        const password = info?.password || "";
        return `
          <div class="menu-log-item owner-account-item">
            <span>${escapeHtml(accountEmail)}</span>
            <small>${escapeHtml(displayName)} • ${role} • Created ${created}</small>
            <div class="owner-credential-row">
              <code class="owner-credential" data-owner-password data-password="${escapeHtml(password)}">${maskCredential(password)}</code>
              <button class="btn btn-ghost owner-credential-toggle" type="button" data-owner-pass-toggle>Show</button>
            </div>
          </div>
        `;
      })
      .join("");
  };

  const refreshNotificationsMenu = () => {
    const session = getSession();
    const notificationTrigger = document.querySelector("[data-notification-trigger]");
    const notificationList = document.querySelector("[data-notification-list]");
    const notificationEmpty = document.querySelector("[data-notification-empty]");
    const notificationCount = document.querySelector("[data-notification-count]");
    const notificationTitle = document.querySelector("[data-notification-menu-title]");
    const notificationSub = document.querySelector("[data-notification-menu-sub]");
    if (!notificationTrigger || !notificationList || !notificationEmpty) return;

    const uploads = (Array.isArray(getAdminLogs().activities) ? getAdminLogs().activities : []).filter(
      (entry) => entry?.type === "upload"
    );
    const uploadCount = uploads.length;

    if (notificationTitle) notificationTitle.textContent = "Latest Uploads";
    if (notificationSub) {
      notificationSub.textContent = isAdmin(session)
        ? "Your published uploads are collected here for quick review."
        : "Recent owner uploads are collected here so you can see what is new.";
    }

    if (!session?.loggedInUser) {
      notificationList.innerHTML = "";
      notificationEmpty.classList.remove("hidden");
      notificationEmpty.innerHTML = "<span>Sign in to view updates</span>Owner uploads become available here once you are logged in.";
      if (notificationCount) {
        notificationCount.textContent = "0";
        notificationCount.classList.add("hidden");
      }
      notificationTrigger.classList.remove("has-updates");
      notificationTrigger.title = "Open owner updates";
      return;
    }

    if (!uploadCount) {
      notificationList.innerHTML = "";
      notificationEmpty.classList.remove("hidden");
      notificationEmpty.innerHTML = "<span>No uploads yet</span>Owner releases will appear here as soon as something new goes live.";
    } else {
      notificationEmpty.classList.add("hidden");
      notificationList.innerHTML = uploads
        .map((entry) => {
          const actor = entry.email ? escapeHtml(entry.email) : "Owner";
          const target = escapeHtml(entry.target || "New upload");
          const time = entry.time ? new Date(entry.time).toLocaleString() : "Just now";
          return `
            <article class="notification-item">
              <span>New upload: ${target}</span>
              <small>${actor} • ${time}</small>
            </article>
          `;
        })
        .join("");
    }

    if (notificationCount) {
      notificationCount.textContent = uploadCount > 99 ? "99+" : String(uploadCount);
      notificationCount.classList.toggle("hidden", uploadCount === 0);
    }
    notificationTrigger.classList.toggle("has-updates", uploadCount > 0);
    notificationTrigger.title =
      uploadCount > 0 ? `${uploadCount} owner update${uploadCount === 1 ? "" : "s"}` : "Open owner updates";
  };

  const refreshUserMenu = () => {
    const session = getSession();
    if (!session?.loggedInUser) return;
    const email = session.loggedInUser;
    const logs = getUserLogs();
    const record = ensureUserRecord(logs, email);
    saveUserLogs(logs);
    const totalTime = (record.totalTimeMs || 0) + (sessionStartMs ? Date.now() - sessionStartMs : 0);
    const prefs = loadPrefs(email);

    const title = document.querySelector("[data-user-menu-title]");
    const sub = document.querySelector("[data-user-menu-sub]");
    const roleLabel = document.querySelector("[data-user-role-label]");
    const userEmail = document.querySelector("[data-user-email]");
    const userAvatar = document.querySelector("[data-user-avatar]");
    const userName = document.querySelector("[data-user-name]");
    const userBio = document.querySelector("[data-user-bio]");
    const roleBadge = document.querySelector("[data-user-role-badge]");
    const metaLine = document.querySelector("[data-user-meta]");
    const primaryAction = document.querySelector('[data-action="open-primary"]');
    const logAction = document.querySelector('[data-action="view-logs"]');

    if (isAdmin(session)) {
      if (title) title.textContent = "Owner Control Center";
      if (sub) sub.textContent = "Centralized monitoring for users, purchases, uploads, and global activity.";
      if (roleLabel) roleLabel.textContent = "Owner Access";
      if (roleBadge) roleBadge.textContent = "Owner";
      if (primaryAction) primaryAction.textContent = "Owner Control Center";
      if (logAction) logAction.textContent = "Show All Logs";
    } else {
      if (title) title.textContent = "User Dashboard";
      if (sub) sub.textContent = "Track your visit stats and purchase history.";
      if (roleLabel) roleLabel.textContent = "User Access";
      if (roleBadge) roleBadge.textContent = "User";
      if (primaryAction) primaryAction.textContent = "User Dashboard";
      if (logAction) logAction.textContent = "View Purchases";
    }

    if (userEmail) userEmail.textContent = email;
    if (userAvatar) {
      const initials = email
        .split("@")[0]
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, 2)
        .toUpperCase();
      setAvatarElement(userAvatar, prefs, initials || "DP");
    }
    if (userName) {
      const displayName = prefs.displayName?.trim();
      userName.textContent = displayName || (isAdmin(session) ? "Codexia Owner" : "Codexia User");
    }
    if (userBio) {
      const bio = prefs.bio?.trim();
      userBio.textContent =
        bio ||
        (isAdmin(session)
          ? "System authority. Monitoring global activity."
          : "Neon system builder.");
    }
    if (metaLine) {
      const users = loadUsers();
      const createdAt = users[email]?.createdAt;
      const loginAt = session.loginAt;
      const metaDate = loginAt || createdAt;
      metaLine.textContent = metaDate
        ? `Last login ${new Date(metaDate).toLocaleString()}`
        : "Member since --";
    }

    const visitTime = document.querySelector("[data-user-visit-time]");
    const visits = document.querySelector("[data-user-visits]");
    const purchases = document.querySelector("[data-user-purchases]");
    const purchaseList = document.querySelector("[data-user-purchase-list]");
    const timelineList = document.querySelector("[data-user-timeline]");
    const timelineHeading =
      timelineList && timelineList.previousElementSibling?.tagName === "H4"
        ? timelineList.previousElementSibling
        : null;

    if (visitTime) visitTime.textContent = formatDuration(totalTime);
    if (visits) visits.textContent = String(record.visits || 0);
    if (purchases) purchases.textContent = String(record.purchases?.length || 0);

    if (purchaseList) {
      const items = record.purchases || [];
      if (!items.length) {
        purchaseList.innerHTML = '<div class="menu-log-item"><span>No purchases yet</span>Start building your template vault.</div>';
      } else {
        purchaseList.innerHTML = items
          .slice(0, 8)
          .map(
            (item) =>
              `<div class="menu-log-item"><span>${escapeHtml(item.name)}</span>${new Date(item.time).toLocaleString()}</div>`
          )
          .join("");
      }
    }

    if (timelineList) {
      if (isAdmin(session)) {
        timelineList.classList.remove("hidden");
        if (timelineHeading) timelineHeading.classList.remove("hidden");
      } else {
        timelineList.innerHTML = "";
        timelineList.classList.add("hidden");
        if (timelineHeading) timelineHeading.classList.add("hidden");
      }
    }

    if (isAdmin(session)) {
      const adminLogs = getAdminLogs();
      const adminVisits = document.querySelector("[data-admin-visits]");
      const adminPurchases = document.querySelector("[data-admin-purchases]");
      const adminUploads = document.querySelector("[data-admin-uploads]");
      const adminLogList = document.querySelector("[data-admin-log-list]");
      const verbosity = prefs.admin?.logVerbosity || "detailed";
      const limit = verbosity === "minimal" ? 3 : verbosity === "standard" ? 5 : 8;

      if (adminVisits) adminVisits.textContent = String(adminLogs.visits || 0);
      if (adminPurchases) adminPurchases.textContent = String(adminLogs.purchases || 0);
      if (adminUploads) adminUploads.textContent = String(adminLogs.uploads || 0);

      if (adminLogList) {
        const activity = Array.isArray(adminLogs.activities) ? adminLogs.activities : [];
        if (!activity.length) {
          adminLogList.innerHTML = '<div class="menu-log-item"><span>No activity yet</span>System events will appear here.</div>';
        } else {
          adminLogList.innerHTML = activity
            .slice(0, limit)
            .map(
              (entry) =>
                `<div class="menu-log-item"><span>${escapeHtml(entry.message || "Activity")}</span>${new Date(entry.time).toLocaleString()}</div>`
            )
            .join("");
        }
      }
      renderOwnerAccounts();
    }

    refreshNotificationsMenu();
  };

  const updateScrollLock = () => {
    const modalOpen = !!document.querySelector(".modal.show");
    const menuOpen = document.querySelector("[data-user-menu]")?.classList.contains("open");
    const notificationOpen = document.querySelector("[data-notification-menu]")?.classList.contains("open");
    document.body.classList.toggle("modal-open", modalOpen || menuOpen || notificationOpen);
  };

  const setupUserMenu = () => {
    ensureTopbarControls();
    const trigger = document.querySelector("[data-user-menu-trigger]");
    const notificationTrigger = document.querySelector("[data-notification-trigger]");
    const menu = document.querySelector("[data-user-menu]");
    const notificationMenu = document.querySelector("[data-notification-menu]");
    const overlay = document.querySelector("[data-user-overlay]");
    if (!trigger || !notificationTrigger || !menu || !notificationMenu || !overlay) return;

    const scrollMenuTo = (target) => {
      if (!target) return;
      const top = target.offsetTop - 16;
      menu.scrollTo({ top, behavior: "smooth" });
    };

    const closeMenus = () => {
      menu.classList.remove("open");
      notificationMenu.classList.remove("open");
      overlay.classList.remove("show");
      trigger.setAttribute("aria-expanded", "false");
      notificationTrigger.setAttribute("aria-expanded", "false");
      updateScrollLock();
    };

    const openMenu = () => {
      refreshUserMenu();
      notificationMenu.classList.remove("open");
      menu.classList.add("open");
      overlay.classList.add("show");
      trigger.setAttribute("aria-expanded", "true");
      notificationTrigger.setAttribute("aria-expanded", "false");
      updateScrollLock();
    };

    const openNotifications = () => {
      refreshNotificationsMenu();
      menu.classList.remove("open");
      notificationMenu.classList.add("open");
      overlay.classList.add("show");
      trigger.setAttribute("aria-expanded", "false");
      notificationTrigger.setAttribute("aria-expanded", "true");
      updateScrollLock();
    };

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      if (menu.classList.contains("open")) {
        closeMenus();
      } else {
        openMenu();
      }
    });

    notificationTrigger.addEventListener("click", (event) => {
      event.stopPropagation();
      if (notificationMenu.classList.contains("open")) {
        closeMenus();
      } else {
        openNotifications();
      }
    });

    overlay.addEventListener("click", closeMenus);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenus();
    });
    document.addEventListener("click", (event) => {
      const clickedInsideUserMenu = menu.contains(event.target) || trigger.contains(event.target);
      const clickedInsideNotifications =
        notificationMenu.contains(event.target) || notificationTrigger.contains(event.target);
      if (!clickedInsideUserMenu && !clickedInsideNotifications) {
        closeMenus();
      }
    });

    menu.addEventListener("click", (event) => {
      const passToggle = event.target.closest("[data-owner-pass-toggle]");
      if (passToggle) {
        const row = passToggle.closest(".owner-credential-row");
        const code = row?.querySelector("[data-owner-password]");
        if (!code) return;
        const raw = code.dataset.password || "";
        const isHidden = passToggle.dataset.state !== "show";
        code.textContent = isHidden ? raw || "--" : maskCredential(raw);
        passToggle.textContent = isHidden ? "Hide" : "Show";
        passToggle.dataset.state = isHidden ? "show" : "hide";
        return;
      }

      const actionEl = event.target.closest("[data-action]");
      if (!actionEl) return;
      const action = actionEl.dataset.action;
      if (!action) return;
      if (action === "logout") {
        closeMenus();
        return;
      }
      const session = getSession();
      if (action === "open-primary") {
        const target = isAdmin(session)
          ? menu.querySelector("[data-admin-dashboard]")
          : menu.querySelector("[data-user-dashboard]");
        scrollMenuTo(target);
      }
      if (action === "open-customization") {
        scrollMenuTo(menu.querySelector("[data-customization]"));
      }
      if (action === "view-logs") {
        if (isAdmin(session)) {
          window.location.href = "logs.html";
          return;
        }
        scrollMenuTo(menu.querySelector("[data-user-purchase-list]"));
      }
    });
  };

  const getPrefValue = (prefs, path) => {
    if (!prefs || !path) return undefined;
    return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), prefs);
  };

  const setPrefValue = (prefs, path, value) => {
    if (!path) return prefs;
    const keys = path.split(".");
    const next = { ...prefs };
    let cursor = next;
    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        cursor[key] = value;
      } else {
        const existing = cursor[key];
        cursor[key] = existing && typeof existing === "object" && !Array.isArray(existing) ? { ...existing } : {};
        cursor = cursor[key];
      }
    });
    return next;
  };

  const getLayoutDensity = (prefs) => {
    if (prefs?.layoutDensity) return prefs.layoutDensity;
    return prefs?.compact ? "compact" : "comfortable";
  };

  const hexToRgb = (hex) => {
    if (!hex || typeof hex !== "string") return null;
    const cleaned = hex.replace("#", "").trim();
    if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
    const intVal = parseInt(cleaned, 16);
    return {
      r: (intVal >> 16) & 255,
      g: (intVal >> 8) & 255,
      b: intVal & 255,
    };
  };

  const setAvatarElement = (el, prefs, fallbackText) => {
    if (!el) return;
    if (prefs?.avatarType === "image" && prefs.avatarData) {
      el.style.backgroundImage = `url(${prefs.avatarData})`;
      el.classList.add("has-image");
      el.textContent = "";
      return;
    }
    el.style.backgroundImage = "";
    el.classList.remove("has-image");
    el.textContent = fallbackText || "DP";
  };

  const syncDarkReaderLock = (isLight) => {
    const head = document.head || document.querySelector("head");
    const colorScheme = isLight ? "light" : "dark";

    document.documentElement.style.colorScheme = colorScheme;
    if (document.body) {
      document.body.style.colorScheme = colorScheme;
    }

    if (!head) return;

    let lockMeta = head.querySelector('meta[name="darkreader-lock"]');
    if (isLight) {
      if (!lockMeta) {
        lockMeta = document.createElement("meta");
        lockMeta.name = "darkreader-lock";
        head.appendChild(lockMeta);
      }
      return;
    }

    if (lockMeta) {
      lockMeta.remove();
    }
  };

  const updateRangeValue = (key, value) => {
    const outputs = document.querySelectorAll(`[data-range-value="${key}"]`);
    if (!outputs.length) return;
    let label = String(value ?? "");
    if (key === "glowIntensity") {
      label = `${Math.round(Number(value) || 0)}%`;
    } else if (key === "fontScale") {
      label = `${Number(value || 1).toFixed(2)}x`;
    } else if (key === "radius") {
      label = `${Math.round(Number(value) || 0)}px`;
    }
    outputs.forEach((output) => {
      output.textContent = label;
    });
  };

  const syncCustomizationFields = (prefs) => {
    document.querySelectorAll("[data-pref-field]").forEach((field) => {
      const path = field.dataset.prefField;
      if (!path) return;
      let value = getPrefValue(prefs, path);
      if (path === "layoutDensity") {
        value = getLayoutDensity(prefs);
      }
      if (field.type === "checkbox") {
        field.checked = !!value;
      } else if (value !== undefined && value !== null) {
        field.value = value;
      }
    });

    updateRangeValue("glowIntensity", prefs.glowIntensity);
    updateRangeValue("fontScale", prefs.fontScale);
    updateRangeValue("radius", prefs.radius);

    const session = getSession();
    const fallback = session?.loggedInUser
      ? session.loggedInUser
          .split("@")[0]
          .replace(/[^a-zA-Z0-9]/g, "")
          .slice(0, 2)
          .toUpperCase() || "DP"
      : "DP";
    setAvatarElement(document.querySelector("[data-avatar-preview]"), prefs, fallback);
  };

  const loadPrefs = (email) => {
    const allPrefs = loadObject(STORAGE.prefs, {});
    const stored = allPrefs[email] || {};
    const users = loadUsers();
    const userTheme = users[email]?.themePreference;
    const merged = mergePrefs(DEFAULT_PREFS, stored);
    merged.layoutDensity = merged.layoutDensity || (merged.compact ? "compact" : "comfortable");
    merged.compact = merged.layoutDensity === "compact";
    if (userTheme && !stored.theme) {
      merged.theme = userTheme;
    }
    return merged;
  };

  const savePrefs = (email, prefs) => {
    const allPrefs = loadObject(STORAGE.prefs, {});
    allPrefs[email] = prefs;
    saveObject(STORAGE.prefs, allPrefs);
    const users = loadUsers();
    if (users[email]) {
      users[email].themePreference = prefs.theme || "dark";
      saveUsers(users);
    }
  };

  const applyPrefs = (prefs) => {
    const isLight = prefs.theme === "light";
    const density = getLayoutDensity(prefs);
    const isCompact = density === "compact";
    const accent = prefs.accentColor || "#35f6ff";
    const rgb = hexToRgb(accent);
    const glowIntensity = Number(prefs.glowIntensity);
    const glowBase = Number.isFinite(glowIntensity) ? glowIntensity / 100 : 0.7;
    const glowAlpha = Math.min(0.9, Math.max(0.15, glowBase * 0.9));
    const glowSoft = Math.min(0.75, Math.max(0.08, glowBase * 0.6));
    const fontScale = Number(prefs.fontScale) || 1;
    const radius = Number(prefs.radius) || 20;

    document.documentElement.classList.toggle("light-mode", isLight);
    document.body.classList.toggle("light-mode", isLight);
    document.body.classList.toggle("layout-compact", isCompact);
    syncDarkReaderLock(isLight);

    document.documentElement.style.setProperty("--accent", accent);
    if (rgb) {
      document.documentElement.style.setProperty("--accent-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
    document.documentElement.style.setProperty("--glow-alpha", glowAlpha.toFixed(2));
    document.documentElement.style.setProperty("--glow-alpha-soft", glowSoft.toFixed(2));
    document.documentElement.style.setProperty("--font-scale", String(fontScale));
    document.documentElement.style.setProperty("--radius", `${radius}px`);

    const scrollBehavior = prefs.scrollBehavior === "instant" ? "auto" : "smooth";
    document.documentElement.style.scrollBehavior = scrollBehavior;
    document.body.style.scrollBehavior = scrollBehavior;

    document.body.classList.toggle("hide-email", prefs.privacy?.showEmail === false);
    document.body.classList.toggle("hide-activity", prefs.privacy?.showActivity === false);
    document.body.classList.toggle("hide-device-specs", prefs.privacy?.showDeviceSpecs === false);
    document.body.classList.toggle("hide-purchases", prefs.user?.showPurchases === false);
    document.body.classList.toggle("profile-private", prefs.privacy?.publicProfile === false);

    const systemReduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shouldReduce = prefs.animationIntensity === "reduced" || (prefs.respectReducedMotion && systemReduce);
    document.body.classList.toggle("reduce-motion", !!shouldReduce);
  };

  const syncPrefButtons = (prefs) => {
    document.querySelectorAll("[data-pref-toggle]").forEach((btn) => {
      const key = btn.dataset.prefToggle;
      const active = key === "compact" ? getLayoutDensity(prefs) === "compact" : !!prefs[key];
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  };

  const syncThemeButtons = (prefs) => {
    document.querySelectorAll("[data-theme-set]").forEach((btn) => {
      const theme = btn.dataset.themeSet;
      const active = prefs.theme === theme;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  };

  const stripLegacyControlCenterThemeControls = () => {
    document.querySelectorAll("[data-theme-set], [data-pref-toggle]").forEach((el) => el.remove());
    document.querySelectorAll("[data-customization]").forEach((section) => {
      const copy = section.querySelector("p");
      if (copy) {
        copy.textContent = "Theme and layout settings are now managed inside Customize Profile.";
      }
      const grid = section.querySelector(".customization-grid");
      if (!grid) return;
      if (grid.querySelector(".control-center-note")) return;
      const note = document.createElement("p");
      note.className = "muted control-center-note";
      note.textContent = "Open Customize Profile to change theme, density, and interface preferences.";
      grid.appendChild(note);
    });
  };

  const setupPreferences = () => {
    const session = getSession();
    stripLegacyControlCenterThemeControls();
    if (!session?.loggedInUser) return;
    const email = session.loggedInUser;
    const prefs = loadPrefs(email);
    applyPrefs(prefs);
    syncPrefButtons(prefs);
    syncThemeButtons(prefs);
    syncCustomizationFields(prefs);
  };

  const setupProfileCustomization = () => {
    const session = getSession();
    if (!session?.loggedInUser) return;
    const email = session.loggedInUser;
    const modal = document.querySelector('[data-modal="profile-customize"]');
    if (!modal) return;
    let prefs = loadPrefs(email);
    let autoCloseTimer = null;
    let clearStatusTimer = null;

    let status = modal.querySelector("[data-customize-status]");
    if (!status) {
      status = document.createElement("div");
      status.className = "form-message";
      status.dataset.customizeStatus = "true";
      const intro = modal.querySelector(".muted");
      if (intro?.parentElement) {
        intro.insertAdjacentElement("afterend", status);
      } else {
        modal.querySelector(".modal-content")?.prepend(status);
      }
    }

    const setStatus = (text, type = "success") => {
      if (!status) return;
      showMessage(status, text, type);
      if (clearStatusTimer) window.clearTimeout(clearStatusTimer);
      clearStatusTimer = window.setTimeout(() => showMessage(status, "", "info"), 1600);
    };

    const scheduleAutoClose = () => {
      if (autoCloseTimer) window.clearTimeout(autoCloseTimer);
      autoCloseTimer = window.setTimeout(() => {
        if (modal.classList.contains("show")) {
          hideModal(modal);
        }
      }, 1100);
    };

    const applyAndSync = (next, options = {}) => {
      prefs = next;
      savePrefs(email, prefs);
      applyPrefs(prefs);
      syncPrefButtons(prefs);
      syncThemeButtons(prefs);
      syncCustomizationFields(prefs);
      refreshUserMenu();
      initNav();
      if (options.logTheme) {
        logThemeChange(prefs.theme);
      }
      setStatus("Saved automatically.", "success");
      scheduleAutoClose();
    };

    const handleFieldChange = (field) => {
      const path = field.dataset.prefField;
      if (!path) return;
      if (!isAdmin(session) && path.startsWith("admin.")) return;

      let value;
      if (field.type === "checkbox") {
        value = field.checked;
      } else if (field.type === "range" || field.type === "number") {
        value = Number(field.value);
      } else {
        value = field.value.trim();
      }

      let next = loadPrefs(email);
      const currentValue = getPrefValue(next, path);
      if (currentValue === value) return;
      next = setPrefValue(next, path, value);

      if (path === "layoutDensity") {
        const isCompact = value === "compact";
        next.compact = isCompact;
      }

      applyAndSync(next, { logTheme: path === "theme" });
    };

    modal.querySelectorAll("[data-pref-field]").forEach((field) => {
      const eventName =
        field.tagName === "SELECT" || field.type === "checkbox" ? "change" : "input";
      field.addEventListener(eventName, () => handleFieldChange(field));
    });

    const avatarInput = modal.querySelector("[data-avatar-input]");
    const avatarReset = modal.querySelector("[data-avatar-reset]");

    if (avatarInput) {
      avatarInput.addEventListener("change", () => {
        const file = avatarInput.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const next = {
            ...loadPrefs(email),
            avatarType: "image",
            avatarData: reader.result,
          };
          applyAndSync(next);
        };
        reader.readAsDataURL(file);
      });
    }

    if (avatarReset) {
      avatarReset.addEventListener("click", () => {
        if (avatarInput) avatarInput.value = "";
        const next = {
          ...loadPrefs(email),
          avatarType: "auto",
          avatarData: "",
        };
        applyAndSync(next);
      });
    }

    document.querySelectorAll('[data-open-modal="profile-customize"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        prefs = loadPrefs(email);
        if (autoCloseTimer) window.clearTimeout(autoCloseTimer);
        showMessage(status, "", "info");
        syncCustomizationFields(prefs);
      });
    });

    syncCustomizationFields(prefs);
  };

  const setupOnboarding = () => {
    const modal = document.querySelector('[data-modal="onboarding"]');
    if (!modal) return;
    const session = getSession();
    if (!session?.loggedInUser) return;
    const email = session.loggedInUser;
    const prefs = loadPrefs(email);
    if (prefs.onboardingSeen) return;

    const markSeen = () => {
      const updated = { ...prefs, onboardingSeen: true };
      savePrefs(email, updated);
      hideModal(modal);
    };

    modal.querySelector("[data-onboarding-dismiss]")?.addEventListener("click", markSeen);
    modal.querySelector("[data-onboarding-never]")?.addEventListener("click", markSeen);
    modal.querySelector("[data-onboarding-close]")?.addEventListener("click", markSeen);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) markSeen();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("show")) {
        markSeen();
      }
    });

    showModal(modal);
  };

  const createDeleteButton = (type, index, label) => {
    const button = document.createElement("button");
    button.className = "delete-btn";
    button.type = "button";
    button.dataset.deleteType = type;
    button.dataset.deleteIndex = String(index);
    button.setAttribute("aria-label", `Delete ${label}`);
    button.title = `Delete ${label}`;
    button.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="3 6 5 6 21 6" />
        <path d="M8 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    `;
    return button;
  };

  const createFeatureButton = (type, index, isFeatured) => {
    const button = document.createElement("button");
    button.className = `feature-btn${isFeatured ? " active" : ""}`;
    button.type = "button";
    button.dataset.featureType = type;
    button.dataset.featureIndex = String(index);
    button.setAttribute("aria-label", "Toggle featured");
    button.title = "Toggle featured";
    button.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 3.6l2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.9L12 3.6Z" />
      </svg>
    `;
    return button;
  };

  const createEditButton = (type, index, label) => {
    const button = document.createElement("button");
    button.className = "edit-btn";
    button.type = "button";
    button.dataset.editType = type;
    button.dataset.editIndex = String(index);
    button.setAttribute("aria-label", `Edit ${label}`);
    button.title = `Edit ${label}`;
    button.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    `;
    return button;
  };

  const formatYears = (value) => `${value} Year${value === 1 ? "" : "s"}`;

  const animateCounter = (element, value, formatter) => {
    if (!element) return;
    const startValue = Number(element.dataset.countValue) || 0;
    const endValue = Number.isFinite(value) ? value : 0;
    const duration = 700;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const current = Math.round(startValue + (endValue - startValue) * progress);
      element.textContent = formatter ? formatter(current) : String(current);
      if (progress < 1) {
        window.requestAnimationFrame(tick);
      } else {
        element.dataset.countValue = String(endValue);
      }
    };

    window.requestAnimationFrame(tick);
  };

  const updateStats = () => {
    const systems = loadCollection(STORAGE.systems, []);
    const clients = loadCollection(STORAGE.clients, []);
    const history = loadHistory();

    const systemsCard = document.querySelector('[data-stat="systems"]');
    const clientsCard = document.querySelector('[data-stat="clients"]');
    const experienceCard = document.querySelector('[data-stat="experience"]');

    if (systemsCard) {
      const value = systems.length;
      const suffix = systemsCard.dataset.statSuffix || "";
      const target = systemsCard.querySelector("[data-stat-value]") || systemsCard.querySelector("h3");
      animateCounter(target, value, (current) => `${current}${suffix}`);
    }

    if (clientsCard) {
      const value = clients.length;
      const target = clientsCard.querySelector("[data-stat-value]") || clientsCard.querySelector("h3");
      animateCounter(target, value);
    }

    if (experienceCard) {
      const value = Number(history.years) || 0;
      const target = experienceCard.querySelector("[data-stat-value]") || experienceCard.querySelector("h3");
      animateCounter(target, value, formatYears);
    }
  };

  const setupStatsSync = () => {
    window.addEventListener("storage", (event) => {
      if (!event.key) return;
      if ([STORAGE.systems, STORAGE.clients, STORAGE.history].includes(event.key)) {
        updateStats();
      }
    });
  };

  const createProjectCard = (project, storageIndex) => {
    const card = document.createElement("article");
    card.className = "card glass reveal";
    card.dataset.projectIndex = String(storageIndex);

    if (project.featured) {
      card.classList.add("featured");
      const badge = document.createElement("span");
      badge.className = "featured-badge";
      badge.textContent = "Featured";
      card.appendChild(badge);
    }

    const title = document.createElement("h3");
    title.textContent = project.name;

    const description = document.createElement("p");
    description.textContent = project.description;

    const why = document.createElement("p");
    why.className = "card-why";
    why.textContent = project.impact
      ? `Why this matters: ${project.impact}`
      : "Why this matters: Demonstrates structured delivery and reliable UI flow.";

    const link = document.createElement("a");
    link.className = "link";
    link.href = project.repo;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "GitHub Repository";

    const meta = document.createElement("div");
    meta.className = "card-meta";
    const typePill = document.createElement("span");
    typePill.className = "meta-pill";
    typePill.textContent = project.type || "Other";
    meta.appendChild(typePill);
    const stackPill = document.createElement("span");
    stackPill.className = "meta-pill";
    stackPill.textContent = project.stack ? `Tech: ${project.stack}` : `Tech: ${project.type || "General"}`;
    meta.appendChild(stackPill);

    const session = getSession();
    if (isAdmin(session)) {
      card.classList.add("admin-card");
      if ((project.visibility || "public") === "private") {
        const visibilityPill = document.createElement("span");
        visibilityPill.className = "meta-pill";
        visibilityPill.textContent = "Private";
        meta.appendChild(visibilityPill);
      }
      card.appendChild(createFeatureButton("project", storageIndex, !!project.featured));
      card.appendChild(createDeleteButton("project", storageIndex, project.name));
    }

    card.append(title, description, why, link, meta);
    return card;
  };

  const getProjectFilters = () => {
    const query = document.querySelector("[data-project-search]")?.value.trim().toLowerCase() || "";
    const type = document.querySelector("[data-project-type]")?.value || "all";
    return { query, type };
  };

  const renderProjects = () => {
    const list = document.querySelector("[data-project-list]");
    if (!list) return;
    const emptyState = document.querySelector("[data-project-empty]");
    const loading = document.querySelector("[data-project-loading]");
    setLoadingState(loading, true);

    const projects = loadCollection(STORAGE.projects, []);
    const filters = getProjectFilters();
    const session = getSession();
    const adminView = isAdmin(session);
    const hasPublic = projects.some((project) => (project.visibility || "public") !== "private");
    const hasFilters = !!filters.query || (filters.type && filters.type !== "all");
    let entries = projects
      .map((project, index) => ({ project, index }))
      .filter(({ project }) => adminView || (project.visibility || "public") !== "private");

    if (filters.query) {
      entries = entries.filter(({ project }) => {
        const text = `${project.name || ""} ${project.description || ""} ${project.impact || ""} ${project.stack || ""}`.toLowerCase();
        return text.includes(filters.query);
      });
    }

    if (filters.type && filters.type !== "all") {
      entries = entries.filter(({ project }) => (project.type || "Other") === filters.type);
    }

    entries.sort(
      (a, b) =>
        Number(!!b.project.featured) - Number(!!a.project.featured) || a.index - b.index
    );

    list.innerHTML = "";

    if (!entries.length) {
      if (emptyState) {
        const heading = emptyState.querySelector("h3");
        const copy = emptyState.querySelector("p");
        if (projects.length === 0) {
          if (heading) heading.textContent = "No projects yet";
          if (copy) copy.textContent = "Upload a project to start building your Codexia grid.";
        } else if (!adminView && !hasPublic) {
          if (heading) heading.textContent = "No public projects yet";
          if (copy) copy.textContent = "Public projects will appear here once they are published.";
        } else if (hasFilters) {
          if (heading) heading.textContent = "No matching projects";
          if (copy) copy.textContent = "Try adjusting your search or filter settings.";
        } else {
          if (heading) heading.textContent = "No matching projects";
          if (copy) copy.textContent = "Try adjusting your search or filter settings.";
        }
        emptyState.classList.remove("hidden");
      }
    } else {
      if (emptyState) emptyState.classList.add("hidden");
      entries.forEach(({ project, index }) => {
        list.appendChild(createProjectCard(project, index));
      });
    }

    setupReveal();
    window.setTimeout(() => setLoadingState(loading, false), 120);
  };

  const renderFeaturedProjects = () => {
    const list = document.querySelector("[data-featured-list]");
    if (!list) return;
    const emptyState = document.querySelector("[data-featured-empty]");
    const loading = document.querySelector("[data-featured-loading]");
    setLoadingState(loading, true);

    const projects = loadCollection(STORAGE.projects, []);
    const session = getSession();
    const adminView = isAdmin(session);
    const entries = projects
      .map((project, index) => ({ project, index }))
      .filter(({ project }) => !!project.featured)
      .filter(({ project }) => adminView || (project.visibility || "public") !== "private");

    list.innerHTML = "";

    if (!entries.length) {
      if (emptyState) emptyState.classList.remove("hidden");
    } else {
      if (emptyState) emptyState.classList.add("hidden");
      entries.forEach(({ project, index }) => {
        list.appendChild(createProjectCard(project, index));
      });
    }

    setupReveal();
    window.setTimeout(() => setLoadingState(loading, false), 120);
  };

  const createSystemCard = (system, storageIndex) => {
    const card = document.createElement("article");
    card.className = "card glass reveal";
    card.dataset.systemIndex = String(storageIndex);

    const title = document.createElement("h3");
    title.textContent = system.name;

    const description = document.createElement("p");
    description.textContent = system.description;

    const link = document.createElement("a");
    link.className = "link";
    link.href = system.link;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Open System";

    const session = getSession();
    if (isAdmin(session)) {
      card.classList.add("admin-card");
      card.appendChild(createEditButton("system", storageIndex, system.name || "system"));
      card.appendChild(createDeleteButton("system", storageIndex, system.name || "system"));
    }

    card.append(title, description, link);
    return card;
  };

  const renderSystems = () => {
    const list = document.querySelector("[data-system-list]");
    if (!list) return;
    const emptyState = document.querySelector("[data-system-empty]");
    const loading = document.querySelector("[data-system-loading]");
    setLoadingState(loading, true);

    const systems = loadCollection(STORAGE.systems, []);
    list.innerHTML = "";

    if (!systems.length) {
      if (emptyState) emptyState.classList.remove("hidden");
    } else {
      if (emptyState) emptyState.classList.add("hidden");
      systems.forEach((system, index) => {
        list.appendChild(createSystemCard(system, index));
      });
    }

    setupReveal();
    window.setTimeout(() => setLoadingState(loading, false), 120);
  };

  const createClientCard = (client, storageIndex) => {
    const card = document.createElement("article");
    card.className = "card glass reveal";
    card.dataset.clientIndex = String(storageIndex);

    if (client.logoData) {
      const logo = document.createElement("img");
      logo.className = "client-logo";
      logo.src = client.logoData;
      logo.alt = `${client.name} logo`;
      card.appendChild(logo);
    }

    const title = document.createElement("h3");
    title.textContent = client.name;

    const company = document.createElement("p");
    company.textContent = client.company;

    const session = getSession();
    if (isAdmin(session)) {
      card.classList.add("admin-card");
      card.appendChild(createEditButton("client", storageIndex, client.name || "client"));
      card.appendChild(createDeleteButton("client", storageIndex, client.name || "client"));
    }

    card.append(title, company);
    return card;
  };

  const renderClients = () => {
    const list = document.querySelector("[data-client-list]");
    if (!list) return;
    const emptyState = document.querySelector("[data-client-empty]");
    const loading = document.querySelector("[data-client-loading]");
    setLoadingState(loading, true);

    const clients = loadCollection(STORAGE.clients, []);
    list.innerHTML = "";

    if (!clients.length) {
      if (emptyState) emptyState.classList.remove("hidden");
    } else {
      if (emptyState) emptyState.classList.add("hidden");
      clients.forEach((client, index) => {
        list.appendChild(createClientCard(client, index));
      });
    }

    setupReveal();
    window.setTimeout(() => setLoadingState(loading, false), 120);
  };

  const openSystemModal = (system = null, index = null) => {
    const modal = document.querySelector('[data-modal="system-upload"]');
    if (!modal) return;
    const form = modal.querySelector("[data-system-form]");
    if (!form) return;
    const title = modal.querySelector("[data-system-modal-title]");
    const submit = modal.querySelector("[data-system-submit]");
    const message = modal.querySelector("[data-system-message]");

    form.querySelector('[name="name"]').value = system?.name || "";
    form.querySelector('[name="description"]').value = system?.description || "";
    form.querySelector('[name="link"]').value = system?.link || "";

    if (index !== null && index !== undefined) {
      form.dataset.editIndex = String(index);
      if (title) title.textContent = "Edit System";
      if (submit) submit.textContent = "Save Changes";
    } else {
      delete form.dataset.editIndex;
      if (title) title.textContent = "Add System";
      if (submit) submit.textContent = "Add System";
    }
    if (message) showMessage(message, "", "info");
    showModal(modal);
  };

  const openClientModal = (client = null, index = null) => {
    const modal = document.querySelector('[data-modal="client-upload"]');
    if (!modal) return;
    const form = modal.querySelector("[data-client-form]");
    if (!form) return;
    const title = modal.querySelector("[data-client-modal-title]");
    const submit = modal.querySelector("[data-client-submit]");
    const message = modal.querySelector("[data-client-message]");
    const logoInput = form.querySelector('[name="logo"]');

    form.querySelector('[name="name"]').value = client?.name || "";
    form.querySelector('[name="company"]').value = client?.company || "";
    if (logoInput) logoInput.value = "";

    if (index !== null && index !== undefined) {
      form.dataset.editIndex = String(index);
      if (title) title.textContent = "Edit Client";
      if (submit) submit.textContent = "Save Changes";
    } else {
      delete form.dataset.editIndex;
      if (title) title.textContent = "Add Client";
      if (submit) submit.textContent = "Add Client";
    }
    if (message) showMessage(message, "", "info");
    showModal(modal);
  };

  const renderSpecsSection = (list, specs, type, isEditable) => {
    if (!list) return;
    list.innerHTML = "";
    specs.forEach((spec, index) => {
      const card = document.createElement("article");
      card.className = "card glass reveal";

      const title = document.createElement("h3");
      title.textContent = spec.label;
      card.appendChild(title);

      if (isEditable) {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "input spec-input";
        input.value = spec.value;
        input.dataset.specType = type;
        input.dataset.specIndex = String(index);
        card.appendChild(input);
      } else {
        const value = document.createElement("p");
        value.className = "spec-value";
        value.textContent = spec.value;
        card.appendChild(value);
      }

      list.appendChild(card);
    });
  };

  const renderSpecsPage = () => {
    if (document.body.dataset.page !== "setup") return;
    const specs = loadSpecs();
    const session = getSession();
    const isEditable = isAdmin(session);
    renderSpecsSection(document.querySelector("[data-specs-laptop]"), specs.laptop, "laptop", isEditable);
    renderSpecsSection(document.querySelector("[data-specs-mobile]"), specs.mobile, "mobile", isEditable);
    setupReveal();
  };

  const setupSpecsEditor = () => {
    if (document.body.dataset.page !== "setup") return;
    const persistSpecInput = (input) => {
      const session = getSession();
      if (!isAdmin(session)) return;
      const type = input.dataset.specType;
      const index = Number(input.dataset.specIndex);
      if (!type || Number.isNaN(index)) return;
      const specs = loadSpecs();
      if (!Array.isArray(specs[type]) || !specs[type][index]) return;
      specs[type][index] = { ...specs[type][index], value: input.value };
      saveSpecs(specs);
    };

    document.addEventListener("input", (event) => {
      const input = event.target.closest(".spec-input");
      if (!input) return;
      persistSpecInput(input);
    });

    document.addEventListener("change", (event) => {
      const input = event.target.closest(".spec-input");
      if (!input) return;
      persistSpecInput(input);
    });

    document.addEventListener("focusout", (event) => {
      const input = event.target.closest(".spec-input");
      if (!input) return;
      persistSpecInput(input);
    });

    window.addEventListener("beforeunload", () => {
      const session = getSession();
      if (!isAdmin(session)) return;
      const specs = loadSpecs();
      document.querySelectorAll(".spec-input").forEach((input) => {
        const type = input.dataset.specType;
        const index = Number(input.dataset.specIndex);
        if (!type || Number.isNaN(index)) return;
        if (!Array.isArray(specs[type]) || !specs[type][index]) return;
        specs[type][index] = { ...specs[type][index], value: input.value };
      });
      saveSpecs(specs);
    });
  };

  const setupSystemForm = () => {
    const form = document.querySelector("[data-system-form]");
    if (!form) return;
    const message = document.querySelector("[data-system-message]");

    document.querySelectorAll('[data-open-modal="system-upload"]').forEach((btn) => {
      btn.addEventListener("click", () => openSystemModal());
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = form.querySelector('[name="name"]').value.trim();
      const description = form.querySelector('[name="description"]').value.trim();
      const link = form.querySelector('[name="link"]').value.trim();
      if (!name || !description || !link) {
        showMessage(message, "Please complete all fields.", "error");
        showToast("Please complete all fields.", "error");
        return;
      }

      const systems = loadCollection(STORAGE.systems, []);
      const editIndex = form.dataset.editIndex ? Number(form.dataset.editIndex) : null;
      const entry = {
        name,
        description,
        link,
        createdAt: editIndex !== null && systems[editIndex]?.createdAt ? systems[editIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editIndex !== null && !Number.isNaN(editIndex)) {
        systems[editIndex] = entry;
        logUpdate(`System: ${name}`);
        showToast("System updated.", "success");
      } else {
        systems.unshift(entry);
        logUpload(`System: ${name}`);
        showToast("System added.", "success");
      }

      saveCollection(STORAGE.systems, systems);
      renderSystems();
      updateStats();
      form.reset();
      delete form.dataset.editIndex;
      hideModal(document.querySelector('[data-modal="system-upload"]'));
    });
  };

  const setupClientForm = () => {
    const form = document.querySelector("[data-client-form]");
    if (!form) return;
    const message = document.querySelector("[data-client-message]");
    const logoInput = form.querySelector('[name="logo"]');

    document.querySelectorAll('[data-open-modal="client-upload"]').forEach((btn) => {
      btn.addEventListener("click", () => openClientModal());
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = form.querySelector('[name="name"]').value.trim();
      const company = form.querySelector('[name="company"]').value.trim();
      const file = logoInput?.files?.[0];

      if (!name || !company) {
        showMessage(message, "Please complete all fields.", "error");
        showToast("Please complete all fields.", "error");
        return;
      }

      const clients = loadCollection(STORAGE.clients, []);
      const editIndex = form.dataset.editIndex ? Number(form.dataset.editIndex) : null;
      const existing = editIndex !== null && clients[editIndex] ? clients[editIndex] : null;

      const finalize = (logoData = existing?.logoData || "", logoName = existing?.logoName || "") => {
        if (!logoData && !existing && !file) {
          showMessage(message, "Please upload a logo.", "error");
          showToast("Please upload a logo.", "error");
          return;
        }

        const entry = {
          name,
          company,
          logoData,
          logoName,
          createdAt: existing?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (editIndex !== null && !Number.isNaN(editIndex)) {
          clients[editIndex] = entry;
          logUpdate(`Client: ${name}`);
          showToast("Client updated.", "success");
        } else {
          clients.unshift(entry);
          logUpload(`Client: ${name}`);
          showToast("Client added.", "success");
        }

        saveCollection(STORAGE.clients, clients);
        renderClients();
        updateStats();
        form.reset();
        delete form.dataset.editIndex;
        hideModal(document.querySelector('[data-modal="client-upload"]'));
      };

      if (file) {
        const reader = new FileReader();
        reader.onload = () => finalize(reader.result, file.name);
        reader.onerror = () => {
          showMessage(message, "Unable to read the file. Try again.", "error");
          showToast("Unable to read the file. Try again.", "error");
        };
        reader.readAsDataURL(file);
        return;
      }

      finalize();
    });
  };

  const setupHistoryPage = () => {
    if (document.body.dataset.page !== "history") return;
    const essayEl = document.querySelector("[data-history-essay]");
    const yearsEl = document.querySelector("[data-history-years]");
    const emptyState = document.querySelector("[data-history-empty]");
    const milestoneWrap = document.querySelector("[data-history-milestones]");
    const yearInput = document.querySelector("[data-history-years-input]");
    const essayInput = document.querySelector("[data-history-essay-input]");

    const render = () => {
      const history = loadHistory();
      if (yearsEl) yearsEl.textContent = formatYears(Number(history.years) || 0);
      if (essayEl) essayEl.textContent = history.essay || "";
      if (emptyState) {
        if (!history.essay) {
          emptyState.classList.remove("hidden");
        } else {
          emptyState.classList.add("hidden");
        }
      }
      if (milestoneWrap) {
        const milestones = Array.isArray(history.milestones) ? history.milestones : [];
        milestoneWrap.innerHTML = milestones
          .map(
            (milestone) => `
              <div class="card glass reveal">
                <h3>${milestone.title || "Milestone"}</h3>
                <p>${milestone.detail || ""}</p>
              </div>
            `
          )
          .join("");
      }
      if (yearInput) yearInput.value = history.years;
      if (essayInput) essayInput.value = history.essay;
    };

    render();
    setupReveal();

    const session = getSession();
    if (!isAdmin(session)) return;

    if (yearInput) {
      yearInput.addEventListener("input", () => {
        const history = loadHistory();
        history.years = Number(yearInput.value) || 0;
        saveHistory(history);
        render();
        updateStats();
      });
    }

    if (essayInput) {
      essayInput.addEventListener("input", () => {
        const history = loadHistory();
        history.essay = essayInput.value.trim();
        saveHistory(history);
        if (essayEl) essayEl.textContent = history.essay || "";
        if (emptyState) {
          if (!history.essay) {
            emptyState.classList.remove("hidden");
          } else {
            emptyState.classList.add("hidden");
          }
        }
      });
    }
  };

  const setupProjectFilters = () => {
    const search = document.querySelector("[data-project-search]");
    const type = document.querySelector("[data-project-type]");
    if (search) search.addEventListener("input", renderProjects);
    if (type) type.addEventListener("change", renderProjects);
  };

  const setupProjectUpload = () => {
    const form = document.querySelector("[data-project-form]");
    if (!form) return;
    const message = document.querySelector("[data-project-message]");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const session = getSession();
      const name = form.querySelector('[name="name"]').value.trim();
      const description = form.querySelector('[name="description"]').value.trim();
      const impact = form.querySelector('[name="impact"]')?.value.trim();
      const stack = form.querySelector('[name="stack"]')?.value.trim();
      const type = form.querySelector('[name="type"]')?.value || "Other";
      const repo = form.querySelector('[name="repo"]').value.trim();
      const featured = !!form.querySelector('[name="featured"]')?.checked;
      const visibility = isAdmin(session)
        ? loadPrefs(session.loggedInUser).admin?.defaultUploadVisibility || "public"
        : "public";

      if (!name || !description || !repo || !impact || !stack) {
        showMessage(message, "Please complete all fields.", "error");
        showToast("Please complete all fields.", "error");
        return;
      }

      if (!repo.includes("github.com")) {
        showMessage(message, "Please enter a valid GitHub repository URL.", "error");
        showToast("Please enter a valid GitHub repository URL.", "error");
        return;
      }

      const projects = loadCollection(STORAGE.projects, []);
      projects.unshift({
        name,
        description,
        impact,
        stack,
        repo,
        type,
        featured,
        visibility,
        createdAt: new Date().toISOString(),
      });
      saveCollection(STORAGE.projects, projects);
      renderProjects();
      logUpload(`Project: ${name}`);
      showMessage(message, "Project uploaded.", "success");
      showToast("Project uploaded.", "success");
      form.reset();
      setTimeout(() => {
        hideModal(document.querySelector('[data-modal="project-upload"]'));
        showMessage(message, "", "info");
      }, 500);
    });
  };

  const createTemplateCard = (template, storageIndex) => {
    const card = document.createElement("article");
    card.className = "card glass reveal";
    card.dataset.templateIndex = String(storageIndex);

    if (template.featured) {
      card.classList.add("featured");
      const badge = document.createElement("span");
      badge.className = "featured-badge";
      badge.textContent = "Featured";
      card.appendChild(badge);
    }

    const title = document.createElement("h3");
    title.textContent = template.name;

    const description = document.createElement("p");
    description.textContent = template.description;

    const meta = document.createElement("p");
    meta.className = "template-meta";
    meta.textContent = template.fileUrl ? "Source: Google Drive" : "No link attached";

    const metaRow = document.createElement("div");
    metaRow.className = "card-meta";
    const typePill = document.createElement("span");
    typePill.className = "meta-pill";
    typePill.textContent = template.type || "Other";
    metaRow.appendChild(typePill);
    const pricing = template.pricing || "free";
    const priceLabel =
      pricing === "paid" && template.price
        ? `Paid • ${CONFIG.currencyLabel}${template.price}`
        : pricing === "paid"
        ? "Paid"
        : "Free";
    const pricePill = document.createElement("span");
    pricePill.className = "meta-pill price";
    pricePill.textContent = priceLabel;
    metaRow.appendChild(pricePill);

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const purchase = document.createElement("button");
    purchase.className = "btn btn-outline";
    purchase.type = "button";
    purchase.dataset.templatePurchase = template.name;
    purchase.textContent = "Purchase";

    actions.appendChild(purchase);

    const session = getSession();
    if (isAdmin(session)) {
      card.classList.add("admin-card");
      if ((template.visibility || "public") === "private") {
        const visibilityPill = document.createElement("span");
        visibilityPill.className = "meta-pill";
        visibilityPill.textContent = "Private";
        metaRow.appendChild(visibilityPill);
      }
      card.appendChild(createFeatureButton("template", storageIndex, !!template.featured));
      card.appendChild(createDeleteButton("template", storageIndex, template.name));
    }

    if (template.fileUrl) {
      const download = document.createElement("a");
      download.className = "link";
      download.href = template.fileUrl;
      download.target = "_blank";
      download.rel = "noopener";
      download.textContent = "Open Template";
      actions.appendChild(download);
    }

    card.append(title, description, meta, metaRow, actions);
    return card;
  };

  const getTemplateFilters = () => {
    const query = document.querySelector("[data-template-search]")?.value.trim().toLowerCase() || "";
    const type = document.querySelector("[data-template-type]")?.value || "all";
    const pricing = document.querySelector("[data-template-price]")?.value || "all";
    return { query, type, pricing };
  };

  const renderTemplates = () => {
    const list = document.querySelector("[data-template-list]");
    if (!list) return;
    const emptyState = document.querySelector("[data-template-empty]");
    const loading = document.querySelector("[data-template-loading]");
    setLoadingState(loading, true);

    const templates = loadCollection(STORAGE.templates, []);
    const filters = getTemplateFilters();
    const session = getSession();
    const adminView = isAdmin(session);
    const hasPublic = templates.some((template) => (template.visibility || "public") !== "private");
    const hasFilters =
      !!filters.query || (filters.type && filters.type !== "all") || (filters.pricing && filters.pricing !== "all");
    let entries = templates
      .map((template, index) => ({ template, index }))
      .filter(({ template }) => adminView || (template.visibility || "public") !== "private");

    if (filters.query) {
      entries = entries.filter(({ template }) => {
        const text = `${template.name || ""} ${template.description || ""}`.toLowerCase();
        return text.includes(filters.query);
      });
    }

    if (filters.type && filters.type !== "all") {
      entries = entries.filter(({ template }) => (template.type || "Other") === filters.type);
    }

    if (filters.pricing && filters.pricing !== "all") {
      entries = entries.filter(({ template }) => (template.pricing || "free") === filters.pricing);
    }

    entries.sort(
      (a, b) =>
        Number(!!b.template.featured) - Number(!!a.template.featured) || a.index - b.index
    );

    list.innerHTML = "";

    if (!entries.length) {
      if (emptyState) {
        const heading = emptyState.querySelector("h3");
        const copy = emptyState.querySelector("p");
        if (templates.length === 0) {
          if (heading) heading.textContent = "No templates available yet";
          if (copy) copy.textContent = "Owner uploads will appear here once the vault is populated.";
        } else if (!adminView && !hasPublic) {
          if (heading) heading.textContent = "No public templates yet";
          if (copy) copy.textContent = "Templates will appear here once they are published.";
        } else if (hasFilters) {
          if (heading) heading.textContent = "No matching templates";
          if (copy) copy.textContent = "Try adjusting your search or filter settings.";
        } else {
          if (heading) heading.textContent = "No matching templates";
          if (copy) copy.textContent = "Try adjusting your search or filter settings.";
        }
        emptyState.classList.remove("hidden");
      }
    } else {
      if (emptyState) emptyState.classList.add("hidden");
      entries.forEach(({ template, index }) => {
        list.appendChild(createTemplateCard(template, index));
      });
    }

    setupReveal();
    window.setTimeout(() => setLoadingState(loading, false), 120);
  };

  const setupTemplateFilters = () => {
    const search = document.querySelector("[data-template-search]");
    const type = document.querySelector("[data-template-type]");
    const pricing = document.querySelector("[data-template-price]");
    if (search) search.addEventListener("input", renderTemplates);
    if (type) type.addEventListener("change", renderTemplates);
    if (pricing) pricing.addEventListener("change", renderTemplates);
  };

  const openConfirmModal = ({ entity }) => {
    const modal = document.querySelector('[data-modal="confirm-delete"]');
    if (!modal) return;
    const message = modal.querySelector("[data-confirm-message]");
    if (message) {
      message.textContent = `Are you sure you want to delete this ${entity}?`;
    }
    showModal(modal);
  };

  const handleDelete = () => {
    const session = getSession();
    if (!pendingDelete || !isAdmin(session)) {
      pendingDelete = null;
      return;
    }
    const { type, index, name } = pendingDelete;
    pendingDelete = null;

    const performDelete = () => {
      if (type === "project") {
        const list = document.querySelector("[data-project-list]");
        const card = list?.querySelector(`[data-project-index="${index}"]`);
        if (card) card.classList.add("removing");
        window.setTimeout(() => {
          const projects = loadCollection(STORAGE.projects, []);
          const [removed] = projects.splice(index, 1);
          saveCollection(STORAGE.projects, projects);
          renderProjects();
          renderFeaturedProjects();
          logDelete(`Project: ${name}`);
          showToast("Project deleted.", "success", {
            actionLabel: "Undo",
            duration: 5000,
            onAction: () => {
              const restored = loadCollection(STORAGE.projects, []);
              const insertAt = Math.min(index, restored.length);
              restored.splice(insertAt, 0, removed);
              saveCollection(STORAGE.projects, restored);
              renderProjects();
              renderFeaturedProjects();
              logRestore(`Project: ${removed?.name || name}`);
              showToast("Project restored.", "success");
            },
          });
        }, 260);
      }

      if (type === "template") {
        const list = document.querySelector("[data-template-list]");
        const card = list?.querySelector(`[data-template-index="${index}"]`);
        if (card) card.classList.add("removing");
        window.setTimeout(() => {
          const templates = loadCollection(STORAGE.templates, []);
          const [removed] = templates.splice(index, 1);
          saveCollection(STORAGE.templates, templates);
          renderTemplates();
          logDelete(`Template: ${name}`);
          showToast("Template deleted.", "success", {
            actionLabel: "Undo",
            duration: 5000,
            onAction: () => {
              const restored = loadCollection(STORAGE.templates, []);
              const insertAt = Math.min(index, restored.length);
              restored.splice(insertAt, 0, removed);
              saveCollection(STORAGE.templates, restored);
              renderTemplates();
              logRestore(`Template: ${removed?.name || name}`);
              showToast("Template restored.", "success");
            },
          });
        }, 260);
      }

      if (type === "system") {
        const list = document.querySelector("[data-system-list]");
        const card = list?.querySelector(`[data-system-index="${index}"]`);
        if (card) card.classList.add("removing");
        window.setTimeout(() => {
          const systems = loadCollection(STORAGE.systems, []);
          const [removed] = systems.splice(index, 1);
          saveCollection(STORAGE.systems, systems);
          renderSystems();
          updateStats();
          logDelete(`System: ${name}`);
          showToast("System deleted.", "success", {
            actionLabel: "Undo",
            duration: 5000,
            onAction: () => {
              const restored = loadCollection(STORAGE.systems, []);
              const insertAt = Math.min(index, restored.length);
              restored.splice(insertAt, 0, removed);
              saveCollection(STORAGE.systems, restored);
              renderSystems();
              updateStats();
              logRestore(`System: ${removed?.name || name}`);
              showToast("System restored.", "success");
            },
          });
        }, 260);
      }

      if (type === "client") {
        const list = document.querySelector("[data-client-list]");
        const card = list?.querySelector(`[data-client-index="${index}"]`);
        if (card) card.classList.add("removing");
        window.setTimeout(() => {
          const clients = loadCollection(STORAGE.clients, []);
          const [removed] = clients.splice(index, 1);
          saveCollection(STORAGE.clients, clients);
          renderClients();
          updateStats();
          logDelete(`Client: ${name}`);
          showToast("Client deleted.", "success", {
            actionLabel: "Undo",
            duration: 5000,
            onAction: () => {
              const restored = loadCollection(STORAGE.clients, []);
              const insertAt = Math.min(index, restored.length);
              restored.splice(insertAt, 0, removed);
              saveCollection(STORAGE.clients, restored);
              renderClients();
              updateStats();
              logRestore(`Client: ${removed?.name || name}`);
              showToast("Client restored.", "success");
            },
          });
        }, 260);
      }
    };

    performDelete();
    hideModal(document.querySelector('[data-modal="confirm-delete"]'));
  };

  const setupDeleteActions = () => {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-delete-type]");
      if (!button) return;
      const session = getSession();
      if (!isAdmin(session)) return;
      const type = button.dataset.deleteType;
      const index = Number(button.dataset.deleteIndex);
      if (Number.isNaN(index)) return;

      if (type === "project") {
        const projects = loadCollection(STORAGE.projects, []);
        const name = projects[index]?.name || "project";
        openConfirmModal({ entity: "project" });
        pendingDelete = { type, index, name };
      }

      if (type === "template") {
        const templates = loadCollection(STORAGE.templates, []);
        const name = templates[index]?.name || "template";
        openConfirmModal({ entity: "template" });
        pendingDelete = { type, index, name };
      }

      if (type === "system") {
        const systems = loadCollection(STORAGE.systems, []);
        const name = systems[index]?.name || "system";
        openConfirmModal({ entity: "system" });
        pendingDelete = { type, index, name };
      }

      if (type === "client") {
        const clients = loadCollection(STORAGE.clients, []);
        const name = clients[index]?.name || "client";
        openConfirmModal({ entity: "client" });
        pendingDelete = { type, index, name };
      }
    });

    const modal = document.querySelector('[data-modal="confirm-delete"]');
    if (!modal) return;
    const approve = modal.querySelector("[data-confirm-approve]");
    const cancel = modal.querySelector("[data-confirm-cancel]");

    if (approve) approve.addEventListener("click", handleDelete);
    if (cancel) cancel.addEventListener("click", () => hideModal(modal));
  };

  const setupEditActions = () => {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-edit-type]");
      if (!button) return;
      const session = getSession();
      if (!isAdmin(session)) return;
      const type = button.dataset.editType;
      const index = Number(button.dataset.editIndex);
      if (Number.isNaN(index)) return;

      if (type === "system") {
        const systems = loadCollection(STORAGE.systems, []);
        const target = systems[index];
        if (!target) return;
        openSystemModal(target, index);
      }

      if (type === "client") {
        const clients = loadCollection(STORAGE.clients, []);
        const target = clients[index];
        if (!target) return;
        openClientModal(target, index);
      }
    });
  };

  const setupFeatureToggle = () => {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-feature-type]");
      if (!button) return;
      const session = getSession();
      if (!isAdmin(session)) return;
      const type = button.dataset.featureType;
      const index = Number(button.dataset.featureIndex);
      if (Number.isNaN(index)) return;

      if (type === "project") {
        const projects = loadCollection(STORAGE.projects, []);
        const target = projects[index];
        if (!target) return;
        target.featured = !target.featured;
        projects[index] = target;
        saveCollection(STORAGE.projects, projects);
        renderProjects();
        renderFeaturedProjects();
        logFeatureToggle(`Project: ${target.name}`, target.featured);
        showToast(target.featured ? "Project featured." : "Project unfeatured.", "success");
      }

      if (type === "template") {
        const templates = loadCollection(STORAGE.templates, []);
        const target = templates[index];
        if (!target) return;
        target.featured = !target.featured;
        templates[index] = target;
        saveCollection(STORAGE.templates, templates);
        renderTemplates();
        logFeatureToggle(`Template: ${target.name}`, target.featured);
        showToast(target.featured ? "Template featured." : "Template unfeatured.", "success");
      }
    });
  };

  const renderAdminLogsPage = () => {
    const list = document.querySelector("[data-log-list]");
    if (!list) return;
    const loading = document.querySelector("[data-log-loading]");
    setLoadingState(loading, true);
    const filter = document.querySelector("[data-log-filter]");
    const sort = document.querySelector("[data-log-sort]");
    const logs = getAdminLogs();
    const activity = Array.isArray(logs.activities) ? logs.activities : [];
    const filterValue = filter?.value || "all";
    const sortValue = sort?.value || "newest";

    let entries = [...activity];
    if (filterValue !== "all") {
      entries = entries.filter((entry) => entry.type === filterValue);
    }
    if (sortValue === "oldest") {
      entries = entries.slice().reverse();
    }

    if (!entries.length) {
      list.innerHTML = '<div class="log-empty">No logs available yet.</div>';
      window.setTimeout(() => setLoadingState(loading, false), 120);
      return;
    }

    list.innerHTML = entries
      .map((entry) => {
        const time = entry.time ? new Date(entry.time).toLocaleString() : "--";
        const email = entry.email || "System";
        const message = entry.message || "Activity";
        const type = entry.type || "event";
        return `
          <div class="log-row reveal">
            <span><strong>${time}</strong></span>
            <span>${email}</span>
            <span>${message}</span>
            <span class="log-type">${type}</span>
          </div>
        `;
      })
      .join("");
    setupReveal();
    window.setTimeout(() => setLoadingState(loading, false), 120);
  };

  const setupAdminLogsPage = () => {
    const page = document.body.dataset.page;
    if (page !== "logs") return;
    const filter = document.querySelector("[data-log-filter]");
    const sort = document.querySelector("[data-log-sort]");
    if (filter) filter.addEventListener("change", renderAdminLogsPage);
    if (sort) sort.addEventListener("change", renderAdminLogsPage);
    renderAdminLogsPage();
  };

  const setupTemplateUpload = () => {
    const form = document.querySelector("[data-template-form]");
    if (!form) return;
    const message = document.querySelector("[data-template-message]");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const session = getSession();
      const name = form.querySelector('[name="name"]').value.trim();
      const description = form.querySelector('[name="description"]').value.trim();
      const type = form.querySelector('[name="type"]')?.value || "Other";
      const pricing = form.querySelector('[name="pricing"]')?.value || "free";
      const priceValue = form.querySelector('[name="price"]')?.value || "";
      const featured = !!form.querySelector('[name="featured"]')?.checked;
      const fileUrl = form.querySelector('[name="fileUrl"]')?.value.trim();
      const visibility = isAdmin(session)
        ? loadPrefs(session.loggedInUser).admin?.defaultUploadVisibility || "public"
        : "public";

      if (!name || !description || !fileUrl) {
        showMessage(message, "Please complete all fields and attach a Google Drive link.", "error");
        showToast("Please complete all fields and attach a Google Drive link.", "error");
        return;
      }

      if (!fileUrl.includes("drive.google.com")) {
        showMessage(message, "Please enter a valid Google Drive link.", "error");
        showToast("Please enter a valid Google Drive link.", "error");
        return;
      }

      showMessage(message, "Saving template...", "info");
      showToast("Saving template...", "success", { duration: 2000 });
      const templates = loadCollection(STORAGE.templates, []);
      const price = pricing === "paid" ? Number(priceValue || 0) : 0;
      templates.unshift({
        name,
        description,
        fileUrl,
        type,
        pricing,
        price,
        featured,
        visibility,
        createdAt: new Date().toISOString(),
      });
      saveCollection(STORAGE.templates, templates);
      renderTemplates();
      logUpload(`Template: ${name}`);
      showMessage(message, "Template uploaded.", "success");
      showToast("Template uploaded.", "success");
      form.reset();
      setTimeout(() => {
        hideModal(document.querySelector('[data-modal="template-upload"]'));
        showMessage(message, "", "info");
      }, 600);
    });
  };

  const setupTemplatePurchases = () => {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-template-purchase]");
      if (!button) return;
      if (isExplorerMode()) {
        showToast("Template purchases are unavailable in Explorer Mode.", "error");
        showExplorerModal(true);
        return;
      }
      const name = button.dataset.templatePurchase || "Template";
      logPurchase(name);
      showToast("Purchase recorded.", "success");
    });
  };

  const setupContactForms = () => {
    document.querySelectorAll("[data-contact-form]").forEach((form) => {
      const message = form.querySelector("[data-contact-message]");
      form.addEventListener("submit", (event) => {
        if (isExplorerMode()) {
          event.preventDefault();
          showMessage(message, "Contact form is available only inside Bangladesh.", "error");
          showToast("Contact is restricted in Explorer Mode.", "error");
          return;
        }
        if (!form.checkValidity()) {
          event.preventDefault();
          form.reportValidity();
          showMessage(message, "Please complete all fields.", "error");
          showToast("Please complete all fields.", "error");
          return;
        }
        showMessage(message, "Opening your email client...", "success");
        showToast("Opening your email client...", "success");
      });
    });
  };

  const setupLogin = () => {
    const form = document.querySelector("[data-login-form]");
    if (!form) return;
    const message = document.querySelector("[data-login-message]");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (isExplorerMode()) {
        showMessage(message, "Login is unavailable in Explorer Mode.", "error");
        showExplorerModal(true);
        return;
      }
      const email = form.querySelector('[name="email"]').value.trim().toLowerCase();
      const password = form.querySelector('[name="password"]').value;
      const users = loadUsers();

      if (!users[email]) {
        showMessage(message, "Account not found. Please sign up.", "error");
        return;
      }

      if (users[email].password !== password) {
        showMessage(message, "Incorrect password.", "error");
        return;
      }

      const session = {
        loggedInUser: email,
        role: users[email].role,
        loginAt: new Date().toISOString(),
      };
      setSession(session);
      showMessage(message, "Access granted. Redirecting...", "success");

      setTimeout(() => {
        window.location.href = isAdmin(session) ? "template.html" : "index.html";
      }, 600);
    });
  };

  const openOtpModal = () => {
    const modal = document.querySelector("[data-otp-modal]");
    showModal(modal);
  };

  const closeOtpModal = () => {
    const modal = document.querySelector("[data-otp-modal]");
    hideModal(modal);
  };

  const hashOtp = async (otp) => {
    if (!otp) return "";
    if (window.crypto?.subtle && window.TextEncoder) {
      const encoded = new TextEncoder().encode(otp);
      const digest = await window.crypto.subtle.digest("SHA-256", encoded);
      return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    }
    return btoa(otp);
  };

  const getEmailJsConfig = () => {
    const override = window.Codexia_EMAILJS || window.CYBRLY_EMAILJS || {};
    return {
      publicKey: override.publicKey || CONFIG.emailjsPublicKey,
      serviceId: override.serviceId || CONFIG.emailjsServiceId,
      templateId: override.templateId || CONFIG.emailjsTemplateId,
    };
  };

  let emailJsInitialized = false;

  const sendOtpEmail = async (email, otp) => {
    const config = getEmailJsConfig();
    if (!config.publicKey || !config.serviceId || !config.templateId) {
      throw new Error("OTP email service is not configured.");
    }
    if (!window.emailjs || typeof window.emailjs.send !== "function") {
      throw new Error("EmailJS SDK is missing.");
    }

    if (!emailJsInitialized) {
      window.emailjs.init({ publicKey: config.publicKey });
      emailJsInitialized = true;
    }

    await window.emailjs.send(config.serviceId, config.templateId, {
      to_email: email,
      user_email: email,
      otp: otp,
      otp_code: otp,
    });
  };

  const setupSignup = () => {
    const form = document.querySelector("[data-signup-form]");
    if (!form) return;

    const message = document.querySelector("[data-signup-message]");
    const modal = document.querySelector("[data-otp-modal]");
    const otpInput = document.querySelector("[data-otp-input]");
    const otpVerify = document.querySelector("[data-otp-verify]");
    const otpMessage = document.querySelector("[data-otp-message]");
    const closeBtn = document.querySelector("[data-otp-close]");

    if (closeBtn) {
      closeBtn.addEventListener("click", closeOtpModal);
    }

    if (modal) {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) closeOtpModal();
      });
    }

    const pending = safeParse(localStorage.getItem(STORAGE.pendingOtp), null);
    if (pending?.email) {
      showMessage(otpMessage, "A verification request is pending. Enter your OTP.", "info");
      openOtpModal();
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (isExplorerMode()) {
        showMessage(message, "Registration is unavailable in Explorer Mode.", "error");
        showExplorerModal(true);
        return;
      }
      const email = form.querySelector('[name="email"]').value.trim().toLowerCase();
      const password = form.querySelector('[name="password"]').value;
      const confirm = form.querySelector('[name="confirm"]').value;
      const users = loadUsers();

      if (!email || !password || !confirm) {
        showMessage(message, "Please complete all fields.", "error");
        return;
      }

      if (email === CONFIG.adminEmail) {
        showMessage(message, "This email is reserved for the Owner account.", "error");
        return;
      }

      if (password !== confirm) {
        showMessage(message, "Passwords do not match.", "error");
        return;
      }

      if (users[email]) {
        showMessage(message, "Account already exists. Login instead.", "error");
        return;
      }

      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const otpHash = await hashOtp(otp);
      const pendingRecord = {
        email,
        password,
        otpHash,
        createdAt: new Date().toISOString(),
      };

      showMessage(message, "Sending OTP to your email...", "info");
      try {
        await sendOtpEmail(email, otp);
      } catch (error) {
        showMessage(message, "Unable to send OTP email. Check EmailJS configuration.", "error");
        showMessage(otpMessage, "OTP email delivery failed. Please retry signup.", "error");
        return;
      }

      localStorage.setItem(STORAGE.pendingOtp, JSON.stringify(pendingRecord));
      if (otpInput) otpInput.value = "";
      showMessage(message, "OTP sent. Verify to activate your account.", "success");
      showMessage(otpMessage, "Enter the OTP sent to your email.", "info");
      openOtpModal();
    });

    if (otpVerify) {
      otpVerify.addEventListener("click", async () => {
        const pendingRecord = safeParse(localStorage.getItem(STORAGE.pendingOtp), null);
        if (!pendingRecord) {
          showMessage(otpMessage, "No pending verification.", "error");
          return;
        }

        const entered = (otpInput?.value || "").trim();
        if (!entered) {
          showMessage(otpMessage, "Enter the OTP first.", "error");
          return;
        }

        const issuedAt = new Date(pendingRecord.createdAt || 0).getTime();
        if (Number.isFinite(issuedAt) && Date.now() - issuedAt > 10 * 60 * 1000) {
          localStorage.removeItem(STORAGE.pendingOtp);
          showMessage(otpMessage, "OTP expired. Please sign up again.", "error");
          return;
        }

        const enteredHash = await hashOtp(entered);
        const valid =
          (pendingRecord.otpHash && enteredHash === pendingRecord.otpHash) ||
          (pendingRecord.otp && entered === pendingRecord.otp);

        if (!valid) {
          showMessage(otpMessage, "Invalid OTP.", "error");
          return;
        }

        const users = loadUsers();
        users[pendingRecord.email] = {
          password: pendingRecord.password,
          role: "user",
          createdAt: new Date().toISOString(),
          themePreference: "dark",
        };
        saveUsers(users);
        localStorage.removeItem(STORAGE.pendingOtp);
        showMessage(otpMessage, "Verified. Redirecting to login...", "success");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 800);
      });
    }
  };

  const initPageLoad = () => {
    window.setTimeout(() => document.body.classList.add("loaded"), 60);
  };

  return {
    async init() {
      if (CONFIG.maintenanceMode) {
        applyMaintenanceMode();
        return;
      }

      migrateLegacyStorage();
      ensureAdmin();
      ensureProjectSeed();
      ensureSystemsSeed();
      ensureClientsSeed();
      ensureHistorySeed();
      ensureSpecsSeed();
      explorerState = getGeoState();
      await resolveGeoState();
      applyExplorerRestrictions();
      const restrictedExplorerPage = isExplorerMode() && isExplorerRestrictedPage();
      initNav();
      setupLogout();
      protectRoutes();
      applyAdminMode();
      setupBuyButtons();
      setupReveal();
      setupScrollIndicator();
      setupPasswordToggles();
      setupModalTriggers();
      setupUserMenu();
      setupPreferences();
      setupProfileCustomization();
      setupExplorerInteractions(restrictedExplorerPage);
      setupOnboarding();
      setupStatsSync();
      ensureToastContainer();
      renderProjects();
      renderFeaturedProjects();
      renderSystems();
      renderClients();
      updateStats();
      renderTemplates();
      setupProjectFilters();
      setupTemplateFilters();
      setupProjectUpload();
      setupSystemForm();
      setupClientForm();
      setupTemplateUpload();
      setupTemplatePurchases();
      setupContactForms();
      renderSpecsPage();
      setupSpecsEditor();
      setupDeleteActions();
      setupEditActions();
      setupFeatureToggle();
      registerVisit();
      refreshUserMenu();

      const page = document.body.dataset.page;
      if (page === "login") setupLogin();
      if (page === "signup") setupSignup();
      if (page === "logs") setupAdminLogsPage();
      if (page === "history") setupHistoryPage();

      initPageLoad();
    },
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  CodexiaApp.init();
});
