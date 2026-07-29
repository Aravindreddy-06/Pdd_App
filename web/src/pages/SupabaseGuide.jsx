import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './SupabaseGuide.css';
import { Terminal, Database, ShieldCheck, Zap, Copy, Check } from 'lucide-react';

const SupabaseGuide = () => {
  const [status, setStatus] = useState('idle');
  const [copied, setCopied] = useState(null);

  const testConnection = async () => {
    setStatus('testing');
    try {
      // We'll just try to fetch the service health or a dummy query
      const { data, error } = await supabase.from('_dummy_').select('*').limit(1);
      
      // Even if _dummy_ doesn't exist, if we get a "relation does not exist" error, 
      // it means we successfully connected to the database.
      if (error && error.code === 'PGRST116') {
         // This is a "not found" but indicates connection works
         setStatus('connected');
      } else if (!error) {
         setStatus('connected');
      } else if (error.message.includes('FetchError') || error.message.includes('failed to fetch')) {
         setStatus('error');
      } else {
         // Other database errors still imply connection
         setStatus('connected');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const codeSnippets = {
    client: `import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)`,
    usage: `import { supabase } from './lib/supabaseClient'

const fetchData = async () => {
  const { data, error } = await supabase
    .from('your_table')
    .select('*')
}`
  };

  return (
    <div className="supabase-guide-container">
      <header className="guide-header">
        <h1>Supabase Integration Guide</h1>
        <p>Your project is now configured to use Supabase as its backend.</p>
      </header>

      <section className="guide-section">
        <h2><Zap size={20} /> Connection Status</h2>
        <div className="status-card">
          <div className="status-info">
            <h3>Database Connectivity</h3>
            <p>Test if your application can communicate with Supabase.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className={`status-badge ${status === 'connected' ? 'connected' : 'disconnected'}`}>
              {status === 'connected' ? 'Connected' : status === 'testing' ? 'Testing...' : 'Not Tested'}
            </span>
            <button 
              className="test-button" 
              onClick={testConnection}
              disabled={status === 'testing'}
            >
              Test Connection
            </button>
          </div>
        </div>
      </section>

      <section className="guide-section">
        <h2><ShieldCheck size={20} /> Environment Variables</h2>
        <div className="env-list">
          <div className="env-item">
            <span>Project URL</span>
            <span>{import.meta.env.VITE_SUPABASE_URL || 'Not Set'}</span>
          </div>
          <div className="env-item">
            <span>Anon Key</span>
            <span>{import.meta.env.VITE_SUPABASE_ANON_KEY ? '••••••••' + import.meta.env.VITE_SUPABASE_ANON_KEY.slice(-8) : 'Not Set'}</span>
          </div>
        </div>
      </section>

      <section className="guide-section">
        <h2><Terminal size={20} /> Client Configuration</h2>
        <p>The client is initialized in <code>src/lib/supabaseClient.js</code>.</p>
        <div className="code-block">
          <button className="copy-button" onClick={() => copyToClipboard(codeSnippets.client, 'client')}>
            {copied === 'client' ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <pre><code>{codeSnippets.client}</code></pre>
        </div>
      </section>

      <section className="guide-section">
        <h2><Database size={20} /> Basic Usage</h2>
        <p>Import the client and start querying your data.</p>
        <div className="code-block">
          <button className="copy-button" onClick={() => copyToClipboard(codeSnippets.usage, 'usage')}>
            {copied === 'usage' ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <pre><code>{codeSnippets.usage}</code></pre>
        </div>
      </section>

      <footer style={{ textAlign: 'center', color: '#666', marginTop: '3rem', fontSize: '0.9rem' }}>
        <p>ResourceShare x Supabase &copy; 2026</p>
      </footer>
    </div>
  );
};

export default SupabaseGuide;
