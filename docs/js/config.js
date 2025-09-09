// docs/js/config.js
(function () {
  const RENDER_BACKEND = "https://konnekt-v-0-0-0-95.onrender.com";

  const isLocal = window.location.hostname === "localhost"
    || window.location.hostname === "127.0.0.1";

  const apiBase = isLocal ? "http://localhost:3000" : RENDER_BACKEND;

  window.CONFIG = {
    API_BASE_URL: apiBase,
    SOCKET_URL: apiBase,

    // эндпоинты API
    endpoints: {
      login: "/api/user/login",
      register: "/api/users/registration",
      logout: "/api/user/logout",
      profile: "/api/profile"
    },

    // пути к страницам
    routes: {
      login: "login.html",
      register: "registration.html",
      profile: "profile.html",
      chats: "chating.html",
      editProfile: "profile-change-info.html"
    }
  };
})();
