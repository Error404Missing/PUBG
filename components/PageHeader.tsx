"use client";

import UserNav from "@/components/UserNav";
import { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    description?: string;
    children?: ReactNode;
}

export default function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 relative">
            <div className="flex items-center gap-4">
                <div className="w-2 h-10 bg-gradient-to-b from-primary to-secondary rounded-sm shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                <div>
                    <h1 className="text-4xl font-black text-white tracking-widest uppercase">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-cyber-muted text-sm font-bold uppercase tracking-[0.2em] mt-1">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                {children}
                <UserNav />
            </div>
        </header>
    );
}
