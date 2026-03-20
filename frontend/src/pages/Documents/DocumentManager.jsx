import { useEffect, useState } from 'react';
import { FileUp, FolderOpen } from 'lucide-react';
import api from '../../utils/axiosInstance';
import PageHeader from '../../components/ui/PageHeader';
import Panel from '../../components/ui/Panel';
import LoadingState from '../../components/ui/LoadingState';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate } from '../../utils/formatters';

const DocumentManager = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: '', module: 'general', linkedEntity: '', tags: '', file: null });

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/documents?limit=20');
      setDocuments(data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const uploadDocument = async (event) => {
    event.preventDefault();
    setUploading(true);
    const payload = new FormData();
    payload.append('name', form.name);
    payload.append('module', form.module);
    payload.append('linkedEntity', form.linkedEntity);
    payload.append('tags', form.tags);
    payload.append('file', form.file);

    try {
      await api.post('/documents', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm({ name: '', module: 'general', linkedEntity: '', tags: '', file: null });
      fetchDocuments();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || 'Unable to upload document');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId) => {
    await api.delete(`/documents/${documentId}`);
    fetchDocuments();
  };

  if (loading) {
    return <LoadingState label="Loading document repository..." />;
  }

  const getDocumentUrl = (document) => (
    document.url.startsWith('http')
      ? document.url
      : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}${document.url}`
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document repository"
        description="Store employee files, invoices, and operational documents with Cloudinary-ready uploads and backend metadata tracking."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Upload document" subtitle="Tag files by ERP module and linked entity.">
          <form className="space-y-4" onSubmit={uploadDocument}>
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Document title" required />
            <select value={form.module} onChange={(event) => setForm((current) => ({ ...current, module: event.target.value }))}>
              <option value="general">General</option>
              <option value="employees">Employees</option>
              <option value="finance">Finance</option>
              <option value="sales">Sales</option>
              <option value="inventory">Inventory</option>
            </select>
            <input value={form.linkedEntity} onChange={(event) => setForm((current) => ({ ...current, linkedEntity: event.target.value }))} placeholder="Linked entity ID (optional)" />
            <input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="Comma-separated tags" />
            <input type="file" onChange={(event) => setForm((current) => ({ ...current, file: event.target.files?.[0] || null }))} required />
            <button type="submit" className="primary-button inline-flex items-center gap-2" disabled={uploading}><FileUp size={18} /> {uploading ? 'Uploading...' : 'Upload document'}</button>
          </form>
        </Panel>

        <Panel title="Stored documents" subtitle="Recent files available across ERP workflows.">
          <div className="space-y-3">
            {documents.map((document) => (
              <div key={document._id} className="rounded-3xl border border-[var(--border)] px-4 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-[var(--surface-muted)] p-3 text-[var(--primary)]"><FolderOpen size={18} /></div>
                    <div>
                      <a href={getDocumentUrl(document)} target="_blank" rel="noreferrer" className="font-medium text-[var(--text)] underline-offset-4 hover:underline">{document.name}</a>
                      <p className="mt-1 text-sm text-[var(--muted)]">Uploaded {formatDate(document.createdAt)} • {document.storageProvider}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge>{document.module}</StatusBadge>
                    <button className="danger-button px-3 py-2" onClick={() => deleteDocument(document._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {!documents.length ? <p className="text-sm text-[var(--muted)]">No documents uploaded yet.</p> : null}
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default DocumentManager;

