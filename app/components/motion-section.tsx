"use client"

import { motion } from "framer-motion"

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
}

export function MotionSection({
  children,
  className,
  delay = 0
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: delay } } }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

export function MotionItem({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={fadeInUp}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function MotionFadeIn({
  children,
  className,
  delay = 0
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
