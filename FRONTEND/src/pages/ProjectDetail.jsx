// src/pages/ProjectDetail.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Filter, MoreVertical, Edit2, Trash2, 
  Clock, CheckCircle2, CircleDashed, Calendar, Flag, User as UserIcon, X, Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// IMPORT THE API FUNCTIONS
import { getProjectById } from '../api/projects';
import { createTask, updateTask, deleteTask, getTasks } from '../api/tasks'; // <-- Make sure getTasks is imported!

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [TEAM_MEMBERS, setTeamMembers] = useState([]); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [isTasksLoading, setIsTasksLoading] = useState(false); // Used for filter loading
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({ status: '', assignee_id: '' });
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentTask, setCurrentTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', description: '', status: 'todo', priority: 'medium', due_date: '', assignee_id: '' 
  });

  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setActiveDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Fetch Project Details & Team Members (Runs ONCE on mount)
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const data = await getProjectById(id);
        setProject(data.project); 
        setTeamMembers(data.team_members || []); 
      } catch (err) {
        console.error("Failed to fetch project details:", err);
        setError("Could not load project details.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) fetchProjectData();
  }, [id, user]);

  // 2. Fetch Filtered Tasks (Runs on mount AND when filters change)
  useEffect(() => {
    const fetchFilteredTasks = async () => {
      setIsTasksLoading(true);
      try {
        const data = await getTasks(id, filters);
        setTasks(data.tasks || []);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      } finally {
        setIsTasksLoading(false);
      }
    };

    // Only run if the initial project load is done so we don't spam the API
    if (user && !isLoading && !error) {
      fetchFilteredTasks();
    }
  }, [id, user, filters, isLoading, error]);

  // Calculate stats dynamically based on the currently viewed tasks
  const stats = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    acc.total += 1;
    return acc;
  }, { todo: 0, in_progress: 0, done: 0, total: 0 });
  
  const progressPercent = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);

  const clearFilters = () => setFilters({ status: '', assignee_id: '' });

  const openModal = (mode, task = null) => {
    setModalMode(mode);
    setCurrentTask(task);
    setError(''); 
    
    if (task) {
      setFormData({
        title: task.title, description: task.description || '', status: task.status,
        priority: task.priority, due_date: task.due_date || '', assignee_id: task.assignee_id || ''
      });
    } else {
      setFormData({ title: '', description: '', status: 'todo', priority: 'medium', due_date: '', assignee_id: '' });
    }
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  // REAL API CALL with Optimistic UI
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const assigneeName = formData.assignee_id ? TEAM_MEMBERS.find(m => m.id === formData.assignee_id)?.name : null;
      const payload = { ...formData, assignee_name: assigneeName };

      if (modalMode === 'create') {
        const newTask = await createTask(id, payload);
        setTasks([newTask, ...tasks]);
      } else {
        // --- OPTIMISTIC UI UPDATE ---
        // 1. Save the old state just in case the API fails
        const previousTasks = [...tasks];
        
        // 2. Instantly update the UI before the backend responds
        setTasks(tasks.map(t => t.id === currentTask.id ? { ...t, ...payload } : t));

        try {
          // 3. Make the actual API call silently in the background
          const updatedTask = await updateTask(currentTask.id, payload);
          // 4. Sync with the true backend data to be safe
          setTasks(tasks.map(t => t.id === currentTask.id ? updatedTask : t));
        } catch (apiError) {
          // 5. If it failed, revert the UI and throw the error
          setTasks(previousTasks);
          throw apiError; 
        }
      }
      setIsModalOpen(false);
    } catch (err) {
        console.error("Failed to save task:", err);
        setError(err.response?.data?.error || "Failed to save task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // REAL API CALL: Delete Task
  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    setActiveDropdown(null);
    
    try {
        await deleteTask(taskId);
        setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
        console.error("Failed to delete task:", err);
        alert(err.response?.data?.error || "Failed to delete task");
    }
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case 'done': return { icon: CheckCircle2, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', label: 'Done' };
      case 'in_progress': return { icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', label: 'Active' };
      default: return { icon: CircleDashed, color: 'text-slate-400', bg: 'bg-slate-800/60 border-slate-700', label: 'Todo' };
    }
  };

  const getPriorityConfig = (priority) => {
    switch(priority) {
      case 'high': return { color: 'text-rose-400 bg-rose-400/10', label: 'High' };
      case 'low': return { color: 'text-emerald-400 bg-emerald-400/10', label: 'Low' };
      default: return { color: 'text-amber-400 bg-amber-400/10', label: 'Medium' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1120] w-full flex flex-col"><Navbar />
        <div className="pt-28 max-w-7xl mx-auto w-full px-4 flex-grow animate-pulse">
          <div className="h-6 w-32 bg-slate-800 rounded mb-6"></div>
          <div className="h-12 w-64 bg-slate-800 rounded mb-8"></div>
        </div>
      <Footer /></div>
    );
  }

  if (error && !project) {
      return (
        <div className="min-h-screen bg-[#0B1120] w-full flex flex-col items-center justify-center">
            <Navbar />
            <div className="text-center text-slate-300 mt-20">
                <h2 className="text-2xl font-bold mb-4">Oops!</h2>
                <p className="mb-6">{error}</p>
                <Link to="/projects" className="text-cyan-400 hover:underline">Return to Projects</Link>
            </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-[#0B1120] font-sans selection:bg-cyan-500/30 selection:text-cyan-100 overflow-x-hidden w-full flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 w-full relative z-10">
        
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-cyan-400 transition-colors mb-6 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Projects
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {project?.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
              {project?.description}
            </p>
          </div>
          <button 
            onClick={() => openModal('create')}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all active:scale-95 shrink-0"
          >
            <Plus size={18} /> Create Task
          </button>
        </div>

        <div className="bg-[#121a2f]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl mb-8">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-8">
            <div className="w-full sm:w-1/3 order-last sm:order-first">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-slate-200">{progressPercent}% Done</span>
                <span className="text-slate-500 font-medium">{stats.total} total tasks</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-1000 relative" 
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/30 blur-sm rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="hidden sm:block h-10 w-px bg-slate-800"></div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none flex items-center gap-2 bg-slate-800/60 border border-slate-700 px-4 py-2 rounded-xl">
                <CircleDashed size={16} className="text-slate-400" />
                <div className="flex flex-col"><span className="text-lg font-bold text-white leading-none">{stats.todo}</span><span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Todo</span></div>
              </div>
              <div className="flex-1 sm:flex-none flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl">
                <Clock size={16} className="text-indigo-400" />
                <div className="flex flex-col"><span className="text-lg font-bold text-indigo-300 leading-none">{stats.in_progress}</span><span className="text-[10px] uppercase tracking-wider text-indigo-500/70 font-bold mt-1">Active</span></div>
              </div>
              <div className="flex-1 sm:flex-none flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl">
                <CheckCircle2 size={16} className="text-cyan-400" />
                <div className="flex flex-col"><span className="text-lg font-bold text-cyan-300 leading-none">{stats.done}</span><span className="text-[10px] uppercase tracking-wider text-cyan-500/70 font-bold mt-1">Done</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-slate-400 mr-2">
            <Filter size={18} /> <span className="text-sm font-bold">Filters:</span>
          </div>
          
          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="w-full sm:w-auto bg-[#121a2f] border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="todo">Todo</option>
            <option value="in_progress">Active</option>
            <option value="done">Done</option>
          </select>

          <select 
            value={filters.assignee_id}
            onChange={(e) => setFilters({...filters, assignee_id: e.target.value})}
            className="w-full sm:w-auto bg-[#121a2f] border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 outline-none"
          >
            <option value="">All Assignees</option>
            {TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            <option value="unassigned">Unassigned</option>
          </select>

          {(filters.status !== '' || filters.assignee_id !== '') && (
            <button onClick={clearFilters} className="text-sm text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
              Clear Filters
            </button>
          )}
        </div>

        <div className="space-y-4">
          {isTasksLoading ? (
             <div className="text-center py-10 text-slate-500"><Loader2 className="animate-spin mx-auto mb-2" /> Fetching tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-16 bg-[#121a2f]/40 border border-slate-800 border-dashed rounded-2xl">
              <p className="text-slate-500 font-medium">No tasks found matching your criteria.</p>
            </div>
          ) : (
            tasks.map((task) => {
              const statusCfg = getStatusConfig(task.status);
              const priorityCfg = getPriorityConfig(task.priority);
              const StatusIcon = statusCfg.icon;

              return (
                <div 
                  key={task.id} 
                  className={`bg-[#121a2f]/60 backdrop-blur-md border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-start gap-5 transition-all relative ${activeDropdown === task.id ? 'z-40 ring-1 ring-cyan-500/30' : 'z-10'}`}
                >
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 mt-0.5">
                      <div className={`p-1.5 rounded-lg border shrink-0 ${statusCfg.bg}`} title={`Status: ${statusCfg.label}`}>
                        <StatusIcon size={16} className={statusCfg.color} />
                      </div>
                      <h4 className="text-lg font-bold text-white break-words">{task.title}</h4>
                    </div>
                    {task.description && (
                      <p className="text-sm text-slate-400 pl-[38px] mt-2 break-words leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap md:flex-nowrap items-center gap-4 pl-[38px] md:pl-0 shrink-0 mt-2 md:mt-1">
                    <div className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${priorityCfg.color}`}>
                      <Flag size={12} className="inline mr-1" /> {priorityCfg.label}
                    </div>

                    {task.due_date && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-md">
                        <Calendar size={12} /> {task.due_date}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 w-28">
                      {task.assignee_id && task.assignee_id !== "unassigned" ? (
                        <>
                          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] border border-slate-600 shrink-0">
                            {task.assignee_name?.charAt(0) || '?'}
                          </div>
                          <span className="truncate">{task.assignee_name}</span>
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700 border-dashed text-slate-500 shrink-0">
                            <UserIcon size={12} />
                          </div>
                          <span className="text-slate-500 italic">Unassigned</span>
                        </>
                      )}
                    </div>

                    <div className="relative ml-auto md:ml-2" ref={activeDropdown === task.id ? dropdownRef : null}>
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === task.id ? null : task.id)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>
                      
                      {activeDropdown === task.id && (
                        <div className="absolute right-0 mt-2 w-36 bg-[#1e293b] rounded-xl shadow-2xl border border-slate-700 py-1.5 z-50">
                          <button onClick={() => openModal('edit', task)} className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-2">
                            <Edit2 size={14} /> Edit Task
                          </button>
                          <div className="h-px w-full bg-slate-700/50 my-1"></div>
                          <button onClick={() => handleDelete(task.id)} className="w-full text-left px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </main>
      <Footer />

      {/* --- CREATE / EDIT TASK MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B1120]/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121a2f] border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col transform scale-100 transition-all max-h-[90vh]">
            
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-white">
                {modalMode === 'create' ? 'Create New Task' : 'Edit Task'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700 p-1.5 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4 overflow-y-auto">
              {error && (
                <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 tracking-wider uppercase">Task Title</label>
                <input 
                  type="text" required placeholder="e.g. Design Homepage" value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-slate-700 bg-[#0B1120] text-white rounded-xl px-4 py-2.5 text-sm focus:border-cyan-500 outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 tracking-wider uppercase">Description (Optional)</label>
                <textarea 
                  rows="3" placeholder="Add details..." value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-slate-700 bg-[#0B1120] text-white rounded-xl px-4 py-2.5 text-sm focus:border-cyan-500 outline-none resize-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 tracking-wider uppercase">Status</label>
                  <select 
                    value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full border border-slate-700 bg-[#0B1120] text-white rounded-xl px-3 py-2.5 text-sm focus:border-cyan-500 outline-none"
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">Active</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 tracking-wider uppercase">Priority</label>
                  <select 
                    value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full border border-slate-700 bg-[#0B1120] text-white rounded-xl px-3 py-2.5 text-sm focus:border-cyan-500 outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 tracking-wider uppercase">Due Date</label>
                  <input 
                    type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    className="w-full border border-slate-700 bg-[#0B1120] text-slate-300 rounded-xl px-3 py-2.5 text-sm focus:border-cyan-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 tracking-wider uppercase">Assign To</label>
                  <select 
                    value={formData.assignee_id} onChange={(e) => setFormData({...formData, assignee_id: e.target.value})}
                    className="w-full border border-slate-700 bg-[#0B1120] text-white rounded-xl px-3 py-2.5 text-sm focus:border-cyan-500 outline-none"
                  >
                    <option value="">-- Unassigned --</option>
                    {TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting || !formData.title.trim()} className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 transition-all text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50">
                  {isSubmitting ? <><Loader2 size={16} className="inline animate-spin mr-2" /> Saving...</> : modalMode === 'create' ? 'Create Task' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}