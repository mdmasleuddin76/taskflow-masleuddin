// src/pages/Projects.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, Edit2, Trash2, ArrowRight, Clock, CheckCircle2, CircleDashed, Layout, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// IMPORT THE API FUNCTIONS
import { getProjects, createProject, updateProject, deleteProject } from '../api/projects';

export default function Projects() {
  const { user } = useAuth(); 
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [currentProject, setCurrentProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // REAL API CALL: Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        // Assuming your backend returns an object like { projects: [...] }
        // or just the array [...] directly. Adjust according to your backend response.
        setProjects(data.projects || data || []); 
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Could not load projects. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch if user is defined
    if (user) {
        fetchProjects();
    } else {
        setIsLoading(false); // If no user, maybe they are being redirected anyway
    }
  }, [user]);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ name: '', description: '' });
    setCurrentProject(null);
    setIsModalOpen(true);
    setError('');
  };

  const openEditModal = (project) => {
    setModalMode('edit');
    setFormData({ name: project.name, description: project.description });
    setCurrentProject(project);
    setIsModalOpen(true);
    setActiveDropdown(null); 
    setError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', description: '' });
    setError('');
  };

  // REAL API CALL: Create or Update Project
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (modalMode === 'create') {
        const newProject = await createProject(formData.name, formData.description);
        // Add the newly created project to the state
        // The backend should return the full project object, including default stats
        setProjects([newProject, ...projects]);
      } else {
        const updatedProject = await updateProject(currentProject.id, formData.name, formData.description);
        // Replace the old project with the updated one in state
        setProjects(projects.map(p => 
          p.id === currentProject.id ? updatedProject : p
        ));
      }
      closeModal();
    } catch (err) {
      console.error("Failed to save project", err);
      setError(err.response?.data?.error || "Failed to save project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // REAL API CALL: Delete Project
  const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    
    setActiveDropdown(null);
    
    try {
        await deleteProject(projectId);
        // Remove from state only if API call succeeds
        setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
         console.error("Failed to delete project", err);
         alert("Failed to delete project. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1120] font-sans overflow-x-hidden w-full flex flex-col">
        <Navbar />
        <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-grow">
          <div className="h-10 w-48 bg-slate-800/50 rounded-lg animate-pulse mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-56 bg-slate-800/30 border border-slate-800 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] font-sans selection:bg-cyan-500/30 selection:text-cyan-100 overflow-x-hidden w-full flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 w-full relative z-10">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-cyan-400 text-xs font-semibold mb-2 backdrop-blur-sm">
              <Layout size={14} /> Workspace
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Projects</h1>
            <p className="text-sm text-slate-400 mt-1">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'} you own or contribute to.
            </p>
          </div>
          <button 
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white px-5 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all active:scale-95 shrink-0 text-sm"
          >
            <Plus size={18} /> New Project
          </button>
        </div>

        {error && !isModalOpen && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">
                {error}
            </div>
        )}

        {/* TIGHTENED GRID: reduced gap and card padding */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {projects.length === 0 && !error ? (
               <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                   <p className="text-slate-400">You don't have any projects yet. Create one to get started!</p>
               </div>
          ) : (
            projects.map((project) => {
                // Ensure we have defaults if the backend doesn't send them yet
                const stats = project.stats || { todo: 0, in_progress: 0, done: 0, total: 0 };
                const progress = project.progress || 0;
                const ownerName = project.ownerName || 'Unknown';
                const isOwner = user?.id === project.owner_id;

                return (
                <div 
                    key={project.id} 
                    className="bg-[#121a2f]/80 backdrop-blur-xl border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl hover:border-slate-700 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(6,182,212,0.05)] transition-all duration-300 relative group flex flex-col"
                >
                    <div className="flex justify-between items-start mb-3">
                    <div className="pr-3">
                        <h3 className="text-lg sm:text-xl font-bold text-white leading-tight mb-1.5 group-hover:text-cyan-400 transition-colors">
                        {project.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                        {project.description}
                        </p>
                    </div>
                    
                    {isOwner && (
                        <div className="relative shrink-0" ref={activeDropdown === project.id ? dropdownRef : null}>
                        <button 
                            onClick={(e) => {
                            e.preventDefault();
                            setActiveDropdown(activeDropdown === project.id ? null : project.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <MoreVertical size={18} />
                        </button>
                        
                        {activeDropdown === project.id && (
                            <div className="absolute right-0 mt-2 w-36 bg-[#1e293b] rounded-xl shadow-2xl border border-slate-700 py-1.5 z-20 overflow-hidden">
                            <button 
                                onClick={() => openEditModal(project)}
                                className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors"
                            >
                                <Edit2 size={14} /> Edit Details
                            </button>
                            <div className="h-px w-full bg-slate-700/50 my-1"></div>
                            <button 
                                onClick={() => handleDelete(project.id)}
                                className="w-full text-left px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2 transition-colors"
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                            </div>
                        )}
                        </div>
                    )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-300 mb-5 pt-1">
                    <div className="flex items-center gap-1 bg-slate-800/60 border border-slate-700 px-2 py-1 rounded-md">
                        <CircleDashed size={12} className="text-slate-400" />
                        <span>{stats.todo} Todo</span>
                    </div>
                    <div className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-1 rounded-md">
                        <Clock size={12} className="text-indigo-400" />
                        <span>{stats.in_progress} Active</span>
                    </div>
                    <div className="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-2 py-1 rounded-md">
                        <CheckCircle2 size={12} className="text-cyan-400" />
                        <span>{stats.done} Done</span>
                    </div>
                    </div>

                    <div className="mb-4 mt-auto">
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-200">{progress}% completed</span>
                        <span className="text-slate-500 font-medium">{stats.total} tasks</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-700">
                        <div 
                        className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-out relative" 
                        style={{ width: `${progress}%` }}
                        >
                        <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/30 blur-sm rounded-full"></div>
                        </div>
                    </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                        {ownerName.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-slate-400">
                        {isOwner ? 'Owned by you' : `By ${ownerName.split(' ')[0]}`}
                        </span>
                    </div>
                    
                    <Link 
                        to={`/projects/${project.id}`} 
                        className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group/link transition-colors"
                    >
                        Open Board
                        <ArrowRight size={14} className="transform group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                    </div>
                </div>
                );
            })
          )}
        </div>
      </main>

      <Footer />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B1120]/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121a2f] border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col transform scale-100 transition-all">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {modalMode === 'create' ? 'Create New Project' : 'Edit Project Details'}
              </h3>
              <button 
                onClick={closeModal}
                className="text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700 p-1.5 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
              
              {/* Show errors specifically inside the modal if it fails to submit */}
              {error && (
                <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium">
                    {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 tracking-wider uppercase">Project Title</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Website Redesign"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full border border-slate-700 bg-[#0B1120] text-white rounded-xl px-4 py-3 text-sm transition focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-600 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 tracking-wider uppercase">Description</label>
                <textarea 
                  rows="4"
                  placeholder="Briefly describe the goals of this project..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="block w-full border border-slate-700 bg-[#0B1120] text-white rounded-xl px-4 py-3 text-sm transition focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-600 outline-none resize-none" 
                />
              </div>
              <div className="pt-2 flex items-center gap-3">
                <button 
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-50 text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !formData.name.trim()}
                  className="flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50 active:scale-95 text-sm"
                >
                  {isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Saving...</>
                  ) : (
                    modalMode === 'create' ? 'Create Project' : 'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}