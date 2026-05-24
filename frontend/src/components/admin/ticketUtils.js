// ─── Status & Priority configs ─────────────────────────────────────────────────

export const STATUS_CONFIG = {
    NEW:         { label: 'Nou',        color: '#3b82f6', bg: 'bg-blue-500/10 text-blue-400 border-blue-400/30' },
    IN_REVIEW:   { label: 'În analiză', color: '#a855f7', bg: 'bg-purple-500/10 text-purple-400 border-purple-400/30' },
    IN_PROGRESS: { label: 'În lucru',   color: '#f59e0b', bg: 'bg-amber-500/10 text-amber-400 border-amber-400/30' },
    RESOLVED:    { label: 'Rezolvat',   color: '#22c55e', bg: 'bg-green-500/10 text-green-400 border-green-400/30' },
    CLOSED:      { label: 'Închis',     color: '#6b7280', bg: 'bg-gray-500/10 text-gray-400 border-gray-400/30' },
    REJECTED:    { label: 'Respins',    color: '#ef4444', bg: 'bg-red-500/10 text-red-400 border-red-400/30' },
};

export const PRIORITY_CONFIG = {
    CRITICAL: { label: 'Critic',  color: '#ef4444', bg: 'bg-red-500/10 text-red-400 border-red-400/30' },
    HIGH:     { label: 'Ridicat', color: '#f97316', bg: 'bg-orange-500/10 text-orange-400 border-orange-400/30' },
    MEDIUM:   { label: 'Mediu',   color: '#f59e0b', bg: 'bg-amber-500/10 text-amber-400 border-amber-400/30' },
    LOW:      { label: 'Scăzut', color: '#6b7280', bg: 'bg-gray-500/10 text-gray-400 border-gray-400/30' },
};

export const ASSET_CATEGORIES = [
    'Laptop', 'Telefon', 'Monitor', 'Tastatura', 'Mouse', 'Casti', 'Storage', 'Altele'
];

export const getStatus   = (t) => STATUS_CONFIG[(t?.statusCode || t?.status || '').toUpperCase()] ?? STATUS_CONFIG.NEW;
export const getPriority = (t) => PRIORITY_CONFIG[(t?.priority || '').toUpperCase()] ?? PRIORITY_CONFIG.MEDIUM;

export const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMin / 60);
    const diffD = Math.floor(diffH / 24);
    if (diffMin < 2)  return 'acum';
    if (diffMin < 60) return `acum ${diffMin}m`;
    if (diffH < 24)   return `acum ${diffH}h`;
    if (diffD < 7)    return `acum ${diffD}z`;
    return d.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Deduce categoria assetului dupa nume
export const guessCategory = (assetName) => {
    if (!assetName) return 'Altele';
    const s = assetName.toLowerCase();
    if (/laptop|macbook|thinkpad|notebook/.test(s)) return 'Laptop';
    if (/phone|telefon|iphone|samsung|smartphone/.test(s)) return 'Telefon';
    if (/monitor|display|screen/.test(s)) return 'Monitor';
    if (/tastatur|keyboard/.test(s)) return 'Tastatura';
    if (/mouse/.test(s)) return 'Mouse';
    if (/casti|headset|headphone|audio/.test(s)) return 'Casti';
    if (/storage|hdd|ssd|hard/.test(s)) return 'Storage';
    return 'Altele';
};

// Coreleaza emailul dupa authorName din lista de angajati
export const findAuthorEmail = (authorName, employees) => {
    if (!authorName || !employees?.length) return null;
    const lower = authorName.toLowerCase().trim();
    const found = employees.find(emp => {
        const full1 = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        const full2 = `${emp.lastName} ${emp.firstName}`.toLowerCase();
        return full1 === lower || full2 === lower;
    });
    return found?.email || null;
};