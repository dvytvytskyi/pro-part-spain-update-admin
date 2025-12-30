"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button/Button";

export default function ApiDocsPage() {
    const [activeTab, setActiveTab] = useState("auth");

    const tabs = [
        { id: "auth", label: "Authentication" },
        { id: "properties", label: "Properties" },
        { id: "news", label: "News" },
    ];

    return (
        <div className="mx-auto max-w-5xl py-8">
            <div className="mb-8">
                <h1 className="mb-2 text-3xl font-bold text-gray-dark dark:text-white">
                    API Documentation
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Integration guide for external applications.
                </p>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row">
                {/* Sidebar Navigation */}
                <div className="w-full shrink-0 lg:w-64">
                    <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <nav className="flex flex-col space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? "bg-brand-50 bg-opacity-10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400"
                                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-8">
                    {/* Authentication Section */}
                    {activeTab === "auth" && (
                        <div className="space-y-6">
                            <SectionTitle title="Authentication" />
                            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
                                <p className="mb-4 text-gray-600 dark:text-gray-400">
                                    All API requests must be authenticated using your API Key and Secret.
                                    These credentials should be included in the request headers.
                                </p>

                                <div className="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-[#151D2F]">
                                    <h4 className="mb-2 font-semibold text-gray-800 dark:text-white">Headers</h4>
                                    <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                        <li><code className="rounded bg-gray-200 px-1 py-0.5 text-gray-800 dark:bg-gray-800 dark:text-gray-200">x-api-key</code>: Your public API key</li>
                                        <li><code className="rounded bg-gray-200 px-1 py-0.5 text-gray-800 dark:bg-gray-800 dark:text-gray-200">x-api-secret</code>: Your private API secret</li>
                                    </ul>
                                </div>

                                <div className="rounded-lg bg-gray-900 p-4 font-mono text-sm text-gray-300">
                                    <p className="mb-2 text-gray-500">// Example fetch request</p>
                                    <p>
                                        <span className="text-purple-400">fetch</span>(
                                        <span className="text-green-400">"https://admin.pro-part.es/api/properties"</span>, {"{"}
                                    </p>
                                    <p className="pl-4">
                                        <span className="text-blue-400">headers</span>: {"{"}
                                    </p>
                                    <p className="pl-8">
                                        <span className="text-green-400">"x-api-key"</span>: <span className="text-yellow-400">"YOUR_API_KEY"</span>,
                                    </p>
                                    <p className="pl-8">
                                        <span className="text-green-400">"x-api-secret"</span>: <span className="text-yellow-400">"YOUR_API_SECRET"</span>
                                    </p>
                                    <p className="pl-4">{"}"}</p>
                                    <p>{"}"});</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Properties Section */}
                    {activeTab === "properties" && (
                        <div className="space-y-6">
                            <SectionTitle title="Properties API" />

                            {/* GET List */}
                            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
                                <EndpointBadge method="GET" path="/api/properties" />
                                <p className="mb-4 mt-4 text-gray-600 dark:text-gray-400">
                                    Retrieve a paginated list of properties with filtering options.
                                </p>

                                <h4 className="mb-2 font-semibold text-gray-800 dark:text-white">Query Parameters</h4>
                                <div className="mb-6 overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                                        <thead className="border-b border-gray-200 bg-gray-50 uppercase text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                                            <tr>
                                                <th className="px-4 py-3">Parameter</th>
                                                <th className="px-4 py-3">Type</th>
                                                <th className="px-4 py-3">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            <tr className="bg-white dark:bg-transparent">
                                                <td className="px-4 py-3 font-medium">type</td>
                                                <td className="px-4 py-3">string</td>
                                                <td className="px-4 py-3">One of: <code className="text-xs">Off-Plan</code>, <code className="text-xs">Secondary</code>, <code className="text-xs">Rent</code></td>
                                            </tr>
                                            <tr className="bg-white dark:bg-transparent">
                                                <td className="px-4 py-3 font-medium">search</td>
                                                <td className="px-4 py-3">string</td>
                                                <td className="px-4 py-3">Search by name, reference ID, or town</td>
                                            </tr>
                                            <tr className="bg-white dark:bg-transparent">
                                                <td className="px-4 py-3 font-medium">page</td>
                                                <td className="px-4 py-3">number</td>
                                                <td className="px-4 py-3">Page number (default: 1)</td>
                                            </tr>
                                            <tr className="bg-white dark:bg-transparent">
                                                <td className="px-4 py-3 font-medium">limit</td>
                                                <td className="px-4 py-3">number</td>
                                                <td className="px-4 py-3">Items per page (default: 20)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <h4 className="mb-2 font-semibold text-gray-800 dark:text-white">Example Response</h4>
                                <div className="rounded-lg bg-gray-900 p-4 font-mono text-xs text-gray-300 overflow-x-auto">
                                    <pre>{`{
  "data": [
    {
      "id": 123,
      "development_name": "Luxury Villa",
      "price": 500000,
      "coordinates": { "latitude": 36.5, "longitude": -4.8 },
      ...
    }
  ],
  "totalItems": 45,
  "totalPages": 3,
  "currentPage": 1,
  "itemsPerPage": 20
}`}</pre>
                                </div>
                            </div>

                            {/* GET Single */}
                            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
                                <EndpointBadge method="GET" path="/api/properties/{id}" />
                                <p className="mb-4 mt-4 text-gray-600 dark:text-gray-400">
                                    Retrieve full details of a specific property by its ID.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* News Section */}
                    {activeTab === "news" && (
                        <div className="space-y-6">
                            <SectionTitle title="News API" />
                            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
                                <EndpointBadge method="GET" path="/api/news" />
                                <p className="mb-4 mt-4 text-gray-600 dark:text-gray-400">
                                    Retrieve a list of news articles.
                                </p>

                                <h4 className="mb-2 font-semibold text-gray-800 dark:text-white">Example Response</h4>
                                <div className="rounded-lg bg-gray-900 p-4 font-mono text-xs text-gray-300 overflow-x-auto">
                                    <pre>{`[
  {
    "id": "1709823",
    "title": "New Market Trends",
    "content": "Full article content...",
    "image": "https://example.com/image.jpg",
    "published": true,
    "created_at": "2024-12-25T10:00:00Z"
  }
]`}</pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SectionTitle({ title }: { title: string }) {
    return (
        <h2 className="text-xl font-bold text-gray-800 dark:text-white underline decoration-brand-500 decoration-2 underline-offset-4">
            {title}
        </h2>
    );
}

function EndpointBadge({ method, path }: { method: string; path: string }) {
    const color =
        method === "GET"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            : method === "POST"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

    return (
        <div className="flex items-center gap-3 font-mono">
            <span className={`rounded-md px-2.5 py-1 text-sm font-bold ${color}`}>
                {method}
            </span>
            <span className="text-gray-700 dark:text-gray-300">{path}</span>
        </div>
    );
}
