import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Modal } from '../../common/Modal';
import { Button } from '../../common/Button';
import { Globe, Shield, Key, User } from 'lucide-react';

export const AddWebsiteModal: React.FC = () => {
  const { isAddWebsiteModalOpen, setIsAddWebsiteModalOpen, addWebsite } = useApp();

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim() || !username.trim()) return;

    setIsVerifying(true);
    try {
      await addWebsite({
        name: name.trim(),
        url: url.trim(),
        username: username.trim(),
        applicationPassword: appPassword.trim(),
      });
      setName('');
      setUrl('');
      setUsername('');
      setAppPassword('');
    } catch {
      // Error toast is already shown by AppContext
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Modal
      isOpen={isAddWebsiteModalOpen}
      onClose={() => setIsAddWebsiteModalOpen(false)}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <span>Connect WordPress Website</span>
        </div>
      }
      description="Connect using WordPress REST API and Application Password for secure publishing."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Website Name */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
            Website Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. My Travel Blog"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 rounded-xl p-2.5 focus:border-violet-500 focus:outline-none"
          />
        </div>

        {/* WordPress URL */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
            WordPress URL
          </label>
          <div className="flex items-center bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 focus-within:border-violet-500">
            <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 mr-2 shrink-0" />
            <input
              type="url"
              required
              placeholder="https://example.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
            WordPress Username
          </label>
          <div className="flex items-center bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 focus-within:border-violet-500">
            <User className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 mr-2 shrink-0" />
            <input
              type="text"
              required
              placeholder="e.g. admin or editor_user"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>
        </div>

        {/* Application Password */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
            WordPress Application Password
          </label>
          <div className="flex items-center bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 focus-within:border-violet-500">
            <Key className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 mr-2 shrink-0" />
            <input
              type="password"
              placeholder="xxxx xxxx xxxx xxxx"
              value={appPassword}
              onChange={e => setAppPassword(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-900 dark:text-zinc-100 focus:outline-none font-mono"
            />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 flex items-center gap-1">
            <Shield className="w-3 h-3 text-slate-400" />
            Generated in WordPress Admin &gt; Users &gt; Profile &gt; Application Passwords.
          </p>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsAddWebsiteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="glow"
            size="sm"
            isLoading={isVerifying}
          >
            Connect & Verify
          </Button>
        </div>
      </form>
    </Modal>
  );
};
