"use client"

import * as React from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, Info } from "lucide-react"
import { type User } from "@supabase/supabase-js"
import { ModeToggle } from "./mode-toggle"

interface NavbarProps {
  onToggleSidebar: () => void;
  onSignInClick?: () => void; // ADD THIS PROP
}

export function Navbar({ onToggleSidebar, onSignInClick }: NavbarProps) {
  const [user, setUser] = React.useState<User | null>(null)

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 h-20 border-b border-border bg-background/80 backdrop-blur-3xl z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <Menu className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black text-xs group-hover:scale-110 transition-transform">L</div>
            <span className="font-black text-lg tracking-tighter uppercase">Lumina<span className="text-emerald-500">.ai</span></span>
          </Link>

          <Link href="/about" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-emerald-500 transition-colors flex items-center gap-2">
            <Info className="w-3 h-3" /> About
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ModeToggle />

        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Logged In</p>
              <p className="text-[12px] text-muted-foreground truncate max-w-37.5">{user.email}</p>
            </div>
            <Button onClick={() => supabase.auth.signOut()} variant="ghost" size="icon" className="rounded-full hover:bg-rose-500/10 hover:text-rose-500">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          <Button 
            onClick={onSignInClick} // TRIGGER THE MODAL
            variant="outline" 
            className="rounded-full border-emerald-500/20 text-emerald-500 font-bold px-6"
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  )
}