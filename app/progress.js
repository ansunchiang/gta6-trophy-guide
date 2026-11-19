const progressStore = (() => {
  const key = "vice-ledger:ps5";
  const format = "vice-ledger:gta-vi-ps5";
  const ids = new Set(catalog.trophies.map(trophy => trophy.id));
  const byName = new Map(catalog.trophies.map(trophy => [trophy.name, trophy.id]));

  function decode(text) {
    const saved = JSON.parse(text);
    if (Array.isArray(saved) && saved.every(name => byName.has(name))) {
      return { earned: new Set(saved.map(name => byName.get(name))), hideSpoilers: true };
    }
    if (saved?.format !== format || saved.version !== 1 ||
        !Array.isArray(saved.earned) || !saved.earned.every(id => ids.has(id)) ||
        typeof saved.hideSpoilers !== "boolean") {
      throw new Error("Choose a Vice Ledger PS5 progress file.");
    }
    return { earned: new Set(saved.earned), hideSpoilers: saved.hideSpoilers };
  }

  function encode(state) {
    return JSON.stringify({
      format,
      version: 1,
      earned: [...state.earned].sort((a, b) => a - b),
      hideSpoilers: state.hideSpoilers
    }, null, 2);
  }

  function read() {
    try {
      const saved = localStorage.getItem(key) ?? localStorage.getItem("gta6-trophy-checklist");
      if (saved !== null) return decode(saved);
    } catch {
      return { earned: new Set(), hideSpoilers: true };
    }
    return { earned: new Set(), hideSpoilers: true };
  }

  function save(state) {
    try {
      localStorage.setItem(key, encode(state));
      return true;
    } catch {
      return false;
    }
  }

  function download(state) {
    const url = URL.createObjectURL(new Blob([encode(state)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "vice-ledger-ps5-progress.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return { read, save, decode, download };
})();
