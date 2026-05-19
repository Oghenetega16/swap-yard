"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Loader2, CheckCircle2, AlertCircle, ShieldCheck, RefreshCw, MapPin, X } from 'lucide-react';
import { Footer } from '@/components/landing/Footer';

export default function MakeReport() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIdempotencyKey(window.crypto.randomUUID());
  }, []);

  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 2);
    setSelectedFiles(files);

    const urls = files.map(file => URL.createObjectURL(file));
    setPreviews(urls);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const form = e.currentTarget;
    const formData = new FormData();

    formData.append('listingId', (form.elements.namedItem('orderId') as HTMLInputElement).value);
    formData.append('type', (form.elements.namedItem('issueType') as HTMLInputElement).value);
    formData.append('reason', (form.elements.namedItem('description') as HTMLTextAreaElement).value);
    formData.append('comment', (form.elements.namedItem('additionalDetails') as HTMLTextAreaElement)?.value ?? '');

    selectedFiles.forEach(file => formData.append('images', file));

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'idempotency-key': idempotencyKey,
        },
        body: formData,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      if (response.ok) {
        setStatus({ type: 'success', msg: 'Report submitted successfully. Our team will review it shortly.' });
        (e.target as HTMLFormElement).reset();
        setIdempotencyKey(window.crypto.randomUUID());
        setSelectedFiles([]);
        setPreviews([]);
      } else {
        throw new Error();
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to submit report. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="bg-[#002B45] py-12 text-center">
        <h1 className="text-2xl font-bold text-white">Make a Report</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <p className="font-bold text-slate-800 mb-6 text-center md:text-left">
          Please select the type of issue and provide detailed information. Our team will review and address your concerns
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">Select the type of issue you are reporting:</p>
            <div className="flex gap-8">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="radio" name="issueType" value="transaction" className="w-4 h-4 accent-[#002B45]" required />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Transactions Issues</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="radio" name="issueType" value="other" className="w-4 h-4 accent-[#002B45]" />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Other</span>
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Describe the issue in detail:</label>
            <textarea 
              name="description"
              required
              rows={6}
              className="w-full p-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-400 outline-none text-sm transition-all"
              placeholder="Include any relevant information such as order ID, product issues and specific concerns."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Upload supporting documents or images (max 2 files, 5MB each)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl py-12 flex flex-col items-center justify-center bg-white hover:bg-slate-50 transition-colors cursor-pointer relative">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
              <div className="bg-slate-100 p-3 rounded-full mb-3 text-slate-600">
                <Upload size={24} />
              </div>
              <p className="text-sm text-slate-500 font-medium">Drag and drop files here or <span className="text-blue-600 underline">browse</span></p>
            </div>

            {previews.length > 0 && (
              <div className="flex gap-4 flex-wrap pt-2">
                {previews.map((url, index) => {
                  const file = selectedFiles[index];
                  const isImage = file?.type.startsWith('image/');
                  return (
                    <div key={index} className="relative group w-24 h-24 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
                      {isImage ? (
                        <img src={url} alt={file.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-500 text-center px-2 break-all">{file.name}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <input name="fullName" required className="w-full p-3.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-400 text-sm" placeholder="Arthur Onyeanusi" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <input type="email" name="email" required className="w-full p-3.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-400 text-sm" placeholder="arthuronyeanusi@gmail.com" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Order ID *</label>
              <input name="orderId" required className="w-full p-3.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-400 text-sm" placeholder="40549640" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Any Additional details you would like to share?</label>
              <textarea name="additionalDetails" rows={4} className="w-full p-4 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-400 text-sm resize-none" placeholder="Type here..." />
            </div>
          </div>

          <div className="pt-4 space-y-4">
            {status && (
              <div className={`flex items-center gap-3 p-4 rounded-lg border ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <p className="text-sm font-medium">{status.msg}</p>
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-[#F0441D] text-white py-4 rounded-lg font-bold text-sm hover:bg-[#d83a17] transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Submitting Report...
                </>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>
        </form>
      </main>

      <section className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-3 gap-8">
            <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-full"><ShieldCheck size={18}/></div>
                <div><h5 className="text-xs font-bold">Secure Transactions</h5><p className="text-[10px] text-slate-500">Encrypted and safe</p></div>
            </div>
            <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-full"><RefreshCw size={18}/></div>
                <div><h5 className="text-xs font-bold">Easy Returns</h5><p className="text-[10px] text-slate-500">Hassle-free process</p></div>
            </div>
            <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-full"><MapPin size={18}/></div>
                <div><h5 className="text-xs font-bold">Local Experience</h5><p className="text-[10px] text-slate-500">Find items nearby</p></div>
            </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}