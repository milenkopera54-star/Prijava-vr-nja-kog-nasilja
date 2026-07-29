// U Claude artefaktu postoji window.storage (deljeno skladište).
// Van Claude-a (npr. na Vercelu) toga nema, pa se koristi localStorage kao zamena.
// VAŽNO: localStorage je po uređaju/browseru — prijave sa telefona učenika NEĆE
// biti vidljive u dashboardu psihologa na drugom računaru. Za pravi zajednički
// pregled na više uređaja treba prava baza (npr. Supabase) — javi se kad dođe to na red.

export async function storageGet(key, shared = true) {
  if (typeof window !== "undefined" && window.storage) {
    try {
      return await window.storage.get(key, shared);
    } catch {
      return null;
    }
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? { key, value: raw, shared } : null;
  } catch {
    return null;
  }
}

export async function storageSet(key, value, shared = true) {
  if (typeof window !== "undefined" && window.storage) {
    try {
      return await window.storage.set(key, value, shared);
    } catch {
      return null;
    }
  }
  try {
    localStorage.setItem(key, value);
    return { key, value, shared };
  } catch {
    return null;
  }
}
