'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Zap, LayoutDashboard, Brain, Map as MapIcon, Coins, 
  Award, Clock, XCircle, Users, Settings, ChevronsUpDown, 
  Search, Bell, Plus 
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profileData) setProfile(profileData);
      }
    };
    fetchUser();
  }, [supabase]);

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
      <Link href={href} className={`nav-item ${isActive ? 'active' : ''}`} id={id}>
        <Icon className="nav-icon" size={16} /> {label}
        {badge && <span className="nav-badge">{badge}</span>}
      </Link>
    );
  };

  return (
    <div id="page-dash" className="page active min-h-screen flex">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sb-logo">
          <Link href="/dashboard" className="logo flex items-center gap-2">
            <div className="logo-mark"><Zap size={14} /></div>
            <span className="logo-text serif text-[16px]">GoalForge</span>
          </Link>
        </div>

        <div className="sb-section">
          <div className="sb-section-lbl">Workspace</div>
          <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" id="nav-dashboard" />
          <NavItem href="/dashboard/pathfinder" icon={Brain} label="AI Pathfinder" badge="New" id="nav-pathfinder" />
          <NavItem href="/dashboard/plans" icon={MapIcon} label="My Plans" id="nav-plans" />
          <NavItem href="/dashboard/staking" icon={Coins} label="Staking" id="nav-staking" />
        </div>

        <div className="sb-section mt-2">
          <div className="sb-section-lbl">Progress</div>
          <NavItem href="/dashboard/score" icon={Award} label="Forge Score" id="nav-forge-score" />
          <NavItem href="/dashboard/history" icon={Clock} label="History" id="nav-history" />
          <NavItem href="/dashboard/slag" icon={XCircle} label="Slag Heap" id="nav-slag" />
          <NavItem href="/dashboard/groups" icon={Users} label="Group Goals" id="nav-groups" />
        </div>

        <div className="sb-section mt-2">
          <div className="sb-section-lbl">Account</div>
          <NavItem href="/dashboard/settings" icon={Settings} label="Settings" id="nav-settings" />
        </div>

        <div className="sb-bottom">
          <Link href="/dashboard/settings" className="sb-user">
            <div className="sb-avatar">{user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || 'US'}</div>
            <div>
              <div className="sb-user-name">{user?.user_metadata?.full_name || user?.email || 'User'}</div>
              <div className="sb-user-role">Journeyman · {profile?.forge_score || 0}pts</div>
            </div>
            <ChevronsUpDown size={14} className="text-text3 ml-auto" />
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main-content">
        {/* TOP BAR */}
        <div className="topbar">
          <div className="topbar-left">
            <div className="topbar-title">{getTitle()}</div>
          </div>
          <div className="topbar-right">
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

        <div className="page-body flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
