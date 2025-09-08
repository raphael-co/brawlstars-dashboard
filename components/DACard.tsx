"use client";

import React from "react";
import { motion } from "framer-motion";

type DACardProps = {
    children: React.ReactNode;
    className?: string;
    innerClassName?: string;
    delay?: number;
    once?: boolean;
};

const variants = {
    hidden: { opacity: 0, y: 14, scale: 0.98, filter: "brightness(0.9)" },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "brightness(1)",
        transition: { type: "spring", stiffness: 280, damping: 20 },
    },
};

export function DACard({
    children,
    className = "",
    innerClassName = "",
    delay,
    once = true,
}: DACardProps) {
    return (
        <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once, amount: 0.2 }}
            variants={variants}
            transition={{ delay: delay ?? 0 }}
            whileHover={{ y: -4, rotate: -0.5 }}
            whileTap={{ scale: 0.99, rotate: 0.25 }}
            className={[
                "relative rounded-2xl border-4 border-black shadow-[0_10px_0_#0B1225,0_16px_28px_rgba(0,0,0,0.45)]  h-full",
                className,
            ].join(" ")}
        >
            <motion.div
                aria-hidden
                className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-yellow-300/15 via-fuchsia-300/10 to-sky-300/15 blur-md  h-full"
                initial={{ opacity: 0.7 }}
                animate={{ opacity: [0.5, 0.82, 0.5] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <div
                className={[
                    "relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1B2B65] via-[#2737A5] to-[#4C2BBF] p-4 sm:p-5  h-full",
                    innerClassName,
                ].join(" ")}
            >
                <div className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay">
                    <div className="absolute inset-0 bg-[radial-gradient(600px_300px_at_15%_15%,rgba(255,255,255,0.12),transparent_60%)]" />
                    <div className="absolute -right-16 -top-10 h-48 w-[480px] -rotate-12 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.16)_0,rgba(255,255,255,0.16)_2px,transparent_2px,transparent_8px)]" />
                </div>

                {children}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
        </motion.div>
    );
}
