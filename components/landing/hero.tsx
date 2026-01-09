"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function Hero() {
    return (
        <section className="relative flex flex-col items-center justify-center min-h-[80vh] px-4 text-center z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-4xl mx-auto space-y-8"
            >
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                    Medically Safe. Fair. <br />
                    <span className="text-white/60">Automated Night-Duty Scheduling.</span>
                </h1>

                <p className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto font-light leading-relaxed">
                    Designed for doctors. Built for hospitals. <br />
                    <span className="text-white">Zero violations. Zero guesswork.</span>
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                    <Link href="/sign-up">
                        <Button size="lg" className="min-w-[160px] h-12 text-sm tracking-widest uppercase bg-white text-black hover:bg-white/90">
                            Sign Up
                        </Button>
                    </Link>
                    <Link href="/sign-in">
                        <Button size="lg" variant="outline" className="min-w-[160px] h-12 text-sm tracking-widest uppercase border-white/20 hover:bg-white/5 hover:text-white">
                            Login
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </section>
    )
}
