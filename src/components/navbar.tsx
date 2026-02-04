import { ModeToggle } from "./mode-toggle"

export function Navbar() {
  return (
    // We use bg-transparent and backdrop-blur to let the background orbs flow through
    <nav className="sticky top-0 z-50 w-full bg-transparent backdrop-blur-md transition-colors duration-500">
      <div className="container mx-auto flex h-20 items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-black text-xl">L</span>
          </div>
          <span className="text-2xl font-bold tracking-tighter">Lumina.ai</span>
        </div>
        <ModeToggle />
      </div>
    </nav>
  )
}