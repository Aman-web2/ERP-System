import { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import api from '../../utils/axiosInstance';
import PageHeader from '../../components/ui/PageHeader';
import Panel from '../../components/ui/Panel';
import LoadingState from '../../components/ui/LoadingState';

const reportTypes = [
  { key: 'employees', title: 'Employee report', description: 'Headcount, role, salary, department, and status.' },
  { key: 'inventory', title: 'Inventory report', description: 'Current stock, category, supplier, and pricing.' },
  { key: 'sales', title: 'Sales report', description: 'Order status, payment status, and order values.' },
  { key: 'finance', title: 'Finance report', description: 'Income and expense transactions.' },
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
    <div className="space-y-6">
      <PageHeader
        title="Reports and exports"
        description="Generate employee, inventory, sales, and finance reports with JSON preview plus PDF or Excel export."
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Available reports" subtitle="Select a report, preview rows, or export directly.">
          <div className="space-y-3">
            {reportTypes.map((report) => (
              <div key={report.key} className="rounded-3xl border border-[var(--border)] px-4 py-4">
                <p className="font-medium text-[var(--text)]">{report.title}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{report.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="secondary-button px-3 py-2" onClick={() => loadPreview(report.key)}>Preview</button>
                  <button className="secondary-button inline-flex items-center gap-2 px-3 py-2" onClick={() => downloadReport(report.key, 'pdf')}><FileText size={16} /> PDF</button>
                  <button className="primary-button inline-flex items-center gap-2 px-3 py-2" onClick={() => downloadReport(report.key, 'xlsx')}><FileSpreadsheet size={16} /> Excel</button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Preview" subtitle={`Showing preview rows for ${selectedReport}.`}>
          {loading ? (
            <LoadingState label="Preparing report preview..." />
          ) : preview ? (
            <div className="table-shell">
              <table>
                <thead>
                  <tr>
                    {Object.keys(preview[0] || {}).map((key) => <th key={key}>{key}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 8).map((row, index) => (
                    <tr key={`${selectedReport}-${index}`}>
                      {Object.values(row).map((value, cellIndex) => <td key={`${selectedReport}-${index}-${cellIndex}`}>{String(value)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[var(--border)] px-6 py-16 text-center text-sm text-[var(--muted)]">
              Choose a report to preview it here.
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default Reports;

