'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profileData) setProfile(profileData);
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [supabase]);

  if (isLoading) return <div className="p-10 text-center">Loading settings...</div>;

  return (
    <div className="view active" id="view-settings">
      <div className="view-header">
        <div className="view-h serif">Settings</div>
      </div>
      <div className="settings-grid">
        <div className="settings-nav">
          <div className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</div>
          <div className={`settings-nav-item ${activeTab === 'notif' ? 'active' : ''}`} onClick={() => setActiveTab('notif')}>Notifications</div>
          <div className={`settings-nav-item ${activeTab === 'verif' ? 'active' : ''}`} onClick={() => setActiveTab('verif')}>Verifications</div>
          <div className={`settings-nav-item ${activeTab === 'stake' ? 'active' : ''}`} onClick={() => setActiveTab('stake')}>Staking</div>
          <div className={`settings-nav-item ${activeTab === 'danger' ? 'active' : ''}`} onClick={() => setActiveTab('danger')}>Danger zone</div>
        </div>
        <div>
          {activeTab === 'profile' && (
            <div className="settings-section active" id="s-profile">
              <div className="settings-h">Profile</div>
              <div className="form-group"><label className="label">Display name</label><input className="input" defaultValue={user?.user_metadata?.full_name || 'User'} /></div>
              <div className="form-group"><label className="label">Email</label><input className="input" defaultValue={user?.email || ''} readOnly /></div>
              <div className="form-group"><label className="label">Username</label><input className="input" defaultValue={user?.user_metadata?.username || ''} /></div>
              <button className="btn btn-amber">Save changes</button>
            </div>
          )}
          {activeTab === 'notif' && (
            <div className="settings-section active" id="s-notif">
              <div className="settings-h">Notifications</div>
              <div className="settings-row"><div><div className="settings-row-label">Daily task reminder</div><div className="settings-row-sub">Get notified at 8AM about today's tasks</div></div><label className="toggle"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label></div>
              <div className="settings-row"><div><div className="settings-row-label">Verification alerts</div><div className="settings-row-sub">Know when passive verification runs</div></div><label className="toggle"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label></div>
              <div className="settings-row"><div><div className="settings-row-label">Streak warnings</div><div className="settings-row-sub">Alert when you're about to break a streak</div></div><label className="toggle"><input type="checkbox" /><span className="toggle-slider"></span></label></div>
              <div className="settings-row"><div><div className="settings-row-label">Forge Score updates</div><div className="settings-row-sub">Weekly score report</div></div><label className="toggle"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label></div>
            </div>
          )}
          {activeTab === 'verif' && (
            <div className="settings-section active" id="s-verif">
              <div className="settings-h">Verification connections</div>
              <div className="settings-row"><div><div className="settings-row-label">GitHub</div><div className="settings-row-sub" style={{ color: 'var(--green)' }}>Connected · @{user?.user_metadata?.username || 'user'}</div></div><button className="btn btn-danger btn-sm">Disconnect</button></div>
              <div className="settings-row"><div><div className="settings-row-label">Google Calendar</div><div className="settings-row-sub" style={{ color: 'var(--green)' }}>Connected</div></div><button className="btn btn-danger btn-sm">Disconnect</button></div>
              <div className="settings-row"><div><div className="settings-row-label">GPS / Location</div><div className="settings-row-sub" style={{ color: 'var(--green)' }}>Connected</div></div><button className="btn btn-danger btn-sm">Disconnect</button></div>
              <div className="settings-row"><div><div className="settings-row-label">Health Connect</div><div className="settings-row-sub" style={{ color: 'var(--amber)' }}>Not connected</div></div><button className="btn btn-amber btn-sm">Connect</button></div>
            </div>
          )}
          {activeTab === 'stake' && (
            <div className="settings-section active" id="s-stake">
              <div className="settings-h">Staking preferences</div>
              <div className="settings-row"><div><div className="settings-row-label">Auto-stake on commit</div><div className="settings-row-sub">Automatically lock stake when a plan is confirmed</div></div><label className="toggle"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label></div>
              <div className="form-group" style={{ marginTop: '16px' }}><label className="label">Default stake amount (₹)</label><input className="input" type="number" defaultValue={profile?.default_stake || 5000} /></div>
              <div className="form-group"><label className="label">Minimum stake per day</label><input className="input" type="number" defaultValue="150" /></div>
            </div>
          )}
          {activeTab === 'danger' && (
            <div className="settings-section active" id="s-danger">
              <div className="settings-h">Danger zone</div>
              <div className="card" style={{ borderColor: 'rgba(224,92,92,.2)', background: 'var(--redDim)' }}>
                <div className="flex-between">
                  <div><div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--red)' }}>Delete account</div><div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '3px' }}>Permanently delete your account and all data. Stakes will be forfeited.</div></div>
                  <button className="btn btn-danger btn-sm">Delete</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
