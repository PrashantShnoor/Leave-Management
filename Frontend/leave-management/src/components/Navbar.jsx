import React from "react";
import { NavLink , Outlet} from "react-router-dom";
import { FaCalendarDay } from "react-icons/fa6";
import { FaHome } from "react-icons/fa";
import { BiBuoy } from "react-icons/bi";
import { BiCalendarCheck } from "react-icons/bi";

const Navbar = () => {
  return (
    <div className="drawer lg:drawer-open">
    <input id="my-drawer-4" type="checkbox" className="drawer-toggle inline" />
    <div className="drawer-content">
      <nav className="navbar w-full bg-green-50">
        <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost drawer-button">
          <FaCalendarDay className="size-7 text-green-600" />
        </label>
        <div className="font-bold text-xl px-2 text-blue-700">Leave Management System</div>
      </nav>
      <div className="p-4">
          <Outlet />
      </div>
    </div>

  <div className="drawer-side is-drawer-close:overflow-visible">
    <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
    <div className="flex min-h-full flex-col items-start bg-green-50 is-drawer-close:w-16 is-drawer-open:w-64">
      
      <ul className="menu w-full grow gap-2">
        <li>
          <NavLink to= "/dashboard" end className={({ isActive }) => `${isActive ? "bg-black text-white hover:bg-black" : ""} is-drawer-close:tooltip is-drawer-close:tooltip-right`} data-tip = "Dashboard">
            <FaHome className="size-6" />
            <span className="is-drawer-close:hidden font-semibold text-lg">Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/leaves" className={({ isActive }) => `${isActive ? "bg-black text-white hover:bg-black" : ""} is-drawer-close:tooltip is-drawer-close:tooltip-right` } data-tip = "Leaves">
          <BiBuoy className="size-6" />
            <span className="is-drawer-close:hidden font-semibold text-lg">Leaves</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/manage" className={({ isActive }) => `${isActive ? "bg-black text-white hover:bg-black" : ""} is-drawer-close:tooltip is-drawer-close:tooltip-right` } data-tip = "Leaves">
          <BiCalendarCheck  className="size-6"/>
            <span className="is-drawer-close:hidden font-semibold text-lg">Manage</span>
          </NavLink>
        </li>
      </ul>
    </div>
  </div>
    </div>
  );
};

export default Navbar;
