"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Tab {
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

const buttonVariants = {
    initial: {
        gap: 0,
        paddingLeft: ".5rem",
        paddingRight: ".5rem",
    },
    animate: (isHovered: boolean) => ({
        gap: isHovered ? ".5rem" : 0,
        paddingLeft: isHovered ? "1rem" : ".5rem",
        paddingRight: isHovered ? "1rem" : ".5rem",
    }),
};

const spanVariants = {
    initial: { width: 0, opacity: 0 },
    animate: { width: "auto", opacity: 1 },
    exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.05, type: "spring", bounce: 0, duration: 0.4 } as const;

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
                    <motion.button
                        key={tab.title}
                        variants={buttonVariants}
                        initial={false}
                        animate="animate"
                        custom={isHovered}
                        onClick={() => handleClick(index)}
                        onMouseEnter={() => {
                            setHovered(index);
                            onChange?.(index);
                        }}
                        onMouseLeave={() => {
                            setHovered(null);
                            onChange?.(null);
                        }}
                        transition={transition}
                        className={cn(
                            "relative flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-300 cursor-pointer",
                            isHovered
                                ? cn("bg-muted", activeColor)
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <Icon size={20} />
                        <AnimatePresence initial={false}>
                            {isHovered && (
                                <motion.span
                                    variants={spanVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={transition}
                                    className="overflow-hidden whitespace-nowrap"
                                >
                                    {tab.title}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                );
            })}
        </div>
    );
}
