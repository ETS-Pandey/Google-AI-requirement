
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Package,
  CreditCard,
  Building2,
  ChevronRight,
  Filter,
  ArrowUpRight,
  TrendingUp,
  History,
  Paperclip,
  ShieldCheck,
  AlertCircle,
  Store,
  Clock,
  Trash2,
  Download,
  Eye,
  Briefcase,
  Layers,
  Truck,
  FileCheck2,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { UserRole, User, SOR, SORStatus, SORPriority, Branch, SORAttachment } from './types';
import { MOCK_USERS, MOCK_SORS, BRANCHES, CATEGORIES, getApprovalPath } from './constants';

// --- Global UI Components ---

const Modal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode; 
  footer?: React.ReactNode 
}> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d0f25] border border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
            <XCircle size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && <div className="p-6 border-t border-slate-800 bg-slate-900/30">{footer}</div>}
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: SORStatus }> = ({ status }) => {
  const getColors = () => {
    switch (status) {
      case SORStatus.SUBMITTED_TO_PRINCIPAL: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case SORStatus.APPROVED_BY_PRINCIPAL: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case SORStatus.REJECTED: return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case SORStatus.PO_GENERATED: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case SORStatus.DELIVERED: return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case SORStatus.PAID: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case SORStatus.IN_PROCUREMENT_REVIEW: return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case SORStatus.INVENTORY_CHECK: return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap uppercase tracking-wider ${getColors()}`}>
      {status}
    </span>
  );
};

const PriorityBadge: React.FC<{ priority: SORPriority }> = ({ priority }) => {
  const getColors = () => {
    switch (priority) {
      case SORPriority.HIGH: return 'text-rose-400';
      case SORPriority.MEDIUM: return 'text-amber-400';
      case SORPriority.LOW: return 'text-emerald-400';
    }
  };
  return (
    <span className={`flex items-center gap-1.5 text-xs font-semibold ${getColors()}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
      {priority}
    </span>
  );
};

// --- View Components ---

const DashboardView: React.FC<{ user: User; sors: SOR[]; branches: Branch[] }> = ({ user, sors, branches }) => {
  const relevantSors = useMemo(() => user.branchId === 'GLOBAL' ? sors : sors.filter(s => s.branchId === user.branchId), [user, sors]);
  
  const stats = useMemo(() => ({
    total: relevantSors.length,
    pending: relevantSors.filter(s => ![SORStatus.DELIVERED, SORStatus.REJECTED, SORStatus.PAID].includes(s.status)).length,
    approved: relevantSors.filter(s => s.status === SORStatus.PO_GENERATED || s.status === SORStatus.DELIVERED).length,
    spent: relevantSors.reduce((acc, s) => acc + (s.status === SORStatus.PAID ? s.estimatedCost : 0), 0)
  }), [relevantSors]);

  const isManagement = [UserRole.CEO, UserRole.CFO, UserRole.SUPER_ADMIN, UserRole.FINANCE].includes(user.role);
  const isProcurement = user.role === UserRole.PROCUREMENT;
  const isBranchAdmin = user.role === UserRole.BRANCH_ADMIN || user.role === UserRole.PRINCIPAL;

  const chartData = [
    { name: 'Mon', value: 400 }, { name: 'Tue', value: 300 }, { name: 'Wed', value: 600 },
    { name: 'Thu', value: 800 }, { name: 'Fri', value: 500 }, { name: 'Sat', value: 200 }, { name: 'Sun', value: 400 },
  ];

  const pieData = [
    { name: 'IT', value: 40, color: '#6366f1' },
    { name: 'Maintenance', value: 25, color: '#10b981' },
    { name: 'Stationery', value: 20, color: '#f59e0b' },
    { name: 'HR', value: 15, color: '#ec4899' },
  ];

  const branchComp = branches.map(b => ({
    name: b.name.split(' ')[0],
    spend: b.spent,
    limit: b.budget
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">MISSION CONTROL</h1>
          <p className="text-slate-400 text-sm mt-1">Role Authenticated: <span className="text-indigo-400 font-bold">{user.role.replace('_', ' ')}</span></p>
        </div>
        <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-2">
           <ShieldCheck size={16} className="text-emerald-400" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security: Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: stats.total, icon: FileText, color: 'text-blue-400' },
          { label: 'Action Required', value: stats.pending, icon: Clock, color: 'text-amber-400' },
          { label: 'Asset Lifecycle', value: stats.approved, icon: Package, color: 'text-emerald-400' },
          { label: 'Total Burn', value: `QR ${stats.spent.toLocaleString()}`, icon: CreditCard, color: 'text-indigo-400' },
        ].map((item, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-3xl hover:border-indigo-500/40 transition-all group relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] -mr-12 -mt-12 group-hover:bg-indigo-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-slate-950/50 group-hover:scale-110 transition-transform ${item.color}`}>
                <item.icon size={24} />
              </div>
            </div>
            <div className="text-3xl font-black text-white">{item.value}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-2">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {isManagement ? (
            <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-[2rem] backdrop-blur-sm shadow-xl">
              <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
                <div className="p-2 bg-indigo-500/10 rounded-xl"><Layers size={20} className="text-indigo-400" /></div>
                Global Branch Expenditure
              </h3>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchComp}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.3} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} fontStyle="bold" />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} fontStyle="bold" tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d0f25', border: '1px solid #1e293b', borderRadius: '16px' }} />
                    <Bar dataKey="spend" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="limit" fill="#1e293b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-[2rem] backdrop-blur-sm shadow-xl">
              <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
                <div className="p-2 bg-emerald-500/10 rounded-xl"><TrendingUp size={20} className="text-emerald-400" /></div>
                Request Processing Velocity
              </h3>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.3} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} fontStyle="bold" />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} fontStyle="bold" />
                    <Tooltip contentStyle={{ backgroundColor: '#0d0f25', border: '1px solid #1e293b', borderRadius: '16px' }} />
                    <Area type="monotone" dataKey="value" stroke="#4f46e5" fillOpacity={1} fill="url(#colorValue)" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-[2rem] backdrop-blur-sm">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">Live Activity Stream</h3>
            <div className="space-y-4">
              {relevantSors.slice(0, 4).map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl group cursor-pointer hover:bg-slate-800/40 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform font-black">
                      {s.itemName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{s.itemName}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{s.requesterName} • {s.branchId}</p>
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-[2rem] backdrop-blur-sm">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-8">Asset Categorization</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{d.name} ({d.value}%)</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[2rem] backdrop-blur-sm group hover:bg-indigo-600/20 transition-all duration-500">
            <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Node Intelligence</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">
              Multi-branch synchronization active. All approvals follow established TOFA/FAM protocols.
            </p>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform">
                 <ShieldCheck size={24} />
               </div>
               <div>
                 <p className="text-xs font-black text-white uppercase">System Status</p>
                 <p className="text-[10px] font-black text-emerald-400 uppercase">100% Secure</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Inventory & Asset Hub ---

const InventoryHub: React.FC<{ sors: SOR[]; onUpdate: (s: SOR) => void; onSelect: (s: SOR) => void }> = ({ sors, onUpdate, onSelect }) => {
  const stockQueue = useMemo(() => sors.filter(s => s.status === SORStatus.INVENTORY_CHECK || s.status === SORStatus.PO_GENERATED), [sors]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">Inventory Control Matrix</h1>
        <p className="text-slate-400 text-sm mt-1">Managing asset intake and stock verification across branches.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Pending Stock Verification</h3>
          {stockQueue.filter(s => s.status === SORStatus.INVENTORY_CHECK).length === 0 ? (
            <div className="p-12 bg-slate-900/20 border border-slate-800/60 rounded-[2rem] text-center text-slate-600">
               <Layers size={48} className="mx-auto mb-4 opacity-10" />
               <p className="text-xs font-black uppercase">No items in check queue</p>
            </div>
          ) : (
            stockQueue.filter(s => s.status === SORStatus.INVENTORY_CHECK).map(sor => (
              <div key={sor.id} className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-3xl hover:border-cyan-500/50 transition-all group" onClick={() => onSelect(sor)}>
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 font-black">
                        {sor.itemName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white uppercase">{sor.itemName}</p>
                        <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase">{sor.id}</p>
                      </div>
                   </div>
                   <button className="px-4 py-2 bg-cyan-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-cyan-500 transition-all">Verify Stock</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Awaiting Goods Receipt</h3>
          {stockQueue.filter(s => s.status === SORStatus.PO_GENERATED).length === 0 ? (
            <div className="p-12 bg-slate-900/20 border border-slate-800/60 rounded-[2rem] text-center text-slate-600">
               <Truck size={48} className="mx-auto mb-4 opacity-10" />
               <p className="text-xs font-black uppercase">No incoming shipments</p>
            </div>
          ) : (
            stockQueue.filter(s => s.status === SORStatus.PO_GENERATED).map(sor => (
              <div key={sor.id} className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-3xl hover:border-indigo-500/50 transition-all group" onClick={() => onSelect(sor)}>
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 font-black">
                        {sor.itemName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white uppercase">{sor.itemName}</p>
                        <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase">{sor.id}</p>
                      </div>
                   </div>
                   <button className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-all">Receive Items</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- Finance & Payment Node ---

const FinanceHub: React.FC<{ sors: SOR[]; onUpdate: (s: SOR) => void; onSelect: (s: SOR) => void }> = ({ sors, onUpdate, onSelect }) => {
  const financeQueue = useMemo(() => sors.filter(s => [SORStatus.PENDING_FINANCE, SORStatus.PENDING_CFO, SORStatus.PENDING_CEO, SORStatus.DELIVERED].includes(s.status)), [sors]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">Financial Oversight & Clearing</h1>
        <p className="text-slate-400 text-sm mt-1">Budget verification and payment processing gateway.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-[2.5rem] backdrop-blur-sm shadow-xl">
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
             <FileCheck2 size={18} className="text-indigo-400" /> Pending Approvals
           </h3>
           <div className="space-y-4">
             {financeQueue.filter(s => s.status.includes('Pending')).map(sor => (
               <div key={sor.id} className="flex items-center justify-between p-5 bg-slate-950/40 border border-slate-800/60 rounded-3xl group hover:border-indigo-500/40 transition-all cursor-pointer" onClick={() => onSelect(sor)}>
                 <div>
                    <p className="text-sm font-bold text-white uppercase">{sor.itemName}</p>
                    <p className="text-[10px] font-black text-indigo-400 tracking-widest uppercase mt-1">QR {sor.estimatedCost.toLocaleString()} • {sor.status}</p>
                 </div>
                 <ChevronRight size={20} className="text-slate-600 group-hover:text-white transition-colors" />
               </div>
             ))}
           </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-[2.5rem] backdrop-blur-sm shadow-xl">
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
             <CreditCard size={18} className="text-emerald-400" /> Invoice Clearing Queue
           </h3>
           <div className="space-y-4">
             {financeQueue.filter(s => s.status === SORStatus.DELIVERED).map(sor => (
               <div key={sor.id} className="flex items-center justify-between p-5 bg-slate-950/40 border border-slate-800/60 rounded-3xl group hover:border-emerald-500/40 transition-all cursor-pointer" onClick={() => onSelect(sor)}>
                 <div>
                    <p className="text-sm font-bold text-white uppercase">{sor.itemName}</p>
                    <p className="text-[10px] font-black text-emerald-400 tracking-widest uppercase mt-1">QR {sor.estimatedCost.toLocaleString()} • Payment Ready</p>
                 </div>
                 <button className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-all">Clear Payment</button>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

// --- SOR List & Creation Components ---

// Fix: Implemented missing SORListView component
const SORListView: React.FC<{ sors: SOR[]; onSelect: (s: SOR) => void; onCreate: () => void; user: User }> = ({ sors, onSelect, onCreate, user }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Order Registry</h1>
          <p className="text-slate-400 text-sm mt-1">Registry of all School Operation Requests.</p>
        </div>
        <button 
          onClick={onCreate}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
        >
          <PlusCircle size={18} /> Initiate Request
        </button>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/60 rounded-[2rem] overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/60 bg-slate-900/20">
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ref ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Item / Asset</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Branch</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Priority</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Est. Cost</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {sors.map(sor => (
              <tr 
                key={sor.id} 
                className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                onClick={() => onSelect(sor)}
              >
                <td className="px-6 py-4 text-xs font-black text-indigo-400 font-mono uppercase">{sor.id}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-white">{sor.itemName}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-black">{sor.category}</div>
                </td>
                <td className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{sor.branchId}</td>
                <td className="px-6 py-4"><PriorityBadge priority={sor.priority} /></td>
                <td className="px-6 py-4"><StatusBadge status={sor.status} /></td>
                <td className="px-6 py-4 text-xs font-black text-white">QR {sor.estimatedCost.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <div className="p-2 text-slate-500 group-hover:text-white transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Fix: Implemented missing CreateSORView component
const CreateSORView: React.FC<{ user: User; onSubmit: (s: SOR) => void; onCancel: () => void }> = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: 1,
    purpose: '',
    estimatedCost: 0,
    requiredDate: '',
    category: CATEGORIES[0],
    priority: SORPriority.MEDIUM,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSOR: SOR = {
      id: `SOR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      branchId: user.branchId === 'GLOBAL' ? 'B1' : user.branchId,
      requesterId: user.id,
      requesterName: user.name,
      status: SORStatus.SUBMITTED_TO_PRINCIPAL,
      createdAt: new Date().toISOString(),
      messages: [],
      attachments: [],
      auditLog: [{ action: 'SOR Created', user: user.name, timestamp: new Date().toISOString() }],
      ...formData
    };
    onSubmit(newSOR);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
         <h1 className="text-3xl font-black text-white tracking-tight uppercase">Initiate Request</h1>
         <p className="text-slate-400 text-sm mt-1">Provide clear specifications for efficient node processing.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/40 border border-slate-800/60 p-10 rounded-[2.5rem] backdrop-blur-sm space-y-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Asset Nomenclature</label>
            <input 
              required
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
              placeholder="e.g. Cisco Nexus Switch"
              value={formData.itemName}
              onChange={e => setFormData({ ...formData, itemName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Quantity (Units)</label>
            <input 
              required
              type="number"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition-all"
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Cost Projection (QR)</label>
            <input 
              required
              type="number"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition-all"
              value={formData.estimatedCost}
              onChange={e => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Required Timeline</label>
            <input 
              required
              type="date"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition-all"
              value={formData.requiredDate}
              onChange={e => setFormData({ ...formData, requiredDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Domain</label>
            <select 
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition-all appearance-none"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Priority Vector</label>
            <select 
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition-all appearance-none"
              value={formData.priority}
              onChange={e => setFormData({ ...formData, priority: e.target.value as SORPriority })}
            >
              {Object.values(SORPriority).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Operational Rationale</label>
          <textarea 
            required
            rows={4}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
            placeholder="Detailed explanation for the procurement..."
            value={formData.purpose}
            onChange={e => setFormData({ ...formData, purpose: e.target.value })}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onCancel} className="flex-1 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-black uppercase tracking-widest rounded-2xl transition-all">Cancel Operation</button>
          <button type="submit" className="flex-1 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-500/20">Authorize Request</button>
        </div>
      </form>
    </div>
  );
};

// Fix: Implemented missing SORDetailsView component
const SORDetailsView: React.FC<{ sor: SOR; user: User; onUpdate: (s: SOR) => void; onBack: () => void }> = ({ sor, user, onUpdate, onBack }) => {
  const [msg, setMsg] = useState('');

  const handleAction = (status: SORStatus) => {
    const updated = {
      ...sor,
      status,
      auditLog: [...sor.auditLog, { action: `Status changed to ${status}`, user: user.name, timestamp: new Date().toISOString() }]
    };
    onUpdate(updated);
  };

  const sendMessage = () => {
    if (!msg.trim()) return;
    const newMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      content: msg,
      timestamp: new Date().toISOString(),
    };
    onUpdate({ ...sor, messages: [...sor.messages, newMessage] });
    setMsg('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all">
          <Layers size={20} className="rotate-180" />
        </button>
        <div>
           <div className="flex items-center gap-3">
             <h1 className="text-2xl font-black text-white uppercase tracking-tight">{sor.itemName}</h1>
             <StatusBadge status={sor.status} />
           </div>
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{sor.id} • Initiated by {sor.requesterName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/40 border border-slate-800/60 p-10 rounded-[2.5rem] backdrop-blur-sm shadow-xl">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Asset Specifications</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Quantity</p>
                  <p className="text-lg font-black text-white">{sor.quantity}</p>
               </div>
               <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Est. Cost</p>
                  <p className="text-lg font-black text-indigo-400">QR {sor.estimatedCost.toLocaleString()}</p>
               </div>
               <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Domain</p>
                  <p className="text-lg font-black text-white">{sor.category}</p>
               </div>
               <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Priority</p>
                  <PriorityBadge priority={sor.priority} />
               </div>
             </div>
             <div className="mt-8 pt-8 border-t border-slate-800/40">
                <p className="text-[10px] text-slate-500 uppercase font-black mb-4">Operational Rationale</p>
                <p className="text-slate-300 text-sm leading-relaxed">{sor.purpose}</p>
             </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/60 p-10 rounded-[2.5rem] backdrop-blur-sm shadow-xl">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex justify-between items-center">
               Nexus Communications
               <MessageSquare size={16} />
             </h3>
             <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar mb-8">
               {sor.messages.length === 0 ? (
                 <div className="text-center py-10 opacity-20">
                   <MessageSquare size={48} className="mx-auto mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest">No communications on record</p>
                 </div>
               ) : (
                 sor.messages.map(m => (
                   <div key={m.id} className={`flex flex-col ${m.userId === user.id ? 'items-end' : 'items-start'}`}>
                     <div className={`max-w-[80%] p-4 rounded-3xl ${m.userId === user.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800/60 text-slate-200 rounded-tl-none'}`}>
                        <p className="text-xs leading-relaxed">{m.content}</p>
                     </div>
                     <span className="text-[9px] font-black text-slate-600 uppercase mt-2">{m.userName} • {m.userRole.replace('_', ' ')} • {new Date(m.timestamp).toLocaleTimeString()}</span>
                   </div>
                 ))
               )}
             </div>
             <div className="flex gap-4">
                <input 
                  className="flex-1 bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder="Broadcast message to node..."
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage} className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-lg shadow-indigo-500/20">
                  <ArrowUpRight size={20} />
                </button>
             </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-[2rem] backdrop-blur-sm">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Action Hub</h3>
             <div className="space-y-3">
               {user.role === UserRole.PRINCIPAL && sor.status === SORStatus.SUBMITTED_TO_PRINCIPAL && (
                 <>
                   <button onClick={() => handleAction(SORStatus.APPROVED_BY_PRINCIPAL)} className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-500/20">Authorize Approval</button>
                   <button onClick={() => handleAction(SORStatus.REJECTED)} className="w-full px-6 py-4 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border border-rose-500/20">Decline Request</button>
                   <button onClick={() => handleAction(SORStatus.CLARIFICATION_REQUIRED)} className="w-full px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border border-slate-700">Request Clarification</button>
                 </>
               )}
               {user.role === UserRole.PROCUREMENT && sor.status === SORStatus.APPROVED_BY_PRINCIPAL && (
                 <button onClick={() => handleAction(SORStatus.IN_PROCUREMENT_REVIEW)} className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">Begin Market Sourcing</button>
               )}
               {user.role === UserRole.PROCUREMENT && sor.status === SORStatus.IN_PROCUREMENT_REVIEW && (
                 <button onClick={() => handleAction(SORStatus.INVENTORY_CHECK)} className="w-full px-6 py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">Initiate Inventory Check</button>
               )}
               {user.role === UserRole.INVENTORY && sor.status === SORStatus.INVENTORY_CHECK && (
                 <button onClick={() => handleAction(SORStatus.PENDING_FINANCE)} className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">Cleared: No Stock Available</button>
               )}
               {user.role === UserRole.FINANCE && sor.status === SORStatus.PENDING_FINANCE && (
                 <button onClick={() => handleAction(SORStatus.PENDING_CFO)} className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">Verify Budget Allocation</button>
               )}
               {user.role === UserRole.CFO && sor.status === SORStatus.PENDING_CFO && (
                 <button onClick={() => handleAction(SORStatus.APPROVED_FOR_PO)} className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">Sign CFO Authorization</button>
               )}
               {user.role === UserRole.PROCUREMENT && sor.status === SORStatus.APPROVED_FOR_PO && (
                 <button onClick={() => handleAction(SORStatus.PO_GENERATED)} className="w-full px-6 py-4 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">Generate & Sync PO</button>
               )}
               {user.role === UserRole.INVENTORY && sor.status === SORStatus.PO_GENERATED && (
                 <button onClick={() => handleAction(SORStatus.DELIVERED)} className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">Confirm Asset Receipt</button>
               )}
               {user.role === UserRole.FINANCE && sor.status === SORStatus.DELIVERED && (
                 <button onClick={() => handleAction(SORStatus.PAID)} className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">Execute Payment Gateway</button>
               )}
               <p className="text-[9px] text-slate-600 font-bold text-center mt-4">Node actions restricted by role-based clearance.</p>
             </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-[2rem] backdrop-blur-sm">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
               <History size={16} /> Audit Trail
             </h3>
             <div className="space-y-6">
               {sor.auditLog.map((log, i) => (
                 <div key={i} className="flex gap-4 relative">
                   {i !== sor.auditLog.length - 1 && <div className="absolute left-[7px] top-4 w-[1px] h-10 bg-slate-800" />}
                   <div className="w-3.5 h-3.5 rounded-full bg-indigo-500/40 border border-indigo-500 ring-4 ring-indigo-500/10 mt-1" />
                   <div>
                      <p className="text-xs font-bold text-white uppercase leading-none">{log.action}</p>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">{log.user} • {new Date(log.timestamp).toLocaleDateString()}</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fix: Implemented missing ProcurementSourcingView component
const ProcurementSourcingView: React.FC<{ sors: SOR[]; onUpdate: (s: SOR) => void; onSelect: (s: SOR) => void }> = ({ sors, onUpdate, onSelect }) => {
  const sourcingQueue = useMemo(() => sors.filter(s => [SORStatus.APPROVED_BY_PRINCIPAL, SORStatus.IN_PROCUREMENT_REVIEW, SORStatus.APPROVED_FOR_PO].includes(s.status)), [sors]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">Sourcing Command Center</h1>
        <p className="text-slate-400 text-sm mt-1">Market evaluation and vendor synchronization node.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'New Approvals', status: SORStatus.APPROVED_BY_PRINCIPAL, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { title: 'Market Review', status: SORStatus.IN_PROCUREMENT_REVIEW, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { title: 'PO Ready', status: SORStatus.APPROVED_FOR_PO, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map(col => (
          <div key={col.status} className="space-y-4">
             <div className={`p-4 rounded-2xl ${col.bg} border border-slate-800 flex justify-between items-center`}>
                <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${col.color}`}>{col.title}</h3>
                <span className="text-xs font-black text-white px-2 py-0.5 bg-slate-900 rounded-lg">{sourcingQueue.filter(s => s.status === col.status).length}</span>
             </div>
             <div className="space-y-3">
               {sourcingQueue.filter(s => s.status === col.status).map(sor => (
                 <div key={sor.id} onClick={() => onSelect(sor)} className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-3xl hover:border-indigo-500/50 transition-all cursor-pointer group">
                    <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors uppercase">{sor.itemName}</p>
                    <div className="flex justify-between items-center mt-4">
                       <span className="text-[9px] font-black text-slate-500 uppercase">{sor.branchId}</span>
                       <span className="text-xs font-black text-white">QR {sor.estimatedCost.toLocaleString()}</span>
                    </div>
                 </div>
               ))}
               {sourcingQueue.filter(s => s.status === col.status).length === 0 && (
                 <div className="py-10 text-center bg-slate-950/20 border border-dashed border-slate-800 rounded-3xl opacity-30">
                    <p className="text-[9px] font-black uppercase tracking-widest">Queue Clear</p>
                 </div>
               )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App Implementation ---

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0]);
  const [activeView, setActiveView] = useState<'dashboard' | 'sors' | 'sourcing' | 'inventory' | 'finance' | 'users' | 'settings'>('dashboard');
  const [allSors, setAllSors] = useState<SOR[]>(MOCK_SORS);
  const [selectedSor, setSelectedSor] = useState<SOR | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Persistence simulation (keep selection when updating)
  useEffect(() => {
    if (selectedSor) {
      const refreshed = allSors.find(s => s.id === selectedSor.id);
      if (refreshed) setSelectedSor(refreshed);
    }
  }, [allSors]);

  const visibleSors = useMemo(() => {
    if ([UserRole.SUPER_ADMIN, UserRole.CEO, UserRole.CFO, UserRole.PROCUREMENT, UserRole.FINANCE].includes(currentUser?.role as UserRole)) {
      return allSors;
    }
    return allSors.filter(s => s.branchId === currentUser?.branchId);
  }, [allSors, currentUser]);

  const handleUpdateSor = (updatedSor: SOR) => {
    setAllSors(prev => prev.map(s => s.id === updatedSor.id ? updatedSor : s));
  };

  const handleCreateSor = (newSOR: SOR) => {
    setAllSors(prev => [newSOR, ...prev]);
    setIsCreating(false);
    setActiveView('sors');
  };

  if (!currentUser) return null;

  const getSidebarItems = () => {
    const items = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'sors', label: 'Order Registry', icon: FileText },
    ];
    if ([UserRole.PROCUREMENT, UserRole.SUPER_ADMIN].includes(currentUser.role)) {
      items.push({ id: 'sourcing', label: 'Sourcing Hub', icon: Store });
    }
    if ([UserRole.INVENTORY, UserRole.SUPER_ADMIN].includes(currentUser.role)) {
      items.push({ id: 'inventory', label: 'Inventory Node', icon: Layers });
    }
    if ([UserRole.FINANCE, UserRole.CFO, UserRole.CEO, UserRole.SUPER_ADMIN].includes(currentUser.role)) {
      items.push({ id: 'finance', label: 'Finance Matrix', icon: FileCheck2 });
    }
    items.push({ id: 'users', label: 'Staff Node', icon: Users });
    items.push({ id: 'settings', label: 'Global Config', icon: Settings });
    return items;
  };

  return (
    <div className="min-h-screen flex bg-[#03040b] text-slate-200 overflow-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>

      <aside className="w-80 border-r border-slate-800/40 bg-[#050610]/95 backdrop-blur-3xl flex flex-col sticky top-0 h-screen z-50">
        <div className="p-10">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-indigo-500/40 ring-4 ring-indigo-500/10">
              <Building2 className="text-white" size={32} />
            </div>
            <div>
              <h1 className="font-black text-white text-xl tracking-tighter leading-none">EDISON QATAR</h1>
              <p className="text-[10px] text-indigo-400 font-black tracking-[0.4em] uppercase mt-1">Nexus CRM</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {getSidebarItems().map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id as any); setSelectedSor(null); setIsCreating(false); }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all group border ${
                  activeView === item.id 
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-500/20' 
                  : 'text-slate-500 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
                }`}
              >
                <item.icon size={20} className={activeView === item.id ? 'text-white' : 'group-hover:text-indigo-400 transition-colors'} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-10 border-t border-slate-800/40">
          <div className="p-5 rounded-[1.5rem] bg-slate-900/40 border border-slate-800/60 mb-8 backdrop-blur-sm group hover:border-indigo-500/50 transition-all cursor-default overflow-hidden relative">
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-800 flex items-center justify-center font-black text-white shadow-lg group-hover:scale-110 transition-transform">
                {currentUser.name[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-black text-white truncate">{currentUser.name}</p>
                <p className="text-[9px] text-indigo-400 uppercase font-black tracking-[0.2em] mt-1 truncate">{currentUser.role.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
          <button className="w-full flex items-center gap-4 px-6 py-4 text-slate-500 hover:text-rose-400 transition-all text-[11px] font-black uppercase tracking-widest bg-slate-900/20 hover:bg-rose-500/5 rounded-2xl border border-transparent hover:border-rose-500/20">
            <LogOut size={20} /> Terminate
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-24 border-b border-slate-800/40 bg-[#03040b]/80 backdrop-blur-2xl flex items-center justify-between px-12 sticky top-0 z-40">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase">{currentUser.branchId} NODE</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-800/60" />
            <div className="flex items-center gap-2 group cursor-pointer">
              <Search className="text-slate-500 group-hover:text-indigo-400 transition-colors" size={18} />
              <span className="text-xs font-bold text-slate-600 group-hover:text-slate-400 transition-colors">Global Search Node...</span>
            </div>
          </div>

          <div className="flex gap-6 items-center">
             <div className="relative group">
                <button className="p-3 text-slate-400 hover:text-white transition-all bg-slate-900 border border-slate-800 rounded-xl relative hover:border-indigo-500">
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-900" />
                </button>
             </div>
             <div className="h-8 w-[1px] bg-slate-800/60" />
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Authorization Hub</span>
                <select 
                  className="bg-slate-900 border border-slate-800 text-[11px] font-black text-indigo-400 rounded-xl px-4 py-2 focus:outline-none cursor-pointer hover:border-indigo-500 transition-all uppercase"
                  onChange={(e) => {
                    const user = MOCK_USERS.find(u => u.role === e.target.value) || MOCK_USERS[0];
                    setCurrentUser(user);
                    setActiveView('dashboard');
                    setSelectedSor(null);
                  }}
                  value={currentUser.role}
                >
                  {Object.values(UserRole).map(r => <option key={r} value={r} className="bg-slate-900 font-sans">{r.replace('_', ' ')}</option>)}
                </select>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 bg-gradient-to-b from-[#03040b] via-[#050610] to-[#03040b] custom-scrollbar">
          {selectedSor ? (
            <SORDetailsView 
              sor={selectedSor} 
              user={currentUser} 
              onUpdate={handleUpdateSor} 
              onBack={() => setSelectedSor(null)} 
            />
          ) : isCreating ? (
            <CreateSORView 
              user={currentUser} 
              onSubmit={handleCreateSor} 
              onCancel={() => setIsCreating(false)} 
            />
          ) : activeView === 'dashboard' ? (
            <DashboardView user={currentUser} sors={allSors} branches={BRANCHES} />
          ) : activeView === 'sors' ? (
            <SORListView 
              sors={visibleSors} 
              onSelect={setSelectedSor} 
              onCreate={() => setIsCreating(true)} 
              user={currentUser}
            />
          ) : activeView === 'sourcing' ? (
            <ProcurementSourcingView sors={allSors} onUpdate={handleUpdateSor} onSelect={setSelectedSor} />
          ) : activeView === 'inventory' ? (
            <InventoryHub sors={allSors} onUpdate={handleUpdateSor} onSelect={setSelectedSor} />
          ) : activeView === 'finance' ? (
            <FinanceHub sors={allSors} onUpdate={handleUpdateSor} onSelect={setSelectedSor} />
          ) : (
            <div className="h-full flex items-center justify-center">
               <div className="text-center p-20 bg-slate-900/20 border border-slate-800/40 rounded-[3rem] backdrop-blur-xl">
                  <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <Settings size={48} className="text-slate-600" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Sector Restricted</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Configuration access requires Alpha-9 level clearance.</p>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
