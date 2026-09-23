"use client";

import {
  BarChart3, Bell, Building2, CalendarDays, CheckCircle2, ChevronDown, ChevronRight,
  CircleAlert, ClipboardCheck, Clock3, FileBarChart, Filter, Home, ListChecks, Menu,
  MoreVertical, Plus, Search, Star, Store, Users, X, Camera, ArrowLeft, ArrowRight,
  TrendingUp, TrendingDown, Download, Flag, Check, RefreshCw
} from "lucide-react";
import { useMemo, useState } from "react";
import { initialTasks, schedule, staff, stores, type Store as StoreType, type Task } from "@/lib/data";

type View =
  | "dashboard"
  | "stores"
  | "store"
  | "visit"
  | "tasks"
  | "new-task"
  | "staff"
  | "reports";

const navItems: { id: View; label: string; icon: typeof Home }[] = [
  { id: "dashboard", label: "Αρχική", icon: Home },
  { id: "stores", label: "Καταστήματα", icon: Store },
  { id: "tasks", label: "Εργασίες", icon: ClipboardCheck },
  { id: "staff", label: "Προσωπικό", icon: Users },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

function scoreTone(score: number) {
  if (score >= 85) return "good";
  if (score >= 70) return "warn";
  return "bad";
}

function statusTone(status: Task["status"]) {
  if (status === "Ολοκληρωμένη") return "good";
  if (status === "Σε εξέλιξη") return "warn";
  if (status === "Καθυστερημένη") return "bad";
  return "neutral";
}

export default function RetailPilotApp() {
  const [view, setView] = useState<View>("dashboard");
  const [selectedStore, setSelectedStore] = useState<StoreType>(stores[5]);
  const [tasks, setTasks] = useState(initialTasks);
  const [storeQuery, setStoreQuery] = useState("");
  const [storeFilter, setStoreFilter] = useState("Όλα");
  const [taskFilter, setTaskFilter] = useState("Όλες");
  const [visitStep, setVisitStep] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredStores = useMemo(() => {
    const q = storeQuery.trim().toLocaleLowerCase("el");
    return stores.filter((s) => {
      const matchesQuery = !q || [s.name, s.city, s.address].some((v) => v.toLocaleLowerCase("el").includes(q));
      const matchesFilter =
        storeFilter === "Όλα" ||
        (storeFilter === "Χρειάζονται έλεγχο" && (s.score < 85 || s.openTasks > 2)) ||
        (storeFilter === "Χωρίς επίσκεψη" && ["08/09/2026", "09/09/2026"].includes(s.lastVisit)) ||
        (storeFilter === "Με εκκρεμότητες" && s.openTasks > 0);
      return matchesQuery && matchesFilter;
    });
  }, [storeQuery, storeFilter]);

  const filteredTasks = useMemo(() => {
    if (taskFilter === "Όλες") return tasks;
    if (taskFilter === "Ανοιχτές") return tasks.filter((t) => t.status === "Ανοιχτή");
    if (taskFilter === "Σε εξέλιξη") return tasks.filter((t) => t.status === "Σε εξέλιξη");
    if (taskFilter === "Ολοκληρωμένες") return tasks.filter((t) => t.status === "Ολοκληρωμένη");
    return tasks.filter((t) => t.status === "Καθυστερημένη");
  }, [taskFilter, tasks]);

  function go(next: View) {
    setView(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openStore(store: StoreType) {
    setSelectedStore(store);
    go("store");
  }

  function toast(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2200);
  }

  function addTask(task: Task) {
    setTasks((prev) => [task, ...prev]);
    toast("Η εργασία δημιουργήθηκε");
    go("tasks");
  }

  return (
    <div className="app-shell">
      <aside className={menuOpen ? "sidebar sidebar-open" : "sidebar"}>
        <div className="brand" onClick={() => go("dashboard")}>
          <span className="brand-mark"><i /><i /><i /></span>
          <div>
            <strong>RetailPilot</strong>
            <small>Καταστήματα. Προσωπικό. Αποτελέσματα.</small>
          </div>
        </div>

        <nav>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={view === id || (id === "stores" && view === "store") ? "nav-item active" : "nav-item"} onClick={() => go(id)}>
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="profile-dot">ΣΠ</div>
          <div>
            <strong>Σταύρος</strong>
            <small>Area Manager</small>
          </div>
        </div>
      </aside>

      <div className="mobile-overlay" data-open={menuOpen} onClick={() => setMenuOpen(false)} />

      <main className="main">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setMenuOpen(true)} aria-label="Μενού"><Menu size={21} /></button>
          <div className="topbar-title">{titleForView(view)}</div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Ειδοποιήσεις"><Bell size={20} /><span className="badge-dot">3</span></button>
            <button className="avatar">ΣΠ</button>
          </div>
        </header>

        <section className="content">
          {view === "dashboard" && <Dashboard onNavigate={go} onStore={openStore} />}
          {view === "stores" && (
            <StoresPage
              stores={filteredStores}
              query={storeQuery}
              setQuery={setStoreQuery}
              filter={storeFilter}
              setFilter={setStoreFilter}
              onStore={openStore}
              onVisit={() => { setVisitStep(1); go("visit"); }}
              onTask={() => go("new-task")}
            />
          )}
          {view === "store" && (
            <StorePage
              store={selectedStore}
              onBack={() => go("stores")}
              onVisit={() => { setVisitStep(1); go("visit"); }}
              onTask={() => go("new-task")}
            />
          )}
          {view === "visit" && (
            <VisitFlow
              store={selectedStore}
              step={visitStep}
              setStep={setVisitStep}
              onDone={() => { toast("Η επίσκεψη αποθηκεύτηκε"); go("store"); }}
              onBack={() => go("store")}
            />
          )}
          {view === "tasks" && (
            <TasksPage
              tasks={filteredTasks}
              filter={taskFilter}
              setFilter={setTaskFilter}
              onNew={() => go("new-task")}
              onStatus={(id, status) => setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t))}
            />
          )}
          {view === "new-task" && <NewTaskPage store={selectedStore} onCancel={() => go("tasks")} onCreate={addTask} />}
          {view === "staff" && <StaffPage />}
          {view === "reports" && <ReportsPage onExport={() => toast("Η αναφορά είναι έτοιμη για εξαγωγή")} />}
        </section>

        <nav className="bottom-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={view === id || (id === "stores" && view === "store") ? "active" : ""} onClick={() => go(id)}>
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </main>

      {notice && <div className="toast"><CheckCircle2 size={18} />{notice}</div>}
    </div>
  );
}

function titleForView(view: View) {
  const titles: Record<View, string> = {
    dashboard: "Αρχική",
    stores: "Καταστήματα",
    store: "Καρτέλα καταστήματος",
    visit: "Νέα επίσκεψη",
    tasks: "Εκκρεμότητες",
    "new-task": "Νέα εργασία",
    staff: "Πρόγραμμα προσωπικού",
    reports: "Reports",
  };
  return titles[view];
}

function Dashboard({ onNavigate, onStore }: { onNavigate: (v: View) => void; onStore: (s: StoreType) => void }) {
  return (
    <>
      <div className="page-heading split">
        <div>
          <p className="eyebrow">Τετάρτη, 17 Σεπτεμβρίου 2026</p>
          <h1>Καλημέρα, Σταύρο.</h1>
          <p>Η συνολική εικόνα του δικτύου σου, σε μία οθόνη.</p>
        </div>
        <button className="primary" onClick={() => onNavigate("visit")}><Plus size={18} /> Νέα ενέργεια</button>
      </div>

      <div className="kpi-grid four">
        <Kpi icon={<BarChart3 />} value="84%" label="Μέσο Store Score" delta="+3%" tone="good" />
        <Kpi icon={<ClipboardCheck />} value="18/27" label="Επισκέψεις μήνα" delta="67%" tone="blue" />
        <Kpi icon={<ListChecks />} value="12" label="Ανοιχτές εργασίες" delta="3 εκπρόθεσμες" tone="bad" />
        <Kpi icon={<Users />} value="42" label="Προγραμματισμένοι σήμερα" delta="3 άδειες / 1 κενό" tone="warn" />
      </div>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head">
            <div><span className="section-label">Εξέλιξη δικτύου</span><h2>Μέσο Store Score</h2></div>
            <button className="link-button" onClick={() => onNavigate("reports")}>Προβολή αναλυτικά <ChevronRight size={16} /></button>
          </div>
          <div className="line-chart">
            {[78,80,81,84].map((v, i) => (
              <div className="chart-point" key={v} style={{ left: `${12 + i * 27}%`, bottom: `${18 + (v - 76) * 7}%` }}>
                <span>{v}%</span><i />
              </div>
            ))}
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
              <polyline points="12,30 39,25 66,22 93,14" fill="none" stroke="currentColor" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="chart-labels"><span>Ιούν</span><span>Ιούλ</span><span>Αύγ</span><span>Σεπ</span></div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><div><span className="section-label">Προσοχή</span><h2>Καταστήματα που χρειάζονται έλεγχο</h2></div><button className="link-button" onClick={() => onNavigate("stores")}>Όλα <ChevronRight size={16} /></button></div>
          <div className="attention-list">
            {[stores[5], stores[4], stores[3]].map((s) => (
              <button key={s.id} className="attention-row" onClick={() => onStore(s)}>
                <div className="store-thumb"><Building2 size={22} /></div>
                <div className="grow"><strong>{s.name}</strong><small>Τελευταία επίσκεψη: {s.lastVisit}</small></div>
                <Score score={s.score} delta={s.delta} />
                <ChevronRight size={18} />
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="grid-3">
        <MiniPanel title="Πρόγραμμα προσωπικού σήμερα" onClick={() => onNavigate("staff")}>
          <div className="mini-stats"><b>42</b><span>Προγραμματισμένοι</span><b>3</b><span>Άδειες / Ρεπό</span></div>
          <div className="notice-line warn"><CircleAlert size={16} /> Γλυφάδα — απαιτείται ακόμη 1 άτομο.</div>
        </MiniPanel>
        <MiniPanel title="Πρόσφατες εργασίες" onClick={() => onNavigate("tasks")}>
          {initialTasks.slice(0,3).map((t) => <div className="compact-row" key={t.id}><span className={`dot ${statusTone(t.status)}`} /><span>{t.store} — {t.title}</span></div>)}
        </MiniPanel>
        <MiniPanel title="Ειδοποιήσεις">
          <div className="compact-row"><span className="dot bad" /><span>2 εργασίες είναι εκπρόθεσμες</span></div>
          <div className="compact-row"><span className="dot warn" /><span>Δεν έχει γίνει επίσκεψη στο Περιστέρι</span></div>
          <div className="compact-row"><span className="dot blue" /><span>Λήγει αξιολόγηση προσωπικού</span></div>
        </MiniPanel>
      </div>
    </>
  );
}

function StoresPage({
  stores: list, query, setQuery, filter, setFilter, onStore, onVisit, onTask
}: {
  stores: StoreType[]; query: string; setQuery: (v: string) => void; filter: string; setFilter: (v: string) => void;
  onStore: (s: StoreType) => void; onVisit: () => void; onTask: () => void;
}) {
  return (
    <>
      <div className="page-heading split">
        <div><p className="eyebrow">Δίκτυο καταστημάτων</p><h1>Καταστήματα</h1><p>Γρήγορη εικόνα απόδοσης, εκκρεμοτήτων και τελευταίας επίσκεψης.</p></div>
        <div className="action-cluster">
          <button className="secondary" onClick={onTask}><ClipboardCheck size={18} /> Νέα εργασία</button>
          <button className="primary" onClick={onVisit}><Plus size={18} /> Νέα επίσκεψη</button>
        </div>
      </div>

      <div className="toolbar">
        <label className="searchbox"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Αναζήτηση καταστήματος..." />{query && <button onClick={() => setQuery("")}><X size={16} /></button>}</label>
        <div className="filter-pills">
          {["Όλα","Χρειάζονται έλεγχο","Χωρίς επίσκεψη","Με εκκρεμότητες"].map((f) => <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>{f}</button>)}
        </div>
      </div>

      <div className="store-grid">
        {list.map((s) => (
          <button key={s.id} className="store-card" onClick={() => onStore(s)}>
            <div className="store-card-top">
              <div className="store-thumb large"><Building2 size={28} /></div>
              <div className="grow"><h3>{s.name}</h3><p>{s.city}</p></div>
              <Score score={s.score} delta={s.delta} />
            </div>
            <div className="store-metrics">
              <span><small>Πωλήσεις</small><b>{s.sales}%</b></span>
              <span><small>Εκκρεμότητες</small><b>{s.openTasks}</b></span>
              <span><small>Εκπρόθεσμες</small><b>{s.overdue}</b></span>
              <span><small>Προσωπικό</small><b>{s.staff}</b></span>
            </div>
            <div className="store-card-foot"><span><CalendarDays size={15} /> {s.lastVisit}</span><ChevronRight size={18} /></div>
          </button>
        ))}
      </div>
    </>
  );
}

function StorePage({ store, onBack, onVisit, onTask }: { store: StoreType; onBack: () => void; onVisit: () => void; onTask: () => void }) {
  return (
    <>
      <button className="back-link" onClick={onBack}><ArrowLeft size={17} /> Καταστήματα</button>
      <div className="page-heading split">
        <div><p className="eyebrow">Καρτέλα καταστήματος</p><h1>{store.name}</h1><p>{store.address}</p></div>
        <div className="action-cluster"><button className="icon-button"><Star size={20} /></button><button className="icon-button"><MoreVertical size={20} /></button></div>
      </div>

      <div className="hero-store">
        <div className="hero-store-image"><Building2 size={56} /><span>Κεντρική φωτογραφία καταστήματος</span></div>
        <div className="hero-store-kpis">
          <Kpi value={`${store.score}%`} label="Store Score" delta={`${store.delta > 0 ? "+" : ""}${store.delta}%`} tone={scoreTone(store.score)} />
          <Kpi value="€28.450" label="Πωλήσεις μήνα" delta="92% στόχος" tone="good" />
          <Kpi value={String(store.openTasks)} label="Εκκρεμότητες" delta={`${store.overdue} εκπρόθεσμες`} tone={store.overdue ? "bad" : "good"} />
          <Kpi value={String(store.staff)} label="Προσωπικό" delta="σήμερα" tone="blue" />
        </div>
      </div>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head"><h2>Τελευταίες επισκέψεις</h2></div>
          <div className="data-list">
            <div><span>10/09/2026</span><b className="bad-text">76%</b></div>
            <div><span>21/08/2026</span><b>81%</b></div>
            <div><span>14/08/2026</span><b>79%</b></div>
          </div>
        </section>
        <section className="panel">
          <div className="panel-head"><h2>Εξέλιξη Store Score</h2></div>
          <div className="sparkline"><svg viewBox="0 0 100 30"><polyline points="5,18 50,10 95,22" fill="none" stroke="currentColor" strokeWidth="2.2" /><circle cx="5" cy="18" r="2" /><circle cx="50" cy="10" r="2" /><circle cx="95" cy="22" r="2" /></svg></div>
        </section>
      </div>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head"><h2>Κύρια θέματα</h2></div>
          <div className="issue-row"><span className="dot bad" /> Βιτρίνα <b>5/10</b></div>
          <div className="issue-row"><span className="dot warn" /> Πληρότητα προϊόντων <b>6/10</b></div>
          <div className="issue-row"><span className="dot warn" /> Αποθήκη <b>7/10</b></div>
        </section>
        <section className="panel">
          <div className="panel-head"><h2>Σχόλια τελευταίας επίσκεψης</h2></div>
          <p className="quote">«Χρειάζεται καλύτερη παρουσίαση στη βιτρίνα και αναπλήρωση σε νούμερα 37–39. Πολύ καλή η εξυπηρέτηση.»</p>
        </section>
      </div>

      <section className="panel action-panel">
        <div><span className="section-label">Γρήγορες ενέργειες</span><h2>Τι θέλεις να κάνεις;</h2></div>
        <div className="action-cluster"><button className="primary" onClick={onVisit}><Plus size={18} /> Νέα επίσκεψη</button><button className="secondary" onClick={onTask}><Plus size={18} /> Νέα εργασία</button></div>
      </section>
    </>
  );
}

function VisitFlow({ store, step, setStep, onDone, onBack }: { store: StoreType; step: number; setStep: (n: number) => void; onDone: () => void; onBack: () => void }) {
  const steps = ["Στοιχεία","Αξιολόγηση","Φωτογραφίες","Ολοκλήρωση"];
  const [scores, setScores] = useState<Record<string, number>>({ "Καθαριότητα & γενική εικόνα": 8, "Βιτρίνα / Merchandising": 5, "Σήμανση / Προσφορές": 7, "Πληρότητα προϊόντων": 4, "Οργάνωση / Αποθήκη": 6, "Εξυπηρέτηση / Συμπεριφορά": 9, "Ενεργή πώληση": 8, "Γνώση προϊόντων": 7 });
  const [photos, setPhotos] = useState(["Βιτρίνα","Βιτρίνα","Εσωτερικός χώρος","Ράφια","Προσφορές","Ταμείο","Αποθήκη","Λεπτομέρειες"]);

  return (
    <>
      <button className="back-link" onClick={onBack}><ArrowLeft size={17} /> Καρτέλα καταστήματος</button>
      <div className="page-heading"><p className="eyebrow">Καταγραφή επίσκεψης</p><h1>Νέα επίσκεψη</h1><p>{store.name} · {store.address}</p></div>
      <div className="stepper">
        {steps.map((s, i) => <button key={s} className={step === i + 1 ? "active" : step > i + 1 ? "done" : ""} onClick={() => setStep(i + 1)}><span>{step > i + 1 ? <Check size={15}/> : i + 1}</span><small>{s}</small></button>)}
      </div>

      <section className="panel form-panel">
        {step === 1 && <VisitDetails store={store} />}
        {step === 2 && <VisitRatings scores={scores} setScores={setScores} />}
        {step === 3 && <VisitPhotos photos={photos} setPhotos={setPhotos} />}
        {step === 4 && <VisitComplete store={store} scores={scores} photoCount={photos.length} />}

        <div className="form-actions">
          <button className="secondary" disabled={step === 1} onClick={() => setStep(Math.max(1, step - 1))}><ArrowLeft size={17} /> Προηγούμενο</button>
          {step < 4 ? <button className="primary" onClick={() => setStep(step + 1)}>Επόμενο <ArrowRight size={17} /></button> : <button className="primary" onClick={onDone}><CheckCircle2 size={18} /> Ολοκλήρωση επίσκεψης</button>}
        </div>
      </section>
    </>
  );
}

function VisitDetails({ store }: { store: StoreType }) {
  return (
    <div className="form-grid">
      <Field label="Κατάστημα"><select defaultValue={store.name}><option>{store.name}</option>{stores.filter(s => s.id !== store.id).map(s => <option key={s.id}>{s.name}</option>)}</select></Field>
      <Field label="Ημερομηνία επίσκεψης"><input type="date" defaultValue="2026-09-17" /></Field>
      <Field label="Ώρα έναρξης"><input type="time" defaultValue="10:30" /></Field>
      <Field label="Ώρα λήξης"><input type="time" defaultValue="12:00" /></Field>
      <Field label="Υπεύθυνος επίσκεψης"><input defaultValue="Σταύρος Δήμου" /></Field>
      <Field label="Σκοπός επίσκεψης"><select><option>Τακτική επίσκεψη</option><option>Έκτακτη επίσκεψη</option><option>Έλεγχος ένταξης νέων προϊόντων</option><option>Follow-up εκκρεμοτήτων</option></select></Field>
      <Field label="Συνοδεύοντες"><input defaultValue="Μανώλης Α., Ανδρέας Κ." /></Field>
      <Field label="Σημειώσεις"><textarea defaultValue="Καλή γενική εικόνα. Έγινε συζήτηση για τη βιτρίνα και την αναπλήρωση." /></Field>
    </div>
  );
}

function VisitRatings({ scores, setScores }: { scores: Record<string, number>; setScores: (v: Record<string, number>) => void }) {
  const groups = [
    ["1. Εικόνα καταστήματος", ["Καθαριότητα & γενική εικόνα","Βιτρίνα / Merchandising","Σήμανση / Προσφορές"]],
    ["2. Προϊόντα & Διαθεσιμότητα", ["Πληρότητα προϊόντων","Οργάνωση / Αποθήκη"]],
    ["3. Εξυπηρέτηση πελατών", ["Εξυπηρέτηση / Συμπεριφορά","Ενεργή πώληση","Γνώση προϊόντων"]],
  ] as const;

  return (
    <div className="ratings">
      {groups.map(([group, items]) => (
        <div className="rating-group" key={group}>
          <h3>{group}<small>Βάρος 20%</small></h3>
          {items.map((item) => (
            <div className="rating-row" key={item}>
              <div><b>{item}</b>{scores[item] <= 6 && <small className="need-photo"><Camera size={14}/> Απαιτείται φωτογραφία</small>}</div>
              <div className="rating-scale">{Array.from({length:10},(_,i)=>i+1).map(n => <button key={n} className={scores[item] === n ? `selected ${n <= 4 ? "bad" : n <= 6 ? "warn" : "good"}` : ""} onClick={() => setScores({ ...scores, [item]: n })}>{n}</button>)}</div>
            </div>
          ))}
        </div>
      ))}
      <div className="summary-strip"><b>Τρέχων μέσος όρος</b><strong>{(Object.values(scores).reduce((a,b)=>a+b,0)/Object.values(scores).length).toFixed(1)} / 10</strong><span>{Object.values(scores).filter(v => v <= 6).length} κριτήρια χρειάζονται τεκμηρίωση</span></div>
    </div>
  );
}

function VisitPhotos({ photos, setPhotos }: { photos: string[]; setPhotos: (p: string[]) => void }) {
  return (
    <div>
      <div className="panel-head"><div><span className="section-label">Φωτογραφίες</span><h2>{photos.length} / 20 αρχεία</h2></div></div>
      <div className="photo-grid">
        {photos.map((p, i) => <div className="photo-card" key={i}><div className="photo-placeholder"><Building2 size={30} /></div><span>{p}</span><button onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}><X size={15}/></button></div>)}
        <button className="photo-add" onClick={() => setPhotos([...photos, "Νέα φωτογραφία"])}><Camera size={28}/><span>Προσθήκη φωτογραφίας</span></button>
      </div>
      <Field label="Σχόλια για τις φωτογραφίες"><textarea defaultValue="Η βιτρίνα έχει νέα διακόσμηση. Να διατηρηθεί και την επόμενη εβδομάδα." /></Field>
    </div>
  );
}

function VisitComplete({ store, scores, photoCount }: { store: StoreType; scores: Record<string, number>; photoCount: number }) {
  const avg = Object.values(scores).reduce((a,b)=>a+b,0)/Object.values(scores).length;
  return (
    <div className="complete-card">
      <CheckCircle2 size={48} />
      <h2>Έτοιμη για καταχώρηση</h2>
      <p>Ελέγξτε τη σύνοψη πριν ολοκληρώσετε την επίσκεψη.</p>
      <div className="summary-grid">
        <span><small>Κατάστημα</small><b>{store.name}</b></span>
        <span><small>Βαθμολογία</small><b>{avg.toFixed(1)} / 10</b></span>
        <span><small>Φωτογραφίες</small><b>{photoCount}</b></span>
        <span><small>Κριτήρια ≤ 6</small><b>{Object.values(scores).filter(v=>v<=6).length}</b></span>
      </div>
    </div>
  );
}

function TasksPage({ tasks, filter, setFilter, onNew, onStatus }: { tasks: Task[]; filter: string; setFilter: (v: string) => void; onNew: () => void; onStatus: (id: number, s: Task["status"]) => void }) {
  const counts = {
    "Όλες": tasks.length,
    "Ανοιχτές": tasks.filter(t=>t.status==="Ανοιχτή").length,
    "Σε εξέλιξη": tasks.filter(t=>t.status==="Σε εξέλιξη").length,
    "Ολοκληρωμένες": tasks.filter(t=>t.status==="Ολοκληρωμένη").length,
    "Καθυστερημένες": tasks.filter(t=>t.status==="Καθυστερημένη").length,
  };
  return (
    <>
      <div className="page-heading split">
        <div><p className="eyebrow">Παρακολούθηση ενεργειών</p><h1>Εκκρεμότητες</h1><p>Όλες οι εργασίες, οι προθεσμίες και οι υπεύθυνοι σε ένα σημείο.</p></div>
        <button className="primary" onClick={onNew}><Plus size={18}/> Νέα εργασία</button>
      </div>
      <div className="task-tabs">{Object.entries(counts).map(([k,v]) => <button key={k} className={filter===k?"active":""} onClick={()=>setFilter(k)}><b>{v}</b><span>{k}</span></button>)}</div>
      <section className="panel">
        <div className="panel-head"><h2>Λίστα εκκρεμοτήτων</h2><button className="secondary compact"><Filter size={16}/> Φίλτρα</button></div>
        <div className="task-list">
          {tasks.map((t) => <div className="task-row" key={t.id}>
            <span className={`task-icon ${statusTone(t.status)}`}>{t.status==="Ολοκληρωμένη"?<Check size={17}/>:<Clock3 size={17}/>}</span>
            <div className="grow"><strong>{t.title}</strong><small>{t.store} · {t.category} · {t.owner}</small></div>
            <span className="due">{t.due}</span>
            <select value={t.status} onChange={(e)=>onStatus(t.id,e.target.value as Task["status"])} className={`status-select ${statusTone(t.status)}`}>
              <option>Ανοιχτή</option><option>Σε εξέλιξη</option><option>Ολοκληρωμένη</option><option>Καθυστερημένη</option>
            </select>
          </div>)}
        </div>
      </section>
    </>
  );
}

function NewTaskPage({ store, onCancel, onCreate }: { store: StoreType; onCancel: () => void; onCreate: (task: Task) => void }) {
  const [title, setTitle] = useState("Καθαρισμός βιτρίνας");
  const [selectedStore, setSelectedStore] = useState(store.name);
  const [category, setCategory] = useState("Καθαριότητα");
  const [description, setDescription] = useState("Να καθαριστεί η βιτρίνα και τα τζάμια εξωτερικά και εσωτερικά.");
  const [owner, setOwner] = useState("Μαρία Παπαδοπούλου");
  const [due, setDue] = useState("2026-09-20");
  const [priority, setPriority] = useState<Task["priority"]>("Υψηλή");

  return (
    <>
      <button className="back-link" onClick={onCancel}><ArrowLeft size={17}/> Εκκρεμότητες</button>
      <div className="page-heading"><p className="eyebrow">Δημιουργία & ανάθεση</p><h1>Νέα εργασία</h1><p>Καταχώρησε σαφείς οδηγίες, υπεύθυνο και προθεσμία.</p></div>
      <section className="panel form-panel">
        <div className="form-grid">
          <Field label="Κατάστημα"><select value={selectedStore} onChange={e=>setSelectedStore(e.target.value)}>{stores.map(s=><option key={s.id}>{s.name}</option>)}</select></Field>
          <Field label="Τίτλος εργασίας"><input value={title} onChange={e=>setTitle(e.target.value)} /></Field>
          <Field label="Κατηγορία"><select value={category} onChange={e=>setCategory(e.target.value)}><option>Καθαριότητα</option><option>Βιτρίνα / Merchandising</option><option>Προϊόντα / Απόθεμα</option><option>Τιμές / Σήμανση</option><option>Εξυπηρέτηση πελατών</option><option>Τεχνικά θέματα</option><option>Άλλο</option></select></Field>
          <Field label="Περιγραφή"><textarea value={description} onChange={e=>setDescription(e.target.value)} /></Field>
          <Field label="Υπεύθυνος"><select value={owner} onChange={e=>setOwner(e.target.value)}><option>Μαρία Παπαδοπούλου</option><option>Γιάννης Κ.</option><option>Ελένη Κ.</option><option>Κώστας Μ.</option></select></Field>
          <Field label="Προθεσμία"><input type="date" value={due} onChange={e=>setDue(e.target.value)} /></Field>
          <Field label="Προτεραιότητα"><select value={priority} onChange={e=>setPriority(e.target.value as Task["priority"])}><option>Χαμηλή</option><option>Μεσαία</option><option>Υψηλή</option></select></Field>
          <div className="upload-box"><Camera size={28}/><b>Προσθήκη φωτογραφιών</b><span>Προαιρετική τεκμηρίωση της εργασίας</span></div>
        </div>
        <div className="form-actions"><button className="secondary" onClick={onCancel}>Ακύρωση</button><button className="primary" disabled={!title.trim()} onClick={()=>onCreate({ id: Date.now(), title, store:selectedStore, category, due: due.split("-").reverse().join("/"), owner, priority, status:"Ανοιχτή" })}><Plus size={18}/> Δημιουργία εργασίας</button></div>
      </section>
    </>
  );
}

function StaffPage() {
  const days = ["Δευ 15/9","Τρι 16/9","Τετ 17/9","Πεμ 18/9","Παρ 19/9","Σαβ 20/9","Κυρ 21/9"];
  return (
    <>
      <div className="page-heading split">
        <div><p className="eyebrow">Οργάνωση βαρδιών</p><h1>Πρόγραμμα Προσωπικού</h1><p>Εβδομαδιαία εικόνα διαθεσιμότητας, βαρδιών, αδειών και κενών.</p></div>
        <button className="primary"><Plus size={18}/> Νέα βάρδια</button>
      </div>
      <div className="toolbar split-toolbar">
        <button className="secondary"><CalendarDays size={17}/> 15 – 21 Σεπ 2026 <ChevronDown size={15}/></button>
        <div className="segmented"><button className="active">Εβδομάδα</button><button>Μήνας</button><button>Λίστα</button></div>
      </div>
      <section className="panel schedule-panel">
        <div className="schedule-scroll">
          <table className="schedule-table">
            <thead><tr><th>Προσωπικό</th>{days.map(d=><th key={d}>{d}</th>)}</tr></thead>
            <tbody>
              {staff.map((p,i)=><tr key={p.name}>
                <td><div className="staff-cell"><span className="staff-avatar">{p.avatar}</span><span><b>{p.name}</b><small>{p.role} · {p.hours}h</small></span></div></td>
                {schedule[i].map((shift,j)=><td key={j}><span className={`shift ${shift.startsWith("Π")?"morning":shift.startsWith("Α ")?"evening":shift==="ΑΔ"?"leave":"off"}`}>{shift}</span></td>)}
              </tr>)}
            </tbody>
          </table>
        </div>
      </section>
      <div className="grid-3">
        <Kpi value="42" label="Προγραμματισμένοι" tone="blue" />
        <Kpi value="3" label="Άδειες / Ρεπό" tone="good" />
        <Kpi value="1" label="Κενό βάρδιας" tone="warn" />
      </div>
    </>
  );
}

function ReportsPage({ onExport }: { onExport: () => void }) {
  return (
    <>
      <div className="page-heading split">
        <div><p className="eyebrow">Στατιστικά · Αναλύσεις</p><h1>Reports</h1><p>Αποτελέσματα και τάσεις για καλύτερες αποφάσεις.</p></div>
        <button className="primary" onClick={onExport}><Download size={18}/> Εξαγωγή</button>
      </div>
      <div className="toolbar report-filters">
        <label><span>Περίοδος</span><select><option>Σεπ 2026</option><option>Αυγ 2026</option></select></label>
        <label><span>Κατάστημα</span><select><option>Όλα</option>{stores.map(s=><option key={s.id}>{s.name}</option>)}</select></label>
        <label><span>Τύπος αναφοράς</span><select><option>Γενική εικόνα</option><option>Βαθμολογία καταστημάτων</option><option>Εκκρεμότητες</option><option>Επίδοση προσωπικού</option></select></label>
      </div>
      <div className="kpi-grid four">
        <Kpi value="8,2 / 10" label="Μέση βαθμολογία" delta="+12%" tone="good" />
        <Kpi value="78%" label="Ολοκλήρωση εκκρεμοτήτων" delta="+18%" tone="blue" />
        <Kpi value="24" label="Σύνολο εργασιών" delta="+9%" tone="blue" />
        <Kpi value="92%" label="Συμμόρφωση προσωπικού" delta="+6%" tone="good" />
      </div>
      <div className="grid-2">
        <section className="panel">
          <div className="panel-head"><h2>Εξέλιξη βαθμολογίας</h2><button className="secondary compact">Ανά εβδομάδα <ChevronDown size={15}/></button></div>
          <div className="report-line"><svg viewBox="0 0 100 42" preserveAspectRatio="none"><polyline points="5,33 28,21 51,16 74,13 96,7" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>{[[5,33],[28,21],[51,16],[74,13],[96,7]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="1.8"/>)}</svg></div>
        </section>
        <section className="panel">
          <div className="panel-head"><h2>Σύγκριση περιόδων</h2></div>
          <div className="bar-compare"><div><span style={{height:"68%"}}>6,8</span><small>Αυγ 2026</small></div><div><span style={{height:"82%"}}>8,2</span><small>Σεπ 2026</small></div></div>
        </section>
      </div>
      <section className="panel">
        <div className="panel-head"><h2>Αναφορά ανά κατηγορία</h2></div>
        <div className="category-bars">
          {[["Καθαριότητα & εικόνα",8.5],["Βιτρίνα / Merchandising",7.8],["Προϊόντα / Απόθεμα",7.0],["Τιμές / Σήμανση",8.2],["Εξυπηρέτηση πελατών",8.9],["Ταμείο",7.6],["Αποθήκη",6.8]].map(([name,val])=><div key={String(name)}><span>{name}</span><i><b style={{width:`${Number(val)*10}%`}} /></i><strong>{String(val).replace(".",",")}</strong></div>)}
        </div>
      </section>
    </>
  );
}

function Kpi({ icon, value, label, delta, tone="blue" }: { icon?: React.ReactNode; value: string; label: string; delta?: string; tone?: string }) {
  return <div className={`kpi-card ${tone}`}>{icon && <span className="kpi-icon">{icon}</span>}<div><strong>{value}</strong><span>{label}</span>{delta && <small>{delta}</small>}</div></div>;
}

function MiniPanel({ title, children, onClick }: { title: string; children: React.ReactNode; onClick?: () => void }) {
  return <section className="panel mini-panel"><div className="panel-head"><h2>{title}</h2>{onClick && <button className="link-button" onClick={onClick}>Προβολή <ChevronRight size={15}/></button>}</div>{children}</section>;
}

function Score({ score, delta }: { score: number; delta: number }) {
  return <div className={`score-badge ${scoreTone(score)}`}><strong>{score}%</strong><small>{delta > 0 ? <TrendingUp size={13}/> : <TrendingDown size={13}/>} {delta > 0 ? "+" : ""}{delta}%</small></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}
