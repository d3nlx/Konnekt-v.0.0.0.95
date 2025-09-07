// docs/js/config.js
// Автоматически выбирает localhost во время разработки,
// и PRODUCTION_URL — когда сайт открыт не на localhost.
(function () {
  // Укажи сюда финальный адрес backend на Render (https)
  const RENDER_BACKEND = "https://konnekt-v-0-0-0-95.onrender.com"; // <- поменяй на свой

  const isLocal = window.location.hostname === "localhost"
    || window.location.hostname === "127.0.0.1";

  const apiBase = isLocal ? "http://localhost:3000" : RENDER_BACKEND;
  const socketUrl = apiBase;

  window.CONFIG = {
    API_BASE_URL: apiBase,
    SOCKET_URL: socketUrl
  };
})();

/*
  Важно: заменяй RENDER_BACKEND на фактический URL твоего Render-сервиса. Если фронт будет и на другом домене (свой домен), isLocal можно поменять на проверку window.location.hostname.includes('github.io') или использовать окружение.
*/