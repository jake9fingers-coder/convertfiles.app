"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Tab {
    id?: string;
    title: string;
    icon: LucideIcon;
    type?: never;
}

interface Separator {
    type: "separator";
    title?: never;
    icon?: never;
}

type TabItem = Tab | Separator;

interface ExpandableTabsProps {
    tabs: TabItem[];
    className?: string;
    activeColor?: string;
    onChange?: (index: number | null) => void;
    onTabClick?: (index: number) => void;
}

const spanVariants = {
    initial: { opacity: 0, y: -5, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -5, scale: 0.95 },
};

const transition = { delay: 0.1, type: "spring", bounce: 0, duration: 0.6 } as const;

export function ExpandableTabs({
    tabs,
    className,
    activeColor = "text-primary",
    onChange,
    onTabClick,
}: ExpandableTabsProps) {
    const [hovered, setHovered] = React.useState<number | null>(null);
    const outsideClickRef = React.useRef<HTMLDivElement>(null);

    useOnClickOutside(outsideClickRef as any, () => {
        setHovered(null);
        onChange?.(null);
    });

    const handleClick = (index: number) => {
        onTabClick?.(index);
    };

    const Separator = () => (
        <div className="mx-1 h-[24px] w-[1.2px] bg-border" aria-hidden="true" />
    );

    return (
        <div
            ref={outsideClickRef}
            className={cn(
                "flex flex-wrap items-center gap-2 rounded-2xl border bg-background p-1 shadow-sm",
                className
            )}
        >
            {tabs.map((tab, index) => {
                if (tab.type === "separator") {
                    return <Separator key={`separator-${index}`} />;
                }

                const Icon = tab.icon;
                const isHovered = hovered === index;
                return (
                    <div
                        key={tab.id ?? tab.title}
                        onMouseEnter={() => {
                            setHovered(index);
                            onChange?.(index);
                        }}
                        onMouseLeave={() => {
                            setHovered(null);
                            onChange?.(null);
                        }}
                        className="relative flex items-center justify-center w-10 h-10"
                    >
                        <button
                            onClick={() => handleClick(index)}
                            className={cn(
                                "relative z-20 flex items-center justify-center rounded-xl w-full h-full text-sm font-medium transition-colors duration-200 cursor-pointer text-muted-foreground",
                                isHovered ? cn("bg-muted", activeColor) : "hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon size={20} />
                        </button>

                        <AnimatePresence>
                            {isHovered && (
                                <motion.div
                                    variants={spanVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={transition}
                                    className="absolute top-[calc(100%+4px)] left-1/2 -translate-x-1/2 whitespace-nowrap bg-background text-foreground px-4 py-2 rounded-b-xl border border-t-0 border-dark-200 shadow-sm z-10 pointer-events-none flex items-center justify-center font-bold text-xs"
                                >
                                    {tab.title}
                                    {/* Mask to erase the parent border and create the seamless effect */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] -mt-[1px] bg-background z-30" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}
