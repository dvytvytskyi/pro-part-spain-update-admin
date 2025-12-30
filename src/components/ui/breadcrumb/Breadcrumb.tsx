import React from "react";
import Link from "next/link";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                {items.map((item, index) => (
                    <li key={index} className="inline-flex items-center">
                        {index > 0 && (
                            <svg
                                aria-hidden="true"
                                className="mx-1 h-6 w-6 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                        )}
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-brand-600 dark:text-gray-400 dark:hover:text-white"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};
