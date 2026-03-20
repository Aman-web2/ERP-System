import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useSelector } from 'react-redux';
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
        api.get('/tasks?limit=50'),
        api.get('/employees?limit=50').catch(() => ({ data: { items: [] } })),
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

  const addComment = async (event) => {
    event.preventDefault();
    await api.post(`/tasks/${activeTask._id}/comments`, { comment });
    setComment('');
    const { data } = await api.get('/tasks?limit=50');
    const latestTask = (data.items || []).find((item) => item._id === activeTask._id);
    setActiveTask(latestTask);
    setTasks(data.items || []);
  };

  if (loading) {
    return <LoadingState label="Loading task board..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task management"
        description="Assign work, monitor deadlines, and collaborate with employees through a live kanban workflow."
        actions={<button className="primary-button inline-flex items-center gap-2" onClick={() => setModalOpen(true)}><Plus size={18} /> Create task</button>}
      />

      <div className="grid gap-6 xl:grid-cols-4">
        {columns.map((column) => (
          <Panel key={column} title={column} className="min-h-[420px]">
            <div className="space-y-3">
              {tasks.filter((task) => task.status === column).map((task) => (
                <button key={task._id} type="button" className="w-full rounded-3xl border border-[var(--border)] px-4 py-4 text-left hover:bg-[var(--surface-muted)]" onClick={() => setActiveTask(task)}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-[var(--text)]">{task.title}</p>
                      <p className="mt-2 text-sm text-[var(--muted)] line-clamp-2">{task.description || 'No description'}</p>
                    </div>
                    <StatusBadge>{task.priority}</StatusBadge>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted)]">
                    <span>{task.assignee?.name || userInfo?.name}</span>
                    <span>{task.dueDate ? formatDate(task.dueDate) : 'No deadline'}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {columns.filter((entry) => entry !== column).slice(0, 2).map((entry) => (
                      <button key={entry} type="button" className="secondary-button px-3 py-2" onClick={(event) => { event.stopPropagation(); moveTask(task._id, entry); }}>
                        {entry}
                      </button>
                    ))}
                  </div>
                </button>
              ))}
              {!tasks.filter((task) => task.status === column).length ? <p className="rounded-3xl border border-dashed border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--muted)]">No tasks</p> : null}
            </div>
          </Panel>
        ))}
      </div>

      <Modal open={modalOpen} title="Create task" onClose={() => setModalOpen(false)} width="max-w-2xl">
        <form className="field-grid two" onSubmit={createTask}>
          <input value={taskForm.title} onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))} placeholder="Task title" required />
          <select value={taskForm.priority} onChange={(event) => setTaskForm((current) => ({ ...current, priority: event.target.value }))}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
          <select value={taskForm.assignee} onChange={(event) => setTaskForm((current) => ({ ...current, assignee: event.target.value }))}>
            <option value="">Select assignee</option>
            {employees.map((employee) => <option key={employee._id} value={employee._id}>{employee.name}</option>)}
          </select>
          <input type="date" value={taskForm.dueDate} onChange={(event) => setTaskForm((current) => ({ ...current, dueDate: event.target.value }))} />
          <textarea className="col-span-full" rows="4" value={taskForm.description} onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))} placeholder="Task description" />
          <div className="col-span-full flex justify-end gap-3">
            <button type="button" className="ghost-button" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="primary-button">Save task</button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(activeTask)} title={activeTask?.title || 'Task details'} onClose={() => setActiveTask(null)} width="max-w-3xl">
        {activeTask ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge>{activeTask.status}</StatusBadge>
              <StatusBadge>{activeTask.priority}</StatusBadge>
              <span className="text-sm text-[var(--muted)]">Due {activeTask.dueDate ? formatDate(activeTask.dueDate) : 'No deadline'}</span>
            </div>
            <p className="text-sm text-[var(--muted)]">{activeTask.description || 'No description provided.'}</p>
            <div>
              <p className="stat-kicker">Discussion</p>
              <div className="mt-3 space-y-3">
                {(activeTask.comments || []).map((entry, index) => (
                  <div key={`${entry.comment}-${index}`} className="rounded-2xl bg-[var(--surface-muted)] px-4 py-3">
                    <p className="font-medium text-[var(--text)]">{entry.author?.name || 'User'}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{entry.comment}</p>
                  </div>
                ))}
                {!activeTask.comments?.length ? <p className="text-sm text-[var(--muted)]">No comments yet.</p> : null}
              </div>
            </div>
            <form className="space-y-3" onSubmit={addComment}>
              <textarea rows="4" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a collaboration note" required />
              <div className="flex justify-end">
                <button type="submit" className="primary-button">Post comment</button>
              </div>
            </form>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default TaskManager;

