import { Link, useLocation, useNavigate } from "react-router-dom";
import { FileText, FilePlus, Folder, Archive, Search, User, LogOut, ClipboardList, Layers, FileCheck, FileSearch, FileStack, Users, Upload, BookOpen, FileBarChart } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
const menu = [
  {
    section: "DASHBOARD",
    items: [
      { name: "Dashboard", path: "/vc_office/dashboard", icon: <FileText size={20} /> },
      { name: "Events", path: "/vc_office/events", icon: <Archive size={20} /> },
    ]
  },
  {
    section: "DOCUMENT MANAGEMENT",
    items: [
      { name: "All Circulars", path: "/vc_office/circulars", icon: <BookOpen size={20} /> },
      { name: "Upload Circular", path: "/vc_office/uploads", icon: <Upload size={20} /> },
      { name: "Faculty Reviews", path: "/vc_office/faculty-reviews", icon: <Users size={20} /> },
    ]
  },
  {
    section: "LEAVE PROCESSING",
    items: [
      { name: "Leave Processing", path: "/vc_office/leave-processing", icon: <ClipboardList size={20} /> },
    ]
  },
];

const VcOfficeSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || '{}');
  const { logout } = useAuth();
  
    const handleLogout = async (e: React.MouseEvent) => {
      e.preventDefault();
      await logout();
      navigate('/');
    };
  
  return (
    <aside className="w-64 bg-[#8B0000] text-white min-h-screen flex flex-col">
      <div className="p-6 text-2xl font-bold border-b border-white/10 flex items-center gap-2">
        <FileText size={28} /> VC Office
      </div>
      <nav className="flex-1 overflow-y-auto">
        {menu.map(section => (
          <div key={section.section} className="mb-2">
            <div className="px-6 py-2 text-xs font-bold tracking-widest text-white/70 uppercase">
              {section.section}
            </div>
            {section.items.map(item => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 hover:bg-[#a80000] ${location.pathname === item.path ? "bg-[#a80000]" : ""}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="p-6 border-t border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-[#8B0000] font-bold text-lg">
          {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 3) : 'VC'}
        </div>
        <div className="flex-1">
          <div className="font-medium truncate">{user?.name || 'VC Office'}</div>
          <div className="text-xs text-white/70 truncate">VC Office</div>
        </div>
        <button onClick={handleLogout} title="Logout" className="ml-2 text-white hover:text-red-300">
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
};
export default VcOfficeSidebar; 