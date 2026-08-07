import { Server } from 'lucide-react'

export function WhiteboardHeader() {
  return (
    <header className="flex min-h-24 items-center gap-3 border-b border-slate-200 px-5 py-4 sm:px-8">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-200">
        <Server size={22} />
      </div>
      <div>
        <p className="text-[10px] font-extrabold tracking-[0.2em] text-indigo-500">
          SUDO SYSTEM
        </p>
        <h1 className="text-base font-extrabold tracking-tight text-slate-800 sm:text-xl">
          Whiteboard for System Design
        </h1>
      </div>
      <div className="ml-auto hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 font-mono text-[10px] text-emerald-700 sm:flex">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> API ready
      </div>
    </header>
  )
}
