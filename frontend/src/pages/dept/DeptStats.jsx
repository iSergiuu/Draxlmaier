import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, Ticket, Package, CheckCircle2, AlertCircle, Circle, Clock, TrendingUp } from 'lucide-react';

const API = 'http://localhost:8080/api';
const token = () => localStorage.getItem('token');

function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg" style={{ background: color + '20' }}>
                <Icon size={20} style={{ color }} />
            </div>
            <div>
                <p className="text-2xl font-bold text-brand-text">{value ?? 0}</p>
                <p className="text-xs text-brand-muted">{label}</p>
            </div>
        </div>
    );
}

function MonthBar({ label, value, max }) {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="flex items-end gap-2">
            <div className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-brand-muted font-medium">{value > 0 ? value : ''}</span>
                <div className="w-full bg-brand-bg rounded-t-sm" style={{ height: '80px' }}>
                    <div
                        className="w-full rounded-t-sm transition-all duration-500"
                        style={{ height: `${pct}%`, background: 'var(--brand-primary)', minHeight: value > 0 ? '4px' : '0' }}
                    />
                </div>
                <span className="text-[10px] text-brand-muted">{label}</span>
            </div>
        </div>
    );
}

export default function DeptStats() {
    const { me } = useOutletContext();

    const [tickets,   setTickets]   = useState([]);
    const [employees, setEmployees] = useState([]);
    const [assets,    setAssets]    = useState([]);
    const [loading,   setLoading]   = useState(true);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [tRes, eRes, aRes] = await Promise.all([
                fetch(`${API}/complaints`, { headers: { 'Authorization': `Bearer ${token()}` } }),
                fetch(`${API}/employees`,  { headers: { 'Authorization': `Bearer ${token()}` } }),
                fetch(`${API}/assets`,     { headers: { 'Authorization': `Bearer ${token()}` } }),
            ]);
            if (tRes.ok) setTickets(await tRes.json());
            if (eRes.ok) setEmployees(await eRes.json());
            if (aRes.ok) setAssets(await aRes.json());
        } catch {}
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    if (!me) return null;

    const deptName = me.departmentName;

    // Filtrare pe departament
    const deptEmployees = employees.filter(e => e.departmentName === deptName);
    const deptAssets    = assets.filter(a => {
        const emp = employees.find(e => e.id === a.assignedToId || e.email === a.assignedToEmail);
        return emp?.departmentName === deptName;
    });

    // Tickets create de angajatii din departament
    const deptTickets = tickets.filter(t => {
        const author = employees.find(e => {
            const full1 = `${e.firstName} ${e.lastName}`.toLowerCase();
            const full2 = `${e.lastName} ${e.firstName}`.toLowerCase();
            return full1 === (t.authorName || '').toLowerCase() || full2 === (t.authorName || '').toLowerCase();
        });
        return author?.departmentName === deptName;
    });

    const ticketNew      = deptTickets.filter(t => (t.statusCode||'').toUpperCase() === 'NEW').length;
    const ticketProgress = deptTickets.filter(t => ['IN_PROGRESS','IN_REVIEW'].includes((t.statusCode||'').toUpperCase())).length;
    const ticketResolved = deptTickets.filter(t => ['RESOLVED','CLOSED'].includes((t.statusCode||'').toUpperCase())).length;
    const ticketRejected = deptTickets.filter(t => (t.statusCode||'').toUpperCase() === 'REJECTED').length;

    const empActive    = deptEmployees.filter(e => e.isActive).length;
    const empGenerated = deptEmployees.filter(e => !e.isActive).length;

    const assetAvail   = deptAssets.filter(a => (a.status||'').toUpperCase() === 'AVAILABLE').length;
    const assetAssign  = deptAssets.filter(a => (a.status||'').toUpperCase() === 'ASSIGNED').length;
    const assetDefect  = deptAssets.filter(a => (a.status||'').toUpperCase() === 'DEFECTIVE').length;

    // Grafic tichete pe ultimele 6 luni
    const monthLabels = [];
    const monthCounts = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthLabels.push(d.toLocaleDateString('ro-RO', { month: 'short' }));
        const count = deptTickets.filter(t => {
            const td = new Date(t.createdAt);
            return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth();
        }).length;
        monthCounts.push(count);
    }
    const maxMonth = Math.max(...monthCounts, 1);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-brand-text">Statistici — {deptName}</h3>

            {/* Tichete */}
            <div>
                <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3">Tichete</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Total tichete" value={deptTickets.length} icon={Ticket}       color="#3b82f6" />
                    <StatCard label="Noi"            value={ticketNew}         icon={Circle}       color="#a855f7" />
                    <StatCard label="În lucru"       value={ticketProgress}    icon={AlertCircle}  color="#f59e0b" />
                    <StatCard label="Rezolvate"      value={ticketResolved}    icon={CheckCircle2} color="#22c55e" />
                </div>
            </div>

            {/* Grafic luni */}
            <div className="bg-brand-card border border-brand-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={16} className="text-brand-primary" />
                    <p className="text-sm font-semibold text-brand-text">Tichete pe ultimele 6 luni</p>
                </div>
                <div className="grid grid-cols-6 gap-2 items-end" style={{ height: '120px' }}>
                    {monthLabels.map((label, i) => (
                        <MonthBar key={label} label={label} value={monthCounts[i]} max={maxMonth} />
                    ))}
                </div>
            </div>

            {/* Angajati */}
            <div>
                <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3">Angajați</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatCard label="Total angajați"    value={deptEmployees.length} icon={Users}  color="#3b82f6" />
                    <StatCard label="Activi"            value={empActive}            icon={Users}  color="#22c55e" />
                    <StatCard label="Conturi generate"  value={empGenerated}         icon={Clock}  color="#f59e0b" />
                </div>
            </div>

            {/* Asseturi */}
            <div>
                <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3">Echipamente</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatCard label="Total echipamente" value={deptAssets.length} icon={Package}      color="#3b82f6" />
                    <StatCard label="Disponibile"       value={assetAvail}        icon={CheckCircle2} color="#22c55e" />
                    <StatCard label="Atribuite"         value={assetAssign}       icon={Package}      color="#a855f7" />
                </div>
            </div>
        </div>
    );
}