import React from 'react';
import Head from 'next/head';
import { 
  ShieldAlert, 
  Trash2, 
  Mail, 
  CheckCircle2 
} from 'lucide-react';
import { Footer } from '@/components/landing/Footer';

const DataDeletion = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <Head>
        <title>Data Deletion Instructions | SwapYard</title>
      </Head>

      {/* Header matching your brand color */}
      <header className="bg-[#002B45] py-20 text-center">
        <h1 className="text-4xl font-bold text-white">Data Deletion Instructions</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <section className="space-y-10">
          <div>
            <h2 className="text-2xl font-bold mb-4">Account & Data Erasure</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              At SwapYard, we respect your privacy and provide you with full control over your personal data. If you decide to stop using our platform, you can request the permanent removal of your account and all associated data at any time.
            </p>
          </div>

          {/* Core Warning Box */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md flex gap-4 my-6">
            <div className="bg-amber-500 p-2 h-9 w-9 rounded-full flex items-center justify-center shrink-0">
              <ShieldAlert className="text-white w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 text-sm">Action is Permanent and Irreversible</h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Once your account is deleted, it cannot be recovered. You will permanently lose access to your profile, active listings, historical swap matches, and direct messages.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">What Data is Deleted?</h3>
            <p className="text-slate-600 leading-relaxed text-sm mb-4">
              Upon verifying your deletion request, SwapYard permanently purges the following data points from our active databases:
            </p>
            <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
              <li><strong className="text-slate-700">Profile Details:</strong> Real name, email address, phone number, and account avatar.</li>
              <li><strong className="text-slate-700">App Information:</strong> Item listings, category tags, saved items, and exchange records.</li>
              <li><strong className="text-slate-700">Access Tokens:</strong> Active login credentials and device authentication payloads.</li>
            </ul>
            <p className="text-slate-400 italic text-xs mt-3">
              Note: Minimal transactional historical summaries may be held in isolated archival storage for legal, financial reporting, and fraud protection cycles as required under Nigerian law.
            </p>
          </div>

          <hr className="border-slate-100" />

          <div>
            <h3 className="text-lg font-semibold mb-4">How to Request Deletion</h3>
            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Method 1</span>
                  <h4 className="font-bold text-sm text-slate-900">In-App Automatic Deletion</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                    Log into your account platform dashboard. Go to <strong className="text-slate-700">Profile Settings</strong>, locate the Account Actions section at the bottom, and click <strong className="text-slate-700">Delete Account</strong>. Confirm via the secure modal prompt to instantly queue your purge.
                  </p>
                </div>
                <div className="shrink-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    Instant Execution
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Method 2</span>
                  <h4 className="font-bold text-sm text-slate-900">Manual Email Processing</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                    If you cannot access your native portal dashboard, drop an email from your registered email profile directly to <strong className="text-slate-700">support@swapyard.com</strong>. Include the subject line <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-rose-600 font-mono text-[11px]">Data Deletion Request</code>.
                  </p>
                </div>
                <div className="shrink-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-800">
                    1-3 Business Days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid matched to original architecture style */}
        <section className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="flex items-start gap-4">
            <div className="bg-[#002B45] p-3 rounded-full shrink-0">
              <Trash2 className="text-white w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Complete Purge</h4>
              <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">Active server data is entirely destroyed post-verification.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-[#002B45] p-3 rounded-full shrink-0">
              <CheckCircle2 className="text-white w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Identity Verification</h4>
              <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">Protected handling blocks accidental or malicious deletions.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-[#002B45] p-3 rounded-full shrink-0">
              <Mail className="text-white w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Privacy Contact</h4>
              <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">Reach our admin desk directly for ongoing account support concerns.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DataDeletion;