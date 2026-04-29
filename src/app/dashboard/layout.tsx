'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Zap, LayoutDashboard, Brain, Map as MapIcon, Coins, 
  Award, Clock, XCircle, Users, Settings, ChevronsUpDown, 
  Search, Bell, Plus 
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileData) setProfile(profileData);
      setAuthChecked(true);
    };
    fetchUser();
  }, [supabase, router]);

  if (!authChecked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text3)' }}>
        Loading...
      </div>
    );
  }

  const getTitle = () => {
    if (pathname.includes('/pathfinder')) return 'AI Pathfinder';
    if (pathname.includes('/plans')) return 'My Plans';
    if (pathname.includes('/staking')) return 'Staking';
    if (pathname.includes('/score')) return 'Forge Score';
    if (pathname.includes('/history')) return 'History';
    if (pathname.includes('/slag')) return 'Slag Heap';
    if (pathname.includes('/groups')) return 'Group Goals';
    if (pathname.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  const NavItem = ({ href, icon: Icon, label, badge, id }: { href: string, icon: any, label: string, badge?: string, id: string }) => {
    const isActive = href === '/dashboard' ? pathname === href : pathname.startsWith(href);
    return (
      <Link href={href} className={`nav-item ${isActive ? 'active' : ''}`} id={id} title={sidebarCollapsed ? label : undefined}>
        <Icon className="nav-icon shrink-0" size={16} /> 
        {!sidebarCollapsed && <span className="whitespace-nowrap">{label}</span>}
        {!sidebarCollapsed && badge && <span className="nav-badge">{badge}</span>}
      </Link>
    );
  };

  return (
    <div id="page-dash" className="page active min-h-screen flex">
      {/* SIDEBAR */}
      <aside className="sidebar transition-all duration-300" style={{ width: sidebarCollapsed ? '72px' : 'var(--sidebar)' }}>
        <div className="sb-logo flex items-center justify-between">
          {!sidebarCollapsed ? (
            <Link href="/dashboard" className="logo flex items-center gap-2 overflow-hidden">
              <div className="logo-mark shrink-0"><Zap size={14} /></div>
              <span className="logo-text serif text-[16px] whitespace-nowrap">GoalForge</span>
            </Link>
          ) : (
            <div className="logo flex items-center justify-center w-full">
              <div className="logo-mark shrink-0"><Zap size={14} /></div>
            </div>
          )}
        </div>

        <div className="sb-section">
          {!sidebarCollapsed && <div className="sb-section-lbl">Workspace</div>}
          <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" id="nav-dashboard" />
          <NavItem href="/dashboard/pathfinder" icon={Brain} label="AI Pathfinder" badge="New" id="nav-pathfinder" />
          <NavItem href="/dashboard/plans" icon={MapIcon} label="My Plans" id="nav-plans" />
          <NavItem href="/dashboard/staking" icon={Coins} label="Staking" id="nav-staking" />
        </div>

        <div className="sb-section mt-2">
          {!sidebarCollapsed && <div className="sb-section-lbl">Progress</div>}
          <NavItem href="/dashboard/score" icon={Award} label="Forge Score" id="nav-forge-score" />
          <NavItem href="/dashboard/history" icon={Clock} label="History" id="nav-history" />
          <NavItem href="/dashboard/slag" icon={XCircle} label="Slag Heap" id="nav-slag" />
          <NavItem href="/dashboard/groups" icon={Users} label="Group Goals" id="nav-groups" />
        </div>

        <div className="sb-section mt-2">
          {!sidebarCollapsed && <div className="sb-section-lbl">Account</div>}
          <NavItem href="/dashboard/settings" icon={Settings} label="Settings" id="nav-settings" />
        </div>

        <div className="sb-bottom mt-auto">
          <Link href="/dashboard/settings" className="sb-user overflow-hidden flex items-center justify-center" title={sidebarCollapsed ? "Settings" : undefined}>
            <div className="sb-avatar shrink-0">{user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || 'US'}</div>
            {!sidebarCollapsed && (
              <div className="ml-2 overflow-hidden">
                <div className="sb-user-name truncate">{user?.user_metadata?.full_name || user?.email || 'User'}</div>
                <div className="sb-user-role truncate">Journeyman · {profile?.forge_score || 0}pts</div>
              </div>
            )}
            {!sidebarCollapsed && <ChevronsUpDown size={14} className="text-text3 shrink-0 ml-auto" />}
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main-content">
        {/* TOP BAR */}
        <div className="topbar flex items-center shrink-0">
          <div className="topbar-left flex items-center gap-4">
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded bg-[var(--bg3)] border border-[var(--border)] text-[var(--text2)] hover:text-white transition-colors flex items-center justify-center"
              aria-label="Toggle sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div className="topbar-title">{getTitle()}</div>
          </div>
          <div className="topbar-right ml-auto">
            <div className="search-box">
              <Search size={14} className="text-text3 shrink-0" />
              <input placeholder="Search goals..." />
            </div>
            <button className="btn-icon">
              <Bell size={16} />
            </button>
            <Link href="/dashboard/pathfinder" className="btn btn-amber btn-sm">
              <Plus size={14} /> New goal
            </Link>
          </div>
        </div>

        <div className={`page-body flex-1 flex flex-col ${pathname.includes('/pathfinder') ? '!p-0' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
