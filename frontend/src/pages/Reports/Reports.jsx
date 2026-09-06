import { useState } from 'react';
import { FileSpreadsheet, FileText, Database, TrendingUp, PieChart, ClipboardList, Eye, ArrowRight } from 'lucide-react';
import api from '../../utils/axiosInstance';
import PageHeader from '../../components/ui/PageHeader';
import Panel from '../../components/ui/Panel';
import LoadingState from '../../components/ui/LoadingState';

const reportTypes = [
  { key: 'employees', title: 'Human Capital Analytics', icon: <Database size={18} />, description: 'Comprehensive workforce data including headcount, roles, and compensation structures.' },
  { key: 'inventory', title: 'Inventory Utility Report', icon: <ClipboardList size={18} />, description: 'Real-time stock valuation, category distribution, and supplier performance metrics.' },
  { key: 'sales', title: 'Commercial Operations', icon: <TrendingUp size={18} />, description: 'Revenue streams, order fulfillment cycles, and client engagement analytics.' },
  { key: 'finance', title: 'Financial Statement', icon: <PieChart size={18} />, description: 'Consolidated income and expenditure logs with transaction category mapping.' },
];

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('employees');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadPreview = async (type) => {
    setLoading(true);
    setSelectedReport(type);
    try {
      const { data } = await api.get(`/reports/${type}`);
      setPreview(data.rows);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (type, format) => {
    const response = await api.get(`/reports/${type}?format=${format}`, { responseType: 'blob' });
    const extension = format === 'xlsx' ? 'xlsx' : 'pdf';
    const mime = format === 'xlsx'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/pdf';
    const url = window.URL.createObjectURL(new Blob([response.data], { type: mime }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}-report.${extension}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Business Intelligence"
        description="Extract high-fidelity operational data and generate professional-grade documentation for stakeholder review."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.5fr]">
        <Panel title="Report Configuration" subtitle="Select a dataset to initialize extraction and preview.">
          <div className="space-y-4">
            {reportTypes.map((report) => (
              <div 
                key={report.key} 
                className={`group p-4 rounded-xl border transition-all cursor-pointer ${selectedReport === report.key ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/20' : 'bg-surface border-border hover:border-primary/20'}`}
                onClick={() => loadPreview(report.key)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={`p-2.5 rounded-lg border ${selectedReport === report.key ? 'bg-primary text-white border-primary' : 'bg-surface-muted text-muted border-border group-hover:text-primary transition-colors'}`}>
                    {report.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-text tracking-tight">{report.title}</h4>
                    <p className="mt-1 text-xs text-muted leading-relaxed">{report.description}</p>
                  </div>
                  <ArrowRight size={14} className={`mt-1 transition-transform ${selectedReport === report.key ? 'translate-x-1 text-primary' : 'text-muted group-hover:translate-x-1 group-hover:text-primary'}`} />
                </div>
                
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button className="secondary-button h-9 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2" onClick={(e) => { e.stopPropagation(); downloadReport(report.key, 'pdf'); }}>
                    <FileText size={14} /> PDF
                  </button>
                  <button className="primary-button h-9 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2" onClick={(e) => { e.stopPropagation(); downloadReport(report.key, 'xlsx'); }}>
                    <FileSpreadsheet size={14} /> Excel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel 
           title="Data Extraction Preview" 
           subtitle={`Real-time inspection of ${selectedReport} dataset.`}
           actions={<button className="ghost-button h-9 px-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2" onClick={() => loadPreview(selectedReport)}><Eye size={14} /> Refresh</button>}
        >
          {loading ? (
            <div className="h-64 flex items-center justify-center bg-surface-muted/30 rounded-xl border border-dashed border-border">
              <LoadingState label="Preparing operational data..." />
            </div>
          ) : preview ? (
            <div className="table-shell overflow-hidden">
               <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      {Object.keys(preview[0] || {}).map((key) => (
                        <th key={key} className="text-[10px] font-black uppercase tracking-widest bg-surface-muted/50">{key.replace(/([A-Z])/g, ' $1')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 10).map((row, index) => (
                      <tr key={index} className="hover:bg-primary/5 transition-colors">
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="text-sm font-medium text-text tabular-nums">{String(value)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-surface-muted/50 border-t border-border mt-2">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest text-center">
                  Preview limited to first 10 records. Use export for complete dataset.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center opacity-40 border border-dashed border-border rounded-xl bg-surface-muted/20">
              <Database size={48} className="mb-4 text-muted" />
              <p className="text-sm font-bold text-text uppercase tracking-widest">No Active Preview</p>
              <p className="text-xs font-medium text-muted mt-2">Select a report from the configuration panel<br/>to begin data extraction.</p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default Reports;

