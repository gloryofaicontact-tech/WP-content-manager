import React, { useState } from 'react';
import { Button } from '../../common/Button';
import { useApp } from '../../../context/AppContext';
import { User, Mail, Lock, UserPlus, Shield, Trash2 } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Author';
  status: 'Active' | 'Pending';
}

export const SettingsScreen: React.FC = () => {
  const { addToast } = useApp();

  // Profile State
  const [name, setName] = useState('IT Admin');
  const [email, setEmail] = useState('itadmin@quicksite.asia');
  const [password, setPassword] = useState('••••••••••••');

  // Team state
  const [team, setTeam] = useState<TeamMember[]>([
    { id: '1', name: 'IT Admin', email: 'itadmin@quicksite.asia', role: 'Admin', status: 'Active' },
    { id: '2', name: 'Sarah Perera', email: 'sarah.content@quicksite.asia', role: 'Editor', status: 'Active' },
    { id: '3', name: 'Alex Silva', email: 'alex.copywriter@gmail.com', role: 'Author', status: 'Pending' },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Editor' | 'Author'>('Editor');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      title: 'Profile Saved',
      message: 'Your personal settings have been updated.',
      type: 'success',
    });
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newMember: TeamMember = {
      id: 'mem-' + (team.length + 1),
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'Pending',
    };

    setTeam(prev => [...prev, newMember]);
    setInviteEmail('');
    addToast({
      title: 'Invitation Sent',
      message: `Invited ${newMember.email} as ${newMember.role}.`,
      type: 'success',
    });
  };

  const handleRemoveMember = (id: string) => {
    setTeam(prev => prev.filter(m => m.id !== id));
    addToast({
      title: 'Member Removed',
      message: 'Team access revoked.',
      type: 'info',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
          Settings & Users
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Manage your administrator profile, security, and team permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-zinc-800">
            <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            Profile & Authentication
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 rounded-xl p-2.5 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Email Address
              </label>
              <div className="flex items-center bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 focus-within:border-violet-500">
                <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 mr-2 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-800 dark:text-zinc-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Password
              </label>
              <div className="flex items-center bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 focus-within:border-violet-500">
                <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 mr-2 shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-800 dark:text-zinc-200 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button variant="primary" size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* User Management Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-zinc-800">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Team & Permissions
          </h2>

          {/* Invite form */}
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              required
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 rounded-xl px-3 py-2 focus:border-violet-500 focus:outline-none"
            />
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value as any)}
              className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 rounded-xl px-3 py-2 focus:border-violet-500 focus:outline-none cursor-pointer"
            >
              <option value="Editor">Editor</option>
              <option value="Author">Author</option>
              <option value="Admin">Admin</option>
            </select>
            <Button variant="glow" size="sm" type="submit" icon={<UserPlus className="w-3.5 h-3.5" />}>
              Invite
            </Button>
          </form>

          {/* Members List */}
          <div className="space-y-2.5 pt-2">
            {team.map(member => (
              <div
                key={member.id}
                className="p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      {member.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300">
                      {member.role}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-500">
                    {member.email}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-zinc-800 text-slate-700 dark:text-zinc-400">
                    {member.status}
                  </span>
                  {member.role !== 'Admin' && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded cursor-pointer"
                      title="Remove member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
