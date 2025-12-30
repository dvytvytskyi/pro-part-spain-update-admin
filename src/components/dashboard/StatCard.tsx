import React from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string; // Optional for icon background
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = "bg-brand-500" }) => {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-dark">
            <div className="flex items-center justify-between">
                <div>
                    <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {title}
                    </p>
                    <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {value}
                    </h4>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${color}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};
