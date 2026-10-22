'use client'

import { useState, type ReactNode } from 'react'
import { useLocation } from '../lib/nav'
import Sidebar from '../components/Sidebar'
import TopNav from '../components/TopNav'

export default function MainLayout({ children }: { children?: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="app-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="main-area">
        <TopNav onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
        <main className="main-content" key={location.pathname}>
          {children}
        </main>
      </div>
    </div>
  )
}
