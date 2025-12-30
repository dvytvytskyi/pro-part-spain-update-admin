"use client";

import React, { useState } from "react";
import NewsTable, { NewsArticle } from "@/components/news/NewsTable";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import { useRouter } from "next/navigation";

// Mock news data

export default function NewsPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/news');
            const data = await res.json();
            if (Array.isArray(data)) {
                // Map the multilingual data to the simple NewsArticle structure for the table
                const mappedData = data.map((item: any) => ({
                    id: item.id,
                    title: item.title_en || item.title_ru || item.title_ua || "Untitled",
                    text: item.description_en || item.description_ru || item.description_ua || "",
                    image_url: item.featured_image_url || item.image_url || "",
                    published: item.published,
                    created_at: item.created_at,
                }));
                setArticles(mappedData);
            }
        } catch (err) {
            console.error("Failed to fetch news:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTogglePublish = async (id: string, published: boolean) => {
        try {
            const res = await fetch(`/api/news/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ published }),
            });
            if (res.ok) {
                setArticles(articles.map(article =>
                    article.id === id ? { ...article, published } : article
                ));
            }
        } catch (err) {
            console.error("Failed to toggle publish:", err);
        }
    };

    const handleEdit = (id: string) => {
        router.push(`/news/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this news article?")) {
            try {
                const res = await fetch(`/api/news/${id}`, {
                    method: 'DELETE',
                });
                if (res.ok) {
                    setArticles(articles.filter(article => article.id !== id));
                }
            } catch (err) {
                console.error("Failed to delete news:", err);
            }
        }
    };

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            {/* Header Row */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-title-md2 font-bold text-gray-dark dark:text-white">
                    News
                </h2>
                <div className="flex gap-3">
                    <Button
                        size="sm"
                        onClick={() => router.push("/news/add")}
                    >
                        + Add News
                    </Button>
                </div>
            </div>

            {/* Search Row */}
            <div className="mb-6">
                <div className="relative w-full sm:max-w-xs">
                    <InputField
                        type="text"
                        placeholder="Search news..."
                        defaultValue={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z" fill="currentColor" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z" fill="currentColor" />
                        </svg>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-100 items-center justify-center rounded-xl border border-gray-200 bg-white p-10 dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
                        <p className="text-gray-500">Loading news...</p>
                    </div>
                </div>
            ) : (
                <NewsTable
                    articles={filteredArticles}
                    onTogglePublish={handleTogglePublish}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}
