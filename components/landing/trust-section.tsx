"use client"

import { motion } from "framer-motion"

export function TrustSection() {
    return (
        <section className="py-24 px-6 relative z-10 flex items-center justify-center border-t border-white/5 bg-black">
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="max-w-3xl text-center"
            >
                <p className="text-xl md:text-2xl font-light text-white/70 leading-relaxed font-serif tracking-wide">
                    "Designed around real hospital duty rules and medical safety constraints."
                </p>
            </motion.div>
        </section>
    )
}
