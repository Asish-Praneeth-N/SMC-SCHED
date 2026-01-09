"use client"

import { motion } from "framer-motion"

export function BackgroundGrid() {
    return (
        <div className="fixed inset-0 z-[-1] bg-background pointer-events-none flex items-center justify-center">
            {/* Radial Gradient for focus */}
            <div className="absolute inset-0 bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] z-10" />

            {/* Grid */}
            <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ duration: 2 }}
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                }}
            >
                <motion.div
                    className="absolute inset-0"
                    animate={{
                        backgroundPosition: ["0px 0px", "0px 50px"] // Moving down 1 grid cell
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 10,
                        ease: "linear"
                    }}
                    style={{
                        backgroundImage: "inherit",
                        backgroundSize: "inherit",
                        width: "100%",
                        height: "100%"
                    }}
                />
            </motion.div>
        </div>
    )
}
