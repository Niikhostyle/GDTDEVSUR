import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { COLLECTIONS, type CollectionId } from "../../lib/collections";
import CollectionEditor from "./CollectionEditor";
import { fromEditorModel, SCHEMAS, toEditorModel } from "./schemas";
import "./admin.css";

type Submission = {
  id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  message: string;
  createdAt: string;
};

type Tab = CollectionId | "submissions";
type Model = Record<string, unknown>;

function prepareModel(tab: CollectionId, raw: Model): Model {
  const withEnabled =
    SCHEMAS[tab].hasEnabled !== false && typeof raw.enabled === "undefined"
      ? { ...raw, enabled: true }
      : raw;
  return toEditorModel(tab, withEnabled);
}

export default function AdminApp() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginShake, setLoginShake] = useState(false);
  const [tab, setTab] = useState<Tab>("site");
  const [models, setModels] = useState<Partial<Record<CollectionId, Model>>>({});
  const [status, setStatus] = useState("");
  const [submissions, setSubmissions] = useState<Submission[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const allLoaded = useRef(false);

  const data = tab === "submissions" ? null : (models[tab] ?? null);

  const setData = useCallback(
    (next: Model) => {
      if (tab === "submissions") return;
      setModels((prev) => ({ ...prev, [tab]: next }));
    },
    [tab],
  );

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authenticated)))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (!authed || allLoaded.current) return;
    allLoaded.current = true;
    fetch("/api/content")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<Record<string, Model>>;
      })
      .then((all) => {
        const next: Partial<Record<CollectionId, Model>> = {};
        for (const c of COLLECTIONS) {
          const id = c.id as CollectionId;
          if (all[id]) next[id] = prepareModel(id, all[id]);
        }
        setModels((prev) => ({ ...next, ...prev }));
      })
      .catch(() => {
        allLoaded.current = false;
      });
  }, [authed]);

  useEffect(() => {
    if (!authed || tab !== "submissions") return;
    fetch("/api/submissions")
      .then((r) => r.json())
      .then((list) => setSubmissions(Array.isArray(list) ? list : []))
      .catch(() => setSubmissions((prev) => prev ?? []));
  }, [authed, tab]);

  useEffect(() => {
    if (!authed || tab === "submissions" || models[tab]) return;
    const current = tab;
    const timer = window.setTimeout(() => {
      setStatus("Cargando…");
      fetch(`/api/content/${current}`)
        .then((r) => r.json())
        .then((raw) => {
          setModels((prev) => (prev[current] ? prev : { ...prev, [current]: prepareModel(current, raw) }));
          setStatus("");
        })
        .catch(() => setStatus("Error al cargar"));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [authed, tab, models]);

  const jsonText = useMemo(
    () => (showJson && data && tab !== "submissions" ? JSON.stringify(fromEditorModel(tab, data), null, 2) : ""),
    [showJson, data, tab],
  );

  const tabs = useMemo(
    () => [
      ...COLLECTIONS.map((c) => ({ id: c.id as Tab, label: c.label })),
      { id: "submissions" as Tab, label: "Consultas" },
    ],
    [],
  );

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      setLoginError("Email o contraseña incorrectos");
      setLoginShake(true);
      return;
    }
    setAuthed(true);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    allLoaded.current = false;
    setModels({});
    setSubmissions(null);
    setAuthed(false);
  }

  async function save() {
    if (tab === "submissions" || !data) return;
    setSaving(true);
    setStatus("");
    try {
      const payload = fromEditorModel(tab, data);
      const res = await fetch(`/api/content/${tab}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("Guardado correctamente");
    } catch {
      setStatus("No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  async function removeSubmission(id: string) {
    await fetch(`/api/submissions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setSubmissions((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
  }

  async function uploadFile(file: File) {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const json = await res.json();
    if (json.url) {
      await navigator.clipboard.writeText(json.url);
      setStatus(`Archivo subido. URL copiada: ${json.url}`);
    }
  }

  if (authed === null) {
    return (
      <div className="admin-shell relative grid min-h-screen place-items-center">
        <p className="relative z-10 text-sm tracking-wide text-white/50">Cargando panel…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="admin-shell relative grid min-h-screen place-items-center overflow-hidden px-4">
        <form
          onSubmit={login}
          onAnimationEnd={() => setLoginShake(false)}
          className={`admin-panel admin-enter relative z-10 w-full max-w-md rounded-3xl p-8 md:p-10 ${
            loginShake ? "admin-shake" : ""
          }`}
        >
          <div className="mb-8 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/40">
              <span className="text-[10px] font-700 tracking-[0.14em] lowercase text-white">gds</span>
            </span>
            <div>
              <p className="text-[11px] font-600 tracking-[0.2em] text-[var(--admin-accent)] uppercase">
                CMS premium
              </p>
              <h1 className="admin-display text-2xl font-700 text-white">GDT DevSur</h1>
            </div>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-[var(--admin-muted)]">
            Administra cada sección de la web sin tocar código.
          </p>
          <label className="block text-[11px] font-600 tracking-[0.16em] text-[var(--admin-muted)] uppercase">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ejemplo.com"
              className="admin-input"
              autoComplete="username"
              autoFocus
              required
            />
          </label>
          <label className="mt-4 block text-[11px] font-600 tracking-[0.16em] text-[var(--admin-muted)] uppercase">
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="admin-input"
              autoComplete="current-password"
              required
            />
          </label>
          {loginError && <p className="mt-3 text-sm text-red-300">{loginError}</p>}
          <button
            type="submit"
            className="admin-btn mt-6 w-full rounded-full bg-[var(--admin-accent)] py-3 font-600 text-black"
          >
            Entrar al panel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-shell relative min-h-screen">
      <div className="relative z-10">
        <header className="sticky top-0 z-20 border-b border-white/8 bg-[#06080d]/95 px-4 py-4 md:px-6">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/35">
                <span className="text-[9px] font-700 tracking-[0.12em] lowercase text-white">gds</span>
              </span>
              <div>
                <p className="admin-display text-lg font-700 text-white md:text-xl">GDT DevSur · CMS</p>
                <p className="text-xs text-[var(--admin-muted)]">Activa, edita y publica por módulo</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:border-white/40 hover:text-white"
              >
                Ver sitio
              </a>
              {tab !== "submissions" && (
                <button
                  onClick={() => void save()}
                  disabled={saving || !data}
                  className="admin-btn rounded-full bg-[var(--admin-accent)] px-5 py-2 text-sm font-600 text-black disabled:opacity-55"
                >
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              )}
              <button
                onClick={logout}
                className="admin-btn rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:border-white/35 hover:text-white"
              >
                Salir
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1400px] lg:grid-cols-[260px_1fr]">
          <aside className="border-b border-white/8 p-3 lg:min-h-[calc(100vh-81px)] lg:border-r lg:border-b-0 lg:p-4">
            <p className="mb-3 px-2 text-[10px] font-700 tracking-[0.22em] text-white/35 uppercase">
              Módulos
            </p>
            <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    if (t.id === tab) return;
                    setStatus("");
                    setTab(t.id);
                  }}
                  className={`admin-nav-btn whitespace-nowrap rounded-xl px-3.5 py-2.5 text-left text-sm ${
                    tab === t.id ? "is-active font-600" : "text-white/55 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </aside>

          <main key={tab} className="admin-enter p-4 md:p-7">
            {tab === "submissions" ? (
              <div className="space-y-5">
                <div>
                  <p className="text-[11px] font-600 tracking-[0.2em] text-[var(--admin-accent)] uppercase">
                    Inbox
                  </p>
                  <h2 className="admin-display mt-1 text-2xl font-700 text-white md:text-3xl">
                    Consultas recibidas
                  </h2>
                </div>
                {submissions === null && (
                  <div className="admin-panel rounded-2xl p-8 text-sm text-[var(--admin-muted)]">
                    Cargando consultas…
                  </div>
                )}
                {submissions?.length === 0 && (
                  <div className="admin-panel rounded-2xl p-8 text-sm text-[var(--admin-muted)]">
                    Todavía no hay mensajes.
                  </div>
                )}
                {submissions?.map((s) => (
                  <article key={s.id} className="admin-panel admin-cv rounded-2xl p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="admin-display font-600 text-white">{s.name}</p>
                        <p className="mt-1 text-sm text-[var(--admin-muted)]">
                          {s.email} · {s.phone}
                          {s.company ? ` · ${s.company}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-[var(--admin-accent)]">
                          {new Date(s.createdAt).toLocaleString("es-CL")}
                        </p>
                      </div>
                      <button
                        onClick={() => removeSubmission(s.id)}
                        className="admin-btn text-sm text-red-300/90 hover:text-red-200"
                      >
                        Eliminar
                      </button>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-white/80">
                      {s.message}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-600 tracking-[0.2em] text-[var(--admin-accent)] uppercase">
                      Editor
                    </p>
                    <h2 className="admin-display mt-1 text-2xl font-700 text-white md:text-3xl">
                      {COLLECTIONS.find((c) => c.id === tab)?.label}
                    </h2>
                    <p className="mt-2 max-w-xl text-sm text-[var(--admin-muted)]">
                      Edita campos, activa o desactiva el módulo y gestiona ítems.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="admin-btn cursor-pointer rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:border-white/35 hover:text-white">
                      Subir archivo
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void uploadFile(f);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowJson((v) => !v)}
                      className="admin-btn rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:border-white/35 hover:text-white"
                    >
                      {showJson ? "Ocultar JSON" : "JSON avanzado"}
                    </button>
                  </div>
                </div>

                {status && (
                  <p
                    data-admin-status
                    className={`text-sm ${
                      status.includes("correctamente") || status.includes("copiada")
                        ? "text-emerald-300/90"
                        : status.includes("Error") || status.includes("No se pudo")
                          ? "text-red-300"
                          : "text-[var(--admin-muted)]"
                    }`}
                  >
                    {status}
                  </p>
                )}

                {!data ? (
                  <div className="admin-panel rounded-2xl p-8 text-sm text-[var(--admin-muted)]">
                    Cargando sección…
                  </div>
                ) : (
                  <>
                    <CollectionEditor schema={SCHEMAS[tab]} data={data} onChange={setData} />
                    {showJson && (
                      <textarea
                        value={jsonText}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            setData(toEditorModel(tab, parsed));
                          } catch {
                            /* ignore while typing */
                          }
                        }}
                        spellCheck={false}
                        className="admin-input min-h-[280px] rounded-2xl font-mono text-xs leading-relaxed"
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
