"use client";

import * as React from "react";
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

export function ExpandableTabs({
    tabs,
    className,
    activeColor = "text-brand-600",
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
        <div className="mx-1 h-[24px] w-[1px] bg-dark-200 mt-2 transition-all duration-300" aria-hidden="true" />
    );

    return (
        <div
            ref={outsideClickRef}
            className={cn(
                "flex items-start gap-2 rounded-2xl border border-dark-200 bg-white p-1 shadow-sm transition-all duration-300 ease-out overflow-hidden relative",
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
                        onClick={() => handleClick(index)}
                        className={cn(
                            "relative flex flex-col items-center shrink-0 z-10 hover:z-50 cursor-pointer transition-all duration-300 bg-transparent rounded-xl",
                            // Keep width fixed at 40px so no sideways layout shift happens
                            "w-10",
                            // Animate height dynamically directly in css
                            isHovered ? "h-[62px]" : "h-10"
                        )}
                    >
                        {/* Interactive Pill Overlay */}
                        <div
                            className={cn(
                                "absolute inset-0 rounded-xl transition-colors duration-300 pointer-events-none",
                                isHovered ? "bg-dark-50" : "bg-transparent"
                            )}
                        />

                        {/* Icon */}
                        <div
                            className={cn(
                                "relative w-10 h-10 flex shrink-0 items-center justify-center transition-colors duration-300 pointer-events-none",
                                isHovered ? activeColor : "text-dark-500"
                            )}
                        >
                            <Icon size={20} />
                        </div>

                        {/* Text Label Below Extends Horizontally Out Of Element Boundaries */}
                        <div
                            className={cn(
                                "absolute top-[38px] left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none transition-all duration-300 flex justify-center",
                                isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
                            )}
                        >
                            <span
                                className={cn(
                                    "text-[11px] font-bold tracking-wide",
                                    activeColor
                                )}
                            >
                                {tab.title}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
