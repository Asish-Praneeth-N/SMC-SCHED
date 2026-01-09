"use client"

import { motion } from "framer-motion"
import { ShieldCheck, Moon, Scale, Users } from "lucide-react"

const features = [
    {
        icon: ShieldCheck,
        title: "Safety Enforcement",
        description: "Strict 36-hour duty limit adherence."
    },
    {
        icon: Moon,
        title: "Rest Validation",
        description: "Automatic 3-day rest gap guarantees."
    },
    {
        icon: Scale,
        title: "Fair Workload",
        description: "Equitable 4–5 duties distribution."
    },
    {
        icon: Users,
        title: "Intelligent Allocation",
        description: "RICU double-doctor optimization."
    }
]

export function FeatureGrid() {
    return (
        <section className="py-24 px-6 z-10 relative border-t border-white/5 bg-black/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="bg-black p-8 flex flex-col items-start gap-4 hover:bg-white/5 transition-colors duration-300"
                        >
                            <feature.icon className="w-8 h-8 text-white/80" strokeWidth={1} />
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium text-white">{feature.title}</h3>
                                <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
