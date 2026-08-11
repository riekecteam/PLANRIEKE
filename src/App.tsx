import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  Crown,
  Edit3,
  GraduationCap,
  Heart,
  Home,
  Palmtree,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';

type PlanId = 'happiness' | 'academic' | 'business' | 'career' | 'wishlist' | 'marriage';
type Status = 'Belum dimulai' | 'Sedang berjalan' | 'Selesai';
type Priority = 'Rendah' | 'Sedang' | 'Tinggi';

type PlanItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  budget: string;
  priority: Priority;
  status: Status;
  notes: string;
  createdAt: number;
  extra?: string;
};

type Plan = {
  id: PlanId;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  icon: typeof Heart;
  color: string;
  key: string;
  section: string;
};

const plans: Plan[] = [
  { id: 'happiness', title: 'Bahagiain Diri Sendiri', shortTitle: 'Bahagia', eyebrow: 'Ruang kecil untuk dirimu', description: 'Catat hal-hal sederhana yang membuat hati Rieke terasa penuh.', icon: Heart, color: '#F7559D', key: 'rencanaRieke_happiness', section: 'Wishlist kebahagiaan' },
  { id: 'academic', title: 'Akademik', shortTitle: 'Akademik', eyebrow: 'Tumbuh lewat belajar', description: 'Simpan tujuan pendidikan, kursus, dan pencapaian akademikmu.', icon: GraduationCap, color: '#F7559D', key: 'rencanaRieke_academic', section: 'Academic goals' },
  { id: 'business', title: 'Bisnis', shortTitle: 'Bisnis', eyebrow: 'Ide yang ingin jadi nyata', description: 'Rencanakan langkah-langkah untuk membangun sesuatu milikmu.', icon: BriefcaseBusiness, color: '#F7559D', key: 'rencanaRieke_business', section: 'Business goals' },
  { id: 'career', title: 'Karir Seumur Hidup', shortTitle: 'Karir', eyebrow: 'Perjalanan yang panjang', description: 'Gambarkan versi karier yang ingin kamu jalani dengan tenang.', icon: UserRound, color: '#F7559D', key: 'rencanaRieke_career', section: 'Career vision' },
  { id: 'wishlist', title: 'Beli Barang / Liburan', shortTitle: 'Wishlist', eyebrow: 'Hal-hal yang ingin dinanti', description: 'Kumpulkan wishlist barang dan destinasi yang ingin kamu kunjungi.', icon: Palmtree, color: '#F7559D', key: 'rencanaRieke_wishlist', section: 'Wishlist barang & liburan' },
  { id: 'marriage', title: 'Menikah', shortTitle: 'Menikah', eyebrow: 'Mimpi yang dipersiapkan', description: 'Simpan visi dan langkah kecil menuju hari yang kamu impikan.', icon: Crown, color: '#F7559D', key: 'rencanaRieke_marriage', section: 'Wedding vision' },
];

const starterData: Record<PlanId, PlanItem[]> = {
  happiness: [
    { id: 'h-1', title: 'Me time tanpa rasa bersalah', description: 'Satu sore untuk istirahat dan melakukan yang disukai.', date: '2025-03-20', budget: '250000', priority: 'Sedang', status: 'Selesai', notes: 'Matikan notifikasi.', createdAt: 1 },
    { id: 'h-2', title: 'Beli bunga untuk diri sendiri', description: 'Pilih bunga segar untuk meja kamar.', date: '2025-04-05', budget: '150000', priority: 'Rendah', status: 'Sedang berjalan', notes: '', createdAt: 2 },
  ],
  academic: [{ id: 'a-1', title: 'Selesaikan sertifikasi baru', description: 'Belajar konsisten dua jam setiap minggu.', date: '2025-06-30', budget: '', priority: 'Tinggi', status: 'Sedang berjalan', notes: 'Cari jadwal ujian.', createdAt: 3 }],
  business: [{ id: 'b-1', title: 'Validasi ide bisnis', description: 'Ngobrol dengan lima calon pelanggan.', date: '2025-05-15', budget: '500000', priority: 'Tinggi', status: 'Sedang berjalan', notes: 'Catat semua insight.', createdAt: 4 }],
  career: [],
  wishlist: [{ id: 'w-1', title: 'Bali trip', description: 'Liburan santai, kulineran, dan menikmati matahari terbenam.', date: '2025-08-12', budget: '5000000', priority: 'Sedang', status: 'Sedang berjalan', notes: 'Target terkumpul Rp2.500.000.', createdAt: 5 }],
  marriage: [],
};

const statusOptions: Status[] = ['Belum dimulai', 'Sedang berjalan', 'Selesai'];
const priorityOptions: Priority[] = ['Rendah', 'Sedang', 'Tinggi'];

