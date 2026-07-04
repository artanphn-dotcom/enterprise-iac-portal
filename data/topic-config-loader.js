(function () {
  function resolveJsonPath() {
    const path = (window.location.pathname || '').toLowerCase();
    return path.indexOf('/123/') !== -1 ? '../data/topic-config.json' : 'data/topic-config.json';
  }

  async function loadTopicConfig() {
    // If existing config is already present, keep it as a safe fallback.
    const fallback = (window.TOPIC_CONFIG && typeof window.TOPIC_CONFIG === 'object')
      ? window.TOPIC_CONFIG
      : {};

    try {
      const response = await fetch(resolveJsonPath(), { cache: 'no-cache' });
      if (!response.ok) throw new Error('Failed to fetch topic config JSON');
      const json = await response.json();
      if (json && typeof json === 'object') {
        window.TOPIC_CONFIG = json;
        return;
      }
      window.TOPIC_CONFIG = fallback;
    } catch (_) {
      // On file:// or offline contexts, fallback to preloaded JS config.
      window.TOPIC_CONFIG = fallback;
    }
  }

  window.TOPIC_CONFIG_READY = loadTopicConfig();
})();
