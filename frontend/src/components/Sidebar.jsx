import React from 'react';

const Sidebar = () => {
  return (
    <div className="drawer lg:drawer-open">
    <input id="my-drawer-1" type="checkbox" className="drawer-toggle" />
    <div className="drawer-content">
      {/* Page content here */}
      <label htmlFor="my-drawer-1" className="btn drawer-button lg:hidden">Open drawer</label>
    </div>
    <div className="drawer-side">
      <label htmlFor="my-drawer-1" aria-label="close sidebar" className="drawer-overlay"></label>
      <ul className="menu bg-base-200 min-h-full w-90 p-4">
        {/* Sidebar content here */}
        <li><a>Sidebar Item 1</a></li>
        <li><a>Sidebar Item 2</a></li>
      </ul>
    </div>
  </div>
  )
}

export default Sidebar