"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LogIn, Mail, X } from "lucide-react"

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [email, setEmail] = React.useState("")
    const [loading, setLoading] = React.useState(false)

    if (!isOpen) return null;

    const handleGoogleLogin = async () => {
        // Safe window check for Next.js
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: origin }
        })
    }

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        
        const origin = typeof window !== 'undefined' ? window.location.origin : ''

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: origin }
        })
        
        if (error) {
            alert(error.message)
        } else {
            alert("Magic link sent! Check your inbox.")
            onClose()
        }
        setLoading(false)
    }

    return (
        // FIX: Changed z-[100] to standard z-50 for better compatibility
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-md p-8 bg-card/60 backdrop-blur-3xl border border-border rounded-[2.5rem] shadow-2xl space-y-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute right-6 top-6 rounded-full hover:bg-secondary"
                >
                    <X className="w-4 h-4" />
                </Button>

                <div className="text-center space-y-4 mb-8">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/40 leading-none ">
                        Lumina<span className="text-emerald-500">.ai</span>
                    </h2>
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] text-emerald-500/80">
                        Architectural Protocol v1.0
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] pt-2">
                        Architect Account Access
                    </p>
                </div>

                <div className="space-y-3">
                    <Button
                        onClick={handleGoogleLogin}
                        className="w-full h-14 rounded-full bg-white text-black hover:bg-zinc-200 dark:hover:bg-zinc-100 transition-all font-bold flex gap-3 shadow-xl border border-border/50"
                    >
                        <LogIn className="w-5 h-5" /> Continue with Google
                    </Button>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                        <div className="relative flex justify-center text-[10px] uppercase font-black bg-transparent px-4 text-muted-foreground">Or use email</div>
                    </div>

                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <Input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-14 rounded-full bg-background/40 border-border px-6 focus:border-emerald-500/50 transition-all"
                            required
                        />
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        >
                            {loading ? "Processing..." : <><Mail className="w-4 h-4" /> Send Magic Link</>}
                        </Button>
                    </form>
                </div>

                <p className="text-[10px] text-center text-muted-foreground leading-relaxed px-4">
                    By continuing, you agree to Lumina&apos;s system architecture protocols and data privacy standards.
                </p>
            </div>
        </div>
    )
}