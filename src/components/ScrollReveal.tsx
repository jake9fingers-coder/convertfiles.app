import { useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ScrollRevealProps {
    children: ReactNode
    className?: string
    delay?: number
    once?: boolean
}

export default function ScrollReveal({ children, className = '', delay = 0, once = true }: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        if (!ref.current) return
        const el = ref.current

        // Exact same animation as Synctile: opacity 0, y 20 → opacity 1, y 0
        const anim = gsap.fromTo(
            el,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 1.2,
                delay,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top bottom',
                    toggleActions: once ? 'play none none none' : 'play reverse play reverse',
                    markers: false,
                },
            }
        )

        return () => { anim.kill() }
    }, [delay, once])

    return (
        <div ref={ref} className={className} style={{ opacity: 0 }}>
            {children}
        </div>
    )
}
