"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function Navbar() {
    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-white/5"
        >
            <div className="flex items-center">
                <Link href="/" className="text-lg font-bold tracking-widest text-white uppercase font-mono">
                    SMC SCHED
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="outline" className="h-9 px-4 text-xs tracking-wider uppercase border-white/20 hover:bg-white/5 hover:text-white">
                    Login
                </Button>
                <Button className="h-9 px-4 text-xs tracking-wider uppercase bg-white text-black hover:bg-white/90">
                    Sign Up
                </Button>
            </div>
        </motion.header>
    )
}