function getStoredItems(plan: Plan): PlanItem[] {
  try {
    const stored = localStorage.getItem(plan.key);
    return stored ? JSON.parse(stored) as PlanItem[] : starterData[plan.id];
  } catch {
    return starterData[plan.id];
  }
}

function formatBudget(value: string) {
  if (!value) return '—';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value));
}

function App() {
  const [activePlanId, setActivePlanId] = useState<PlanId | null>(null);
  const [itemsByPlan, setItemsByPlan] = useState<Record<PlanId, PlanItem[]>>(() => Object.fromEntries(plans.map((plan) => [plan.id, getStoredItems(plan)])) as Record<PlanId, PlanItem[]>);
  const [editingItem, setEditingItem] = useState<PlanItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'Semua' | Status>('Semua');
  const [sort, setSort] = useState<'Terbaru' | 'Deadline terdekat' | 'Prioritas'>('Terbaru');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const activePlan = plans.find((plan) => plan.id === activePlanId) ?? null;
  const activeItems = activePlan ? itemsByPlan[activePlan.id] : [];

  useEffect(() => {
    plans.forEach((plan) => localStorage.setItem(plan.key, JSON.stringify(itemsByPlan[plan.id])));
  }, [itemsByPlan]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (activePlanId) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePlanId]);

  const updateItems = (planId: PlanId, nextItems: PlanItem[]) => setItemsByPlan((current) => ({ ...current, [planId]: nextItems }));
  const openPlan = (id: PlanId) => { setActivePlanId(id); setShowForm(false); setEditingItem(null); setSearch(''); setFilter('Semua'); };
  const goHome = () => { setActivePlanId(null); setShowForm(false); setEditingItem(null); };
  const openNew = () => { setEditingItem(null); setShowForm(true); };
  const openEdit = (item: PlanItem) => { setEditingItem(item); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingItem(null); };

  const saveItem = (item: PlanItem) => {
    if (!activePlan) return;
    const existing = itemsByPlan[activePlan.id];
    updateItems(activePlan.id, editingItem ? existing.map((current) => current.id === item.id ? item : current) : [item, ...existing]);
    closeForm();
    setToast('Berhasil disimpan');
  };

  const confirmDelete = () => {
    if (!activePlan || !deleteId) return;
    updateItems(activePlan.id, itemsByPlan[activePlan.id].filter((item) => item.id !== deleteId));
    setDeleteId(null);
    setToast('Rencana dihapus');
  };

  const visibleItems = useMemo(() => {
    const result = activeItems.filter((item) => {
      const matchesSearch = `${item.title} ${item.description} ${item.notes}`.toLowerCase().includes(search.toLowerCase());
      return matchesSearch && (filter === 'Semua' || item.status === filter);
    });
    return [...result].sort((a, b) => sort === 'Deadline terdekat' ? (a.date || '9999').localeCompare(b.date || '9999') : sort === 'Prioritas' ? priorityOptions.indexOf(b.priority) - priorityOptions.indexOf(a.priority) : b.createdAt - a.createdAt);
  }, [activeItems, filter, search, sort]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={goHome} aria-label="Kembali ke beranda">
          <img src="/cropped_circle_image_(3).png" alt="Rencana Rieke" />
          <span>Rencana Rieke</span>
        </button>
        <button className="icon-button" onClick={() => setShowSettings(true)} aria-label="Pengaturan"><Settings size={20} /></button>
      </header>

      <main className="page-content">
        {activePlan ? (
          <PlanPage plan={activePlan} items={visibleItems} totalItems={activeItems.length} search={search} filter={filter} sort={sort} setSearch={setSearch} setFilter={setFilter} setSort={setSort} onBack={goHome} onAdd={openNew} onEdit={openEdit} onDelete={setDeleteId} />
        ) : (
          <HomePage itemsByPlan={itemsByPlan} onOpen={openPlan} />
        )}
      </main>

      {!showForm && <BottomNav activePlanId={activePlanId} onOpen={openPlan} onHome={goHome} />}
      {showForm && activePlan && <PlanForm plan={activePlan} initial={editingItem} onCancel={closeForm} onSave={saveItem} />}
      {deleteId && <DeleteDialog onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} />}
      {showSettings && <SettingsDialog onClose={() => setShowSettings(false)} onClear={() => { localStorage.clear(); window.location.reload(); }} />}
      {toast && <div className="toast"><Check size={17} /> {toast}</div>}
    </div>
  );
}

