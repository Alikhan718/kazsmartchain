'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '../../../../lib/client';
import { Image, Upload, CheckCircle, Copy, ExternalLink, Loader2 } from 'lucide-react';

export default function AssetsPage({ params }: { params: Promise<{ id: string }> }) {
  const [cid, setCid] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [orgId, setOrgId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    params.then((p) => setOrgId(p.id));
  }, [params]);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const form = e.currentTarget as any;
      const file: File = form.file.files[0];
      if (!file) return;
      const base64 = await file.arrayBuffer().then((b) => {
        const bytes = new Uint8Array(b);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
      });
      const res = await createClient(orgId).ipfsUpload(orgId, file.name, file.type, base64);
      setCid(res.cid);
    } finally {
      setBusy(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent mb-2">
          IPFS Активы
        </h1>
        <p className="text-gray-400 text-lg">Загрузка и управление активами, хранящимися на IPFS</p>
      </div>

      <div className="p-6 rounded-xl border border-gray-800/50 glass card-hover bg-gradient-to-br from-gray-900/80 to-gray-900/40">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
            <Upload className="w-5 h-5" />
          </div>
            <h2 className="text-lg font-semibold text-white">Загрузить актив</h2>
        </div>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Выберите файл</label>
            <div className="flex items-center gap-3">
              <input 
                name="file" 
                type="file" 
                className="flex-1 border border-gray-700 rounded-lg p-3 bg-gray-800/50 text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 cursor-pointer" 
                accept="image/*,application/json" 
              />
              <button 
                type="submit"
                disabled={busy} 
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {busy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Загрузить</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {cid && (
        <div className="p-6 rounded-xl border border-gray-800/50 glass bg-gradient-to-br from-green-500/10 to-green-600/5">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-3">Загрузка успешна</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Идентификатор контента (CID)</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-300 font-mono break-all">
                      {cid}
                    </code>
                    <button
                      onClick={() => copyToClipboard(cid)}
                      className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                      title="Copy CID"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">IPFS URI</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-300 font-mono break-all">
                      ipfs://{cid}
                    </code>
                    <button
                      onClick={() => copyToClipboard(`ipfs://${cid}`)}
                      className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                      title="Copy URI"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={`https://ipfs.io/ipfs/${cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                      title="View on IPFS"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

