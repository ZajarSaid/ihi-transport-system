import { NavLink } from '../lib/nav';
import {
  FiGrid,
  FiFileText,
  FiPlusSquare,
  FiUser,
  FiUserCheck,
  FiBriefcase,
  FiDollarSign,
  FiTruck,
  FiBox,
  FiUsers,
  FiSettings,
  FiList,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../data/users";

function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const role = user?.role;

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) onClose();
  };

  const linkClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <aside className={`sidebar${isOpen ? " sidebar-open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">TRS</div>
        <span className="brand-text">Transport Request System</span>
      </div>

      <nav className="sidebar-nav">
        {role === ROLES.APPLICANT && (
          <div className="nav-section" data-accent="blue">
            <span className="nav-section-title">Main</span>
            <NavLink to="/dashboard" className={linkClass} onClick={handleLinkClick}>
              <FiGrid className="nav-icon" />
              Dashboard
            </NavLink>
          </div>
        )}

        {role === ROLES.APPLICANT && (
          <div className="nav-section" data-accent="violet">
            <span className="nav-section-title">Applicant</span>
            <NavLink to="/requests" className={linkClass} onClick={handleLinkClick}>
              <FiFileText className="nav-icon" />
              My Requests
            </NavLink>
            <NavLink to="/requests/new" className={linkClass} onClick={handleLinkClick}>
              <FiPlusSquare className="nav-icon" />
              New Request
            </NavLink>
          </div>
        )}

        {[ROLES.COST_CENTER, ROLES.BRANCH_MANAGER, ROLES.ACCOUNTANT].includes(
          role,
        ) && (
          <div className="nav-section" data-accent="pink">
            <span className="nav-section-title">Approvals</span>
            {role === ROLES.COST_CENTER && (
              <NavLink
                to="/approvals/cost-center"
                className={linkClass}
                onClick={handleLinkClick}
              >
                <FiUserCheck className="nav-icon" />
                Cost Center Approval
              </NavLink>
            )}
            {role === ROLES.BRANCH_MANAGER && (
              <NavLink
                to="/approvals/branch-manager"
                className={linkClass}
                onClick={handleLinkClick}
              >
                <FiBriefcase className="nav-icon" />
                Branch Manager Approval
              </NavLink>
            )}
            {role === ROLES.ACCOUNTANT && (
              <NavLink
                to="/approvals/accountant"
                className={linkClass}
                onClick={handleLinkClick}
              >
                <FiDollarSign className="nav-icon" />
                Accountant Approval
              </NavLink>
            )}
          </div>
        )}

        {role === ROLES.RECEPTIONIST && (
          <div className="nav-section" data-accent="emerald">
            <span className="nav-section-title">Reception</span>
            <NavLink to="/reception" className={linkClass} onClick={handleLinkClick}>
              <FiTruck className="nav-icon" />
              Driver Assignment
            </NavLink>
            <NavLink
              to="/reception/vehicles"
              className={linkClass}
              onClick={handleLinkClick}
            >
              <FiBox className="nav-icon" />
              Vehicles
            </NavLink>
            <NavLink
              to="/reception/drivers"
              className={linkClass}
              onClick={handleLinkClick}
            >
              <FiUsers className="nav-icon" />
              Drivers
            </NavLink>
          </div>
        )}

        {role === ROLES.ADMIN && (
          <div className="nav-section" data-accent="rose">
            <span className="nav-section-title">Administration</span>
            <NavLink to="/admin" className={linkClass} onClick={handleLinkClick}>
              <FiSettings className="nav-icon" />
              Admin Dashboard
            </NavLink>
            <NavLink
              to="/admin/requests"
              className={linkClass}
              onClick={handleLinkClick}
            >
              <FiList className="nav-icon" />
              All Requests
            </NavLink>
          </div>
        )}
      </nav>

      {user && (
        <div className="sidebar-user">
          <FiUser className="sidebar-user-icon" />
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user.name}</span>
            <span className="sidebar-user-email">{user.email}</span>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
