import { useEffect, useState } from 'react';
import { Plus, MessageSquare, Clock, User, Trash2, ArrowRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/axiosInstance';
import PageHeader from '../../components/ui/PageHeader';
import Panel from '../../components/ui/Panel';
import Modal from '../../components/ui/Modal';
import LoadingState from '../../components/ui/LoadingState';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate } from '../../utils/formatters';

const columns = ['To Do', 'In Progress', 'In Review', 'Done'];

const blankTask = {
  title: '',
  description: '',
  priority: 'Medium',
  status: 'To Do',
  dueDate: '',
  assignee: '',
};

const TaskManager = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [taskForm, setTaskForm] = useState(blankTask);
  const [comment, setComment] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const [taskResponse, employeeResponse] = await Promise.all([
        api.get('/tasks?limit=100'),
        api.get('/employees?limit=100').catch(() => ({ data: { items: [] } })),
      ]);
      setTasks(taskResponse.data.items || []);
      setEmployees(employeeResponse.data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const createTask = async (event) => {
    event.preventDefault();
    const payload = {
      ...taskForm,
      dueDate: taskForm.dueDate || undefined,
    };
    await api.post('/tasks', payload);
    setTaskForm(blankTask);
    setModalOpen(false);
    fetchTasks();
  };

  const moveTask = async (taskId, status) => {
    await api.put(`/tasks/${taskId}`, { status });
    fetchTasks();
  };

  const deleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
      setActiveTask(null);
    }
  };

  const addComment = async (event) => {
    event.preventDefault();
    await api.post(`/tasks/${activeTask._id}/comments`, { comment });
    setComment('');
    const { data } = await api.get('/tasks?limit=100');
    const latestTask = (data.items || []).find((item) => item._id === activeTask._id);
    setActiveTask(latestTask);
    setTasks(data.items || []);
  };

  if (loading) {
    return <LoadingState label="Synchronizing task board..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Project Workflow"
        description="Monitor initiative progress and collaborate across departments in real-time."
        actions={<button className="primary-button inline-flex items-center gap-2" onClick={() => setModalOpen(true)}><Plus size={18} /> New Task</button>}
      />

      <div className="grid gap-6 xl:grid-cols-4 items-start">
        {columns.map((column) => (
          <div key={column} className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold text-text uppercase tracking-widest opacity-80">{column}</h3>
              <span className="h-6 w-6 flex items-center justify-center rounded-full bg-surface-muted border border-border text-[10px] font-bold text-text">
                {tasks.filter(t => t.status === column).length}
              </span>
            </div>
            
            <div className="space-y-3 min-h-[400px]">
              <AnimatePresence mode="popLayout">
                {tasks.filter((task) => task.status === column).map((task) => (
                  <motion.div
                    key={task._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="group relative bg-surface border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer overflow-hidden"
                    onClick={() => setActiveTask(task)}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-text line-clamp-2 leading-tight tracking-tight">{task.title}</p>
                      <StatusBadge>{task.priority}</StatusBadge>
                    </div>

                    <p className="mt-2 text-[13px] text-muted line-clamp-2 leading-relaxed">
                      {task.description || 'No detailed description.'}
                    </p>

                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-muted">
                        <User size={12} />
                        <span className="text-[11px] font-bold uppercase tracking-wider">{task.assignee?.name?.split(' ')[0] || 'Unassigned'}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-muted">
                        <Clock size={12} />
                        <span className="text-[11px] font-bold">{task.dueDate ? formatDate(task.dueDate) : 'No due date'}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      {(() => {
                        const currentIndex = columns.indexOf(task.status);
                        const nextStatus = columns[currentIndex + 1];
                        if (!nextStatus) return null;
                        
                        const canMove = nextStatus === 'Done' ? ['Admin', 'HR'].includes(userInfo?.role) : true;
                        if (!canMove) return null;

                        return (
                          <button 
                            type="button" 
                            className="w-full h-8 flex items-center justify-center gap-2 rounded-lg bg-surface-muted hover:bg-primary/10 text-primary transition-colors text-[10px] font-bold uppercase tracking-wider border border-border" 
                            onClick={(e) => { e.stopPropagation(); moveTask(task._id, nextStatus); }}
                          >
                            Advance <ArrowRight size={12} />
                          </button>
                        );
                      })()}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {!tasks.filter((task) => task.status === column).length && (
                <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center">
                  <p className="text-[11px] font-bold text-muted uppercase tracking-widest">Empty</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} title="Dispatch New Task" onClose={() => setModalOpen(false)} width="max-w-xl">
        <form className="field-grid two" onSubmit={createTask}>
          <div className="col-span-full">
            <label className="text-xs font-semibold text-text mb-1 block">Project / Task Title</label>
            <input value={taskForm.title} onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Enter objective..." required />
          </div>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Priority Level</label>
            <select value={taskForm.priority} onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Critical</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Assign To</label>
            <select value={taskForm.assignee} onChange={(e) => setTaskForm(prev => ({ ...prev, assignee: e.target.value }))}>
              <option value="">Public Task</option>
              {employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
            </select>
          </div>
          <div className="col-span-full">
            <label className="text-xs font-semibold text-text mb-1 block">Target Date</label>
            <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))} />
          </div>
          <div className="col-span-full">
            <label className="text-xs font-semibold text-text mb-1 block">Technical Description</label>
            <textarea rows="4" value={taskForm.description} onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Provide context and requirements..." />
          </div>
          <div className="col-span-full pt-4 flex justify-end gap-3">
            <button type="button" className="ghost-button" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="primary-button px-8">Dispatch Task</button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(activeTask)} title="Task Intelligence" onClose={() => setActiveTask(null)} width="max-w-2xl">
        {activeTask && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-text tracking-tight">{activeTask.title}</h2>
              <div className="flex gap-2">
                <StatusBadge>{activeTask.status}</StatusBadge>
                <StatusBadge>{activeTask.priority}</StatusBadge>
              </div>
            </div>

            <div className="p-4 bg-surface-muted rounded-xl border border-border">
              <p className="text-sm text-text leading-relaxed font-medium">
                {activeTask.description || 'No description provided.'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-primary" />
                <h3 className="text-sm font-bold text-text uppercase tracking-wider">Communication Logs</h3>
              </div>
              
              <div className="space-y-3">
                {(activeTask.comments || []).map((entry, index) => (
                  <div key={index} className="pl-4 border-l-2 border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text uppercase">{entry.author?.name || 'Observer'}</span>
                      <span className="text-[10px] text-muted font-medium">{formatDate(entry.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted leading-snug">{entry.comment}</p>
                  </div>
                ))}
                {!activeTask.comments?.length && <p className="text-xs text-muted font-medium italic">No recorded collaboration logs.</p>}
              </div>
            </div>

            <form className="space-y-3 pt-4 border-t border-border" onSubmit={addComment}>
              <textarea 
                rows="3" 
                value={comment} 
                onChange={(e) => setComment(e.target.value)} 
                placeholder="Submit a progress update or note..." 
                required 
                className="bg-surface-muted border-none focus:ring-1 focus:ring-primary h-24"
              />
              <div className="flex justify-between items-center">
                {['Admin', 'HR'].includes(userInfo?.role) && (
                  <button type="button" className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1" onClick={() => deleteTask(activeTask._id)}>
                    <Trash2 size={12} /> Purge Task
                  </button>
                )}
                <button type="submit" className="primary-button px-6">Post Update</button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TaskManager;
