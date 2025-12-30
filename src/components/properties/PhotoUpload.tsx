"use client";

import React, { useState } from "react";

interface PhotoUploadProps {
    onChange?: (files: File[]) => void;
    initialPhotos?: string[];
}

export default function PhotoUpload({ onChange, initialPhotos = [] }: PhotoUploadProps) {
    const [photos, setPhotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>(initialPhotos);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // Add new files to existing photos
        const newPhotos = [...photos, ...files];
        setPhotos(newPhotos);

        // Create preview URLs
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);

        // Notify parent
        if (onChange) {
            onChange(newPhotos);
        }
    };

    const handleRemove = (index: number) => {
        // Revoke the URL to free memory
        URL.revokeObjectURL(previews[index]);

        // Remove from arrays
        const newPhotos = photos.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);

        setPhotos(newPhotos);
        setPreviews(newPreviews);

        if (onChange) {
            onChange(newPhotos);
        }
    };

    return (
        <div className="space-y-4">
            {/* File Input */}
            <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400"
            />

            {/* Photo Grid */}
            {previews.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {previews.map((preview, index) => (
                        <div
                            key={index}
                            className="group relative aspect-video overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-white/[0.05] dark:bg-white/[0.03]"
                        >
                            <img
                                src={preview}
                                alt={`Photo ${index + 1}`}
                                className="h-full w-full object-cover"
                            />

                            {/* Main Photo Badge */}
                            {index === 0 && (
                                <div className="absolute left-2 top-2 rounded bg-brand-500 px-2 py-1 text-xs font-medium text-white">
                                    Main
                                </div>
                            )}

                            {/* Remove Button */}
                            <button
                                onClick={() => handleRemove(index)}
                                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                                title="Remove photo"
                            >
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