function HomePage({ itemsByPlan, onOpen }: { itemsByPlan: Record<PlanId, PlanItem[]>; onOpen: (id: PlanId) => void }) {
  const totalDone = plans.reduce((sum, plan) => sum + itemsByPlan[plan.id].filter((item) => item.status === 'Selesai').length, 0);
  const totalItems = plans.reduce((sum, plan) => sum + itemsByPlan[plan.id].length, 0);
  return (
    <div className="home-page">
      <section className="hero">
        <div>
          <p className="eyebrow">Selamat datang kembali, Rieke</p>
          <h1>Pelan-pelan,<br /><em>satu per satu,</em><br />aku wujudkan.</h1>
          <p className="hero-copy">Tempat Rieke menyimpan semua rencana hidupnya.</p>
        </div>
        <div className="hero-mark"><Sparkles size={20} /><span>{totalDone} / {totalItems || 1}<small>rencana selesai</small></span></div>
      </section>
      <section className="section-heading"><div><p className="eyebrow">Ruang rencana</p><h2>Semua yang ingin kamu wujudkan</h2></div><span className="tiny-note">{plans.length} area hidup</span></section>
      <div className="plan-grid">
        {plans.map((plan) => <PlanCard key={plan.id} plan={plan} items={itemsByPlan[plan.id]} onOpen={() => onOpen(plan.id)} />)}
      </div>
    </div>
  );
}

function PlanCard({ plan, items, onOpen }: { plan: Plan; items: PlanItem[]; onOpen: () => void }) {
  const Icon = plan.icon;
  const done = items.filter((item) => item.status === 'Selesai').length;
  const progress = items.length ? Math.round((done / items.length) * 100) : 0;
  return (
    <article className="plan-card" onClick={onOpen}>
      <div className="card-top"><div className="plan-icon"><Icon size={21} strokeWidth={1.8} /></div><span className="card-arrow">↗</span></div>
      <p className="card-eyebrow">{plan.eyebrow}</p><h3>{plan.title}</h3>
      <div className="card-progress"><span>{done} dari {items.length} target selesai</span><strong>{progress}%</strong></div>
      <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
      <button className="text-button" onClick={(event) => { event.stopPropagation(); onOpen(); }}>Lihat plan <span>→</span></button>
    </article>
  );
}

function PlanPage({ plan, items, totalItems, search, filter, sort, setSearch, setFilter, setSort, onBack, onAdd, onEdit, onDelete }: { plan: Plan; items: PlanItem[]; totalItems: number; search: string; filter: 'Semua' | Status; sort: 'Terbaru' | 'Deadline terdekat' | 'Prioritas'; setSearch: (value: string) => void; setFilter: (value: 'Semua' | Status) => void; setSort: (value: 'Terbaru' | 'Deadline terdekat' | 'Prioritas') => void; onBack: () => void; onAdd: () => void; onEdit: (item: PlanItem) => void; onDelete: (id: string) => void }) {
  const Icon = plan.icon;
  const done = items.filter((item) => item.status === 'Selesai').length;
  const progress = totalItems ? Math.round((done / totalItems) * 100) : 0;
  return (
    <div className="plan-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> Semua plan</button>
      <section className="plan-heading"><div className="large-plan-icon"><Icon size={29} strokeWidth={1.7} /></div><div><p className="eyebrow">{plan.eyebrow}</p><h1>{plan.title}</h1></div></section>
      <p className="plan-description">{plan.description}</p>
      <section className="progress-card"><div className="progress-head"><span>Progressmu</span><strong>{progress}% selesai</strong></div><div className="progress-track large"><div style={{ width: `${progress}%` }} /></div><p>{done} dari {totalItems} rencana sudah selesai. Setiap langkah kecil tetap berarti.</p></section>
      <div className="action-row"><div><p className="eyebrow">{plan.section}</p><h2>Rencanamu</h2></div><button className="primary-button" onClick={onAdd}><Plus size={18} /> Tambah rencana</button></div>
      {totalItems > 0 && <div className="toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari rencana..." /></div><div className="toolbar-selects"><select value={filter} onChange={(event) => setFilter(event.target.value as 'Semua' | Status)}><option>Semua</option>{statusOptions.map((option) => <option key={option}>{option}</option>)}</select><select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option>Terbaru</option><option>Deadline terdekat</option><option>Prioritas</option></select></div></div>}
      {items.length === 0 ? <EmptyState onAdd={onAdd} /> : <div className="items-list">{items.map((item) => <PlanItemCard key={item.id} item={item} onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} />)}</div>}
      {totalItems > 0 && items.length === 0 && <p className="no-results">Tidak ada rencana yang cocok dengan pencarianmu.</p>}
    </div>
  );
}

