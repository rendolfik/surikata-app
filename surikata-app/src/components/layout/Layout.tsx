import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { ToastContainer } from './Toast'

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 bg-[#f0fbfd]">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}
