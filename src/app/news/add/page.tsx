"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import InputField from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import Checkbox from "@/components/form/input/Checkbox";
import FileInput from "@/components/form/input/FileInput";
import Select from "@/components/form/Select";

interface NewsFormData {
    title_ua: string;
    description_ua: string;
    title_en: string;
    description_en: string;
    title_ru: string;
    description_ru: string;
    featured_image_url: string;
    publish_immediately: boolean;
    content_sections: ContentSection[];
}

interface ContentSection {
    id: string;
    type: "text" | "image" | "video";
    title_ua: string;
    description_ua: string;
    title_en: string;
    description_en: string;
    title_ru: string;
    description_ru: string;
}

type Language = "ua" | "en" | "ru";

export default function NewsFormPage() {
    const router = useRouter();
    const params = useParams();
    const isEdit = !!params?.id;

    const [activeLanguage, setActiveLanguage] = useState<Language>("en");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState<NewsFormData>({
        title_ua: "",
        description_ua: "",
        title_en: "",
        description_en: "",
        title_ru: "",
        description_ru: "",
        featured_image_url: "",
        publish_immediately: false,
        content_sections: [],
    });

    React.useEffect(() => {
        if (isEdit && params?.id) {
            setIsLoading(true);
            fetch(`/api/news/${params.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) {
                        setFormData({
                            title_ua: data.title_ua || "",
                            description_ua: data.description_ua || "",
                            title_en: data.title_en || "",
                            description_en: data.description_en || "",
                            title_ru: data.title_ru || "",
                            description_ru: data.description_ru || "",
                            featured_image_url: data.featured_image_url || data.image_url || "",
                            publish_immediately: data.published || false,
                            content_sections: data.content_sections || [],
                        });
                    }
                })
                .catch(err => console.error("Failed to fetch news:", err))
                .finally(() => setIsLoading(false));
        }
    }, [isEdit, params?.id]);

    const handleAddContentSection = () => {
        const newSection: ContentSection = {
            id: Date.now().toString(),
            type: "text",
            title_ua: "",
            description_ua: "",
            title_en: "",
            description_en: "",
            title_ru: "",
            description_ru: "",
        };
        setFormData({
            ...formData,
            content_sections: [...formData.content_sections, newSection],
        });
    };

    const handleRemoveContentSection = (id: string) => {
        setFormData({
            ...formData,
            content_sections: formData.content_sections.filter(section => section.id !== id),
        });
    };

    const updateContentSection = (id: string, field: keyof ContentSection, value: string) => {
        const updatedSections = formData.content_sections.map(section =>
            section.id === id ? { ...section, [field]: value } : section
        );
        setFormData({ ...formData, content_sections: updatedSections });
    };
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formDataUpload,
            });
            const data = await res.json();
            if (data.secure_url) {
                setFormData({ ...formData, featured_image_url: data.secure_url });
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const dataToSave = {
                ...formData,
                image_url: formData.featured_image_url, // For backward compatibility with the table
                published: formData.publish_immediately,
            };

            const method = isEdit ? 'PATCH' : 'POST';
            const url = isEdit ? `/api/news/${params?.id}` : '/api/news';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave),
            });

            if (res.ok) {
                alert(isEdit ? 'News updated successfully!' : 'News created successfully!');
                router.push("/news");
            } else {
                const error = await res.json();
                alert(`Failed to save: ${error.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error saving news:', error);
            alert('An error occurred while saving.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.push("/news");
    };

    const getLanguageLabel = (lang: Language) => {
        switch (lang) {
            case "ua": return "UA";
            case "en": return "EN";
            case "ru": return "RU";
        }
    };

    return (
        <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-title-md2 font-bold text-gray-dark dark:text-white">
                    {isEdit ? "Edit News" : "Add News"}
                </h1>
            </div>

            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex h-100 items-center justify-center rounded-xl border border-gray-200 bg-white p-10 dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
                            <p className="text-gray-500">Loading news data...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Basic Information with Language Tabs */}
                        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-dark dark:text-white">
                                    Basic Information
                                </h3>

                                {/* Language Tabs */}
                                <div className="inline-flex rounded-lg border border-stroke bg-gray-50 p-1 dark:border-white/[0.05] dark:bg-gray-900">
                                    {(["ua", "en", "ru"] as Language[]).map((lang) => (
                                        <button
                                            key={lang}
                                            onClick={() => setActiveLanguage(lang)}
                                            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${activeLanguage === lang
                                                ? "bg-brand-500 text-white shadow-sm"
                                                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                                }`}
                                        >
                                            {getLanguageLabel(lang)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Title *
                                    </label>
                                    <InputField
                                        type="text"
                                        placeholder={`Enter ${getLanguageLabel(activeLanguage)} title`}
                                        defaultValue={formData[`title_${activeLanguage}` as keyof NewsFormData] as string}
                                        onChange={(e) => setFormData({ ...formData, [`title_${activeLanguage}`]: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Description *
                                    </label>
                                    <TextArea
                                        rows={4}
                                        placeholder={`Enter ${getLanguageLabel(activeLanguage)} description`}
                                        defaultValue={formData[`description_${activeLanguage}` as keyof NewsFormData] as string}
                                        onChange={(value) => setFormData({ ...formData, [`description_${activeLanguage}`]: value })}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Featured Image */}
                        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
                            <h3 className="mb-4 text-lg font-semibold text-gray-dark dark:text-white">
                                Featured Image
                            </h3>

                            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900">
                                <div className="flex flex-col items-center">
                                    {isUploading ? (
                                        <div className="flex flex-col items-center">
                                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
                                            <p className="mt-2 text-sm text-gray-500">Uploading...</p>
                                        </div>
                                    ) : formData.featured_image_url ? (
                                        <div className="relative w-full max-w-md overflow-hidden rounded-lg shadow-md">
                                            <img
                                                src={formData.featured_image_url}
                                                alt="Preview"
                                                className="h-auto w-full object-cover"
                                            />
                                            <button
                                                onClick={() => setFormData({ ...formData, featured_image_url: "" })}
                                                className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-md hover:bg-red-600"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3 text-gray-400">
                                                <path d="M12 16L12 8M12 8L9 11M12 8L15 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M3 15C3 17.8284 3 19.2426 3.87868 20.1213C4.75736 21 6.17157 21 9 21H15C17.8284 21 19.2426 21 20.1213 20.1213C21 19.2426 21 17.8284 21 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Click to upload featured image
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                PNG, JPG, GIF up to 10MB
                                            </p>
                                            <FileInput
                                                id="featured-image"
                                                name="featured_image"
                                                className="mt-4"
                                                onChange={handleImageUpload}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Publish Options */}
                        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
                            <Checkbox
                                id="publish-immediately"
                                label="Publish immediately"
                                checked={formData.publish_immediately}
                                onChange={(checked) => setFormData({ ...formData, publish_immediately: checked })}
                            />
                        </section>

                        {/* Content Sections */}
                        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-dark dark:text-white">
                                    Content Sections
                                </h3>
                                <Button
                                    size="sm"
                                    onClick={handleAddContentSection}
                                >
                                    + Add Content
                                </Button>
                            </div>

                            {formData.content_sections.length === 0 ? (
                                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No content sections added yet
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {formData.content_sections.map((section, index) => (
                                        <div
                                            key={section.id}
                                            className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900"
                                        >
                                            <div className="mb-4 flex items-center justify-between">
                                                <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300">
                                                    Section {index + 1}
                                                </h4>
                                                <button
                                                    onClick={() => handleRemoveContentSection(section.id)}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Type */}
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Type
                                                    </label>
                                                    <Select
                                                        options={[
                                                            { value: "text", label: "Text" },
                                                            { value: "image", label: "Image" },
                                                            { value: "video", label: "Video" },
                                                        ]}
                                                        defaultValue={section.type}
                                                        onChange={(value: string) => updateContentSection(section.id, "type", value as any)}
                                                    />
                                                </div>

                                                {/* Title */}
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Title *
                                                    </label>
                                                    <InputField
                                                        type="text"
                                                        placeholder="Enter title"
                                                        defaultValue={section[`title_${activeLanguage}` as keyof ContentSection] as string}
                                                        onChange={(e) => updateContentSection(section.id, `title_${activeLanguage}` as any, e.target.value)}
                                                    />
                                                </div>

                                                {/* Description */}
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Description
                                                    </label>
                                                    <TextArea
                                                        rows={3}
                                                        placeholder="Enter description"
                                                        defaultValue={section[`description_${activeLanguage}` as keyof ContentSection] as string}
                                                        onChange={(value) => updateContentSection(section.id, `description_${activeLanguage}` as any, value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? "Saving..." : (isEdit ? "Save Changes" : "Create News")}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