function PlanItemCard({ item, onEdit, onDelete }: { item: PlanItem; onEdit: () => void; onDelete: () => void }) {
  return <article className="item-card"><div className="item-check">{item.status === 'Selesai' ? <Check size={17} /> : <span />}</div><div className="item-body"><div className="item-title-row"><div><h3>{item.title}</h3><span className={`status status-${item.status.replace(' ', '-').toLowerCase()}`}>{item.status}</span></div><span className={`priority priority-${item.priority.toLowerCase()}`}>{item.priority}</span></div>{item.description && <p>{item.description}</p>}<div className="item-meta">{item.date && <span>{new Date(`${item.date}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}{item.budget && <span>{formatBudget(item.budget)}</span>}</div><div className="item-actions"><button onClick={onEdit}><Edit3 size={14} /> Edit</button><button className="danger-text" onClick={onDelete}><Trash2 size={14} /> Hapus</button></div></div></article>;
}

function EmptyState({ onAdd }: { onAdd: () => void }) { return <div className="empty-state"><div className="empty-icon"><Heart size={24} /></div><h3>Belum ada rencana di sini.</h3><p>Yuk mulai buat satu rencana kecil.</p><button className="primary-button" onClick={onAdd}><Plus size={17} /> Tambah rencana</button></div>; }

function PlanForm({ plan, initial, onCancel, onSave }: { plan: Plan; initial: PlanItem | null; onCancel: () => void; onSave: (item: PlanItem) => void }) {
  const [form, setForm] = useState<PlanItem>(initial ?? { id: `item-${Date.now()}`, title: '', description: '', date: '', budget: '', priority: 'Sedang', status: 'Belum dimulai', notes: '', createdAt: Date.now() });
  const [touched, setTouched] = useState(false);
  const setField = (field: keyof PlanItem, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); setTouched(true); if (!form.title.trim()) return; onSave({ ...form, title: form.title.trim() }); };
  return <div className="modal-backdrop"><section className="form-sheet"><div className="sheet-header"><div><p className="eyebrow">{initial ? 'Perbarui rencana' : 'Rencana baru'}</p><h2>{plan.title}</h2></div><button className="icon-button" onClick={onCancel} aria-label="Tutup"><X size={20} /></button></div><form onSubmit={submit}><label>Nama rencana<input autoFocus value={form.title} onChange={(event) => setField('title', event.target.value)} placeholder="Contoh: Belajar hal baru" />{touched && !form.title.trim() && <small className="field-error">Nama rencana wajib diisi.</small>}</label><label>Deskripsi<textarea value={form.description} onChange={(event) => setField('description', event.target.value)} placeholder="Ceritakan sedikit tentang rencana ini..." rows={3} /></label><div className="form-grid"><label>Target tanggal<input type="date" value={form.date} onChange={(event) => setField('date', event.target.value)} /></label><label>Budget <span>(optional)</span><input type="number" min="0" value={form.budget} onChange={(event) => setField('budget', event.target.value)} placeholder="Rp 0" /></label></div><div className="form-grid"><label>Prioritas<select value={form.priority} onChange={(event) => setField('priority', event.target.value)}>{priorityOptions.map((option) => <option key={option}>{option}</option>)}</select></label><label>Status<select value={form.status} onChange={(event) => setField('status', event.target.value)}>{statusOptions.map((option) => <option key={option}>{option}</option>)}</select></label></div><label>Catatan<textarea value={form.notes} onChange={(event) => setField('notes', event.target.value)} placeholder="Catatan kecil untuk dirimu..." rows={2} /></label><div className="form-actions"><button type="button" className="secondary-button" onClick={onCancel}>Batal</button><button type="submit" className="primary-button">Simpan</button></div></form></section></div>;
}

function DeleteDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) { return <div className="modal-backdrop"><section className="confirm-dialog"><div className="confirm-icon"><Trash2 size={22} /></div><h2>Hapus rencana ini?</h2><p>Rencana yang dihapus tidak bisa dikembalikan.</p><div className="form-actions"><button className="secondary-button" onClick={onCancel}>Batal</button><button className="delete-button" onClick={onConfirm}>Hapus</button></div></section></div>; }
function SettingsDialog({ onClose, onClear }: { onClose: () => void; onClear: () => void }) { return <div className="modal-backdrop"><section className="confirm-dialog"><div className="confirm-icon"><Settings size={22} /></div><h2>Pengaturan</h2><p>Semua rencana tersimpan aman di perangkat ini dan tetap ada saat kamu kembali.</p><button className="secondary-button wide" onClick={onClose}>Tutup</button><button className="clear-button" onClick={onClear}>Hapus semua data lokal</button></section></div>; }

function BottomNav({ activePlanId, onOpen, onHome }: { activePlanId: PlanId | null; onOpen: (id: PlanId) => void; onHome: () => void }) {
  return <nav className="bottom-nav"><button className={!activePlanId ? 'active' : ''} onClick={onHome}><Home size={20} /><span>Beranda</span></button>{plans.map((plan) => { const Icon = plan.icon; return <button key={plan.id} className={activePlanId === plan.id ? 'active' : ''} onClick={() => onOpen(plan.id)}><Icon size={19} /><span>{plan.shortTitle}</span></button>; })}</nav>;
}

export default App;
