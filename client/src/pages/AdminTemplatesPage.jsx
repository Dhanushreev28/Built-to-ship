import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, Download, ArrowLeft, CheckCircle2, Clock, Eye } from 'lucide-react';
import { api } from '../services/api';
import { getPictogram } from '../utils/iconMapper';

export default function AdminTemplatesPage() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState('submissions');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [subs, tmpls] = await Promise.all([
          api.getAllSubmissions(),
          api.getTemplates()
        ]);
        setSubmissions(subs);
        setTemplates(tmpls);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 font-extrabold text-slate-700 bg-white hover:bg-slate-100 px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Portal</span>
      </button>

      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Supervisor & Admin Console</h1>
            <p className="text-slate-400 font-medium text-sm">
              Inspect voice submissions, generated PDFs, and active scheme schemas.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              activeTab === 'submissions' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            Submissions ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              activeTab === 'templates' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            Scheme Schemas ({templates.length})
          </button>
        </div>
      </div>

      {/* Submissions Table Tab */}
      {activeTab === 'submissions' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-black text-slate-900">
            Recorded Applications
          </h2>

          {submissions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium">
              No submissions recorded yet. Start an application from the home portal!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase font-extrabold text-slate-400">
                    <th className="py-3 px-4">Receipt Code</th>
                    <th className="py-3 px-4">Scheme / Job</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Fields Filled</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-black text-emerald-700 text-base">
                        {sub.receipt_code ? (
                          <span className="bg-emerald-100 px-3 py-1 rounded-xl">
                            {sub.receipt_code}
                          </span>
                        ) : (
                          <span className="text-slate-400">In Progress</span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900">
                        {sub.template_title || 'Application'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                          sub.status === 'submitted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sub.status === 'submitted' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-600">
                        {sub.fields_filled} / {sub.total_fields}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-500 font-medium">
                        {new Date(sub.created_at).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        {sub.status === 'submitted' && (
                          <a
                            href={api.getPdfDownloadUrl(sub.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </a>
                        )}
                        <button
                          onClick={() => navigate(`/review/${sub.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((tmpl) => (
            <div key={tmpl.id} className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  {getPictogram(tmpl.icon_name, "w-6 h-6")}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{tmpl.title}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{tmpl.template_key}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl text-xs text-slate-700 italic border border-slate-200">
                "{tmpl.spoken_intro}"
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  Configured Voice Fields ({tmpl.fields?.length || 0})
                </h4>
                <div className="space-y-1.5">
                  {tmpl.fields?.map((f, i) => (
                    <div key={f.id || i} className="flex items-center justify-between text-sm py-1.5 px-3 bg-slate-100 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                          {f.step_order}
                        </span>
                        <span className="font-bold text-slate-800">{f.label}</span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono bg-white px-2 py-0.5 rounded border">
                        {f.field_type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
