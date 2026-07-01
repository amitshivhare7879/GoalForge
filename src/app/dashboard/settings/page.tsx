'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Controlled inputs for profile tab (FIX 3.8 / M-11)
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profileData) {
          setProfile(profileData);
          setDisplayName(profileData.display_name || user.user_metadata?.full_name || '');
          setUsername(profileData.username || user.user_metadata?.username || '');
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [supabase]);

  // FIX M-11: Actually persist the profile changes to Supabase
  const handleProfileSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveMsg('');
    const { error } = await supabase.from('profiles').update({
      display_name: displayName,
      username: username,
    }).eq('id', user.id);

    if (error) {
      setSaveMsg('Failed to save changes. Please try again.');
    } else {
      setSaveMsg('Changes saved successfully!');
      setProfile({ ...profile, display_name: displayName, username });
    }
    setIsSaving(false);
    setTimeout(() => setSaveMsg(''), 3000);
  };

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
              {/* FIX M-11: Use controlled inputs so values are persisted on save */}
              <div className="form-group">
                <label className="label">Display name</label>
                <input
                  className="input"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>
              <div className="form-group">
                <label className="label">Email</label>
                <input className="input" defaultValue={user?.email || ''} readOnly />
              </div>
              <div className="form-group">
                <label className="label">Username</label>
                <input
                  className="input"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="your_username"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="btn btn-amber" onClick={handleProfileSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
                {saveMsg && (
                  <span style={{
                    fontSize: 12, fontWeight: 600,
                    color: saveMsg.includes('Failed') ? 'var(--red)' : 'var(--green)'
                  }}>
                    {saveMsg}
                  </span>
                )}
              </div>
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

              {/* GitHub */}
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">GitHub</div>
                  <div className="settings-row-sub" style={{ color: profile?.github_handle ? 'var(--green)' : 'var(--text3)' }}>
                    {profile?.github_handle ? `Connected · @${profile.github_handle}` : 'Not connected'}
                  </div>
                </div>
                {profile?.github_handle ? (
                  <button className="btn btn-danger btn-sm" onClick={async () => {
                    await supabase.from('profiles').update({ github_handle: null }).eq('id', user.id);
                    setProfile({ ...profile, github_handle: null });
                  }}>Disconnect</button>
                ) : (
                  <input
                    className="input" style={{ width: 200, padding: '6px 12px', fontSize: 13 }}
                    placeholder="Enter GitHub username"
                    onKeyDown={async (e: any) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        const handle = e.target.value.trim().replace(/^@/, '');
                        await supabase.from('profiles').update({ github_handle: handle }).eq('id', user.id);
                        setProfile({ ...profile, github_handle: handle });
                        e.target.value = '';
                      }
                    }}
                  />
                )}
              </div>

              {/* LeetCode */}
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">LeetCode</div>
                  <div className="settings-row-sub" style={{ color: profile?.leetcode_handle ? 'var(--green)' : 'var(--text3)' }}>
                    {profile?.leetcode_handle ? `Connected · @${profile.leetcode_handle}` : 'Not connected'}
                  </div>
                </div>
                {profile?.leetcode_handle ? (
                  <button className="btn btn-danger btn-sm" onClick={async () => {
                    await supabase.from('profiles').update({ leetcode_handle: null }).eq('id', user.id);
                    setProfile({ ...profile, leetcode_handle: null });
                  }}>Disconnect</button>
                ) : (
                  <input
                    className="input" style={{ width: 200, padding: '6px 12px', fontSize: 13 }}
                    placeholder="Enter LeetCode username"
                    onKeyDown={async (e: any) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        const handle = e.target.value.trim().replace(/^@/, '');
                        await supabase.from('profiles').update({ leetcode_handle: handle }).eq('id', user.id);
                        setProfile({ ...profile, leetcode_handle: handle });
                        e.target.value = '';
                      }
                    }}
                  />
                )}
              </div>

              {/* GPS — coming soon */}
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">GPS / Location</div>
                  <div className="settings-row-sub">Use browser geolocation for physical presence checks</div>
                </div>
                <button className="btn btn-amber btn-sm" onClick={() => {
                  navigator.geolocation.getCurrentPosition(
                    () => alert('GPS permission granted!'),
                    () => alert('GPS permission denied. Enable in browser settings.')
                  );
                }}>Test GPS</button>
              </div>

              {/* Health Connect */}
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">Health Connect</div>
                  <div className="settings-row-sub" style={{ color: 'var(--text3)' }}>Coming soon</div>
                </div>
                <button className="btn btn-ghost btn-sm" disabled>Coming soon</button>
              </div>
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
