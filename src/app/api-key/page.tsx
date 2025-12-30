"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import InputField from "@/components/form/input/InputField";
import { Modal } from "@/components/ui/modal";
import { CopyIcon, InfoIcon, AlertIcon } from "@/icons";

interface ApiKey {
    id: string;
    name: string;
    key: string;
    secret?: string; // Only present right after creation
    status: "active" | "inactive";
    last_used: string | null;
    created_at: string;
}

export default function ApiKeyPage() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // State for the success view
    const [createdKey, setCreatedKey] = useState<ApiKey | null>(null);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/api-keys");
            const data = await res.json();
            if (Array.isArray(data)) {
                setKeys(data);
            }
        } catch (error) {
            console.error("Failed to fetch API keys:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateKey = async () => {
        setIsCreating(true);
        try {
            const res = await fetch("/api/api-keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newKeyName }),
            });
            if (res.ok) {
                const newKey = await res.json();
                setKeys([newKey, ...keys]);
                setCreatedKey(newKey); // This triggers the success view in the modal
                setNewKeyName("");
            }
        } catch (error) {
            console.error("Failed to create API key:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        try {
            const res = await fetch(`/api/api-keys/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setKeys(keys.map(k => k.id === id ? { ...k, status: newStatus as any } : k));
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const handleDeleteKey = async (id: string) => {
        if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) return;
        try {
            const res = await fetch(`/api/api-keys/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setKeys(keys.filter(k => k.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete key:", error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // We could use a toast here, but alert is consistent with previous edits
        alert("Copied to clipboard!");
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Never used";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCreatedKey(null);
        setNewKeyName("");
    };

    return (
        <div className="mx-auto max-w-5xl">
            {/* Header */}
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Integrations</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage API keys for external integrations (website, mobile app, etc.)
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>Create API Key</Button>
            </div>

            {/* Keys List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
                    </div>
                ) : keys.length === 0 ? (
                    <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <p className="text-gray-500">No API keys created yet.</p>
                    </div>
                ) : (
                    keys.map((key) => (
                        <div
                            key={key.id}
                            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]"
                        >
                            <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {key.name}
                                    </h3>
                                    <Badge color={key.status === "active" ? "success" : "light"}>
                                        {key.status === "active" ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleStatus(key.id, key.status)}
                                    >
                                        {key.status === "active" ? "Deactivate" : "Activate"}
                                    </Button>
                                    <button
                                        onClick={() => handleDeleteKey(key.id)}
                                        className="inline-flex h-10 items-center justify-center rounded-lg bg-red-50 px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-500 dark:hover:bg-red-500/20"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                    API Key:
                                </label>
                                <div className="relative flex items-center">
                                    <div className="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-mono text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
                                        {key.key}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(key.key)}
                                        className="ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 dark:border-white/5 dark:hover:bg-white/5"
                                    >
                                        <CopyIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                {key.last_used && (
                                    <>
                                        <span>Last used: {formatDate(key.last_used)}</span>
                                        <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                                    </>
                                )}
                                <span>Created: {formatDate(key.created_at)}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Documentation Banner */}
            <div className="mt-8 rounded-3xl bg-brand-500/[0.03] p-6 border border-brand-500/10 dark:bg-brand-500/5">
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
                        <InfoIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                            API Documentation
                        </h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            To authenticate, include <strong>x-api-key</strong> and <strong>x-api-secret</strong> in your request headers.
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-[500px] p-0 overflow-hidden">
                {!createdKey ? (
                    /* Initial Create State */
                    <div className="p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create API Key</h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Generate a new API key for external integrations
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                                Name <span className="text-gray-500">(optional)</span>
                            </label>
                            <InputField
                                placeholder="e.g., Production Website, Mobile App"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                            />
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Give your API key a descriptive name to easily identify it later.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
                            <Button variant="outline" onClick={handleCloseModal}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateKey} disabled={isCreating}>
                                {isCreating ? "Creating..." : "Create"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* Success State */
                    <div className="p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">API Key Created Successfully</h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Save these credentials in a secure location
                            </p>
                        </div>

                        {/* Warning Box */}
                        <div className="mb-6 rounded-xl border border-warning-200 bg-warning-50 p-4 dark:border-warning-500/20 dark:bg-warning-500/10">
                            <div className="flex gap-3">
                                <AlertIcon className="h-5 w-5 shrink-0 text-warning-500" />
                                <div>
                                    <h4 className="text-sm font-bold text-warning-800 dark:text-warning-500">
                                        Important: Save your credentials now
                                    </h4>
                                    <p className="mt-1 text-xs text-warning-700 dark:text-warning-400/80">
                                        The API Secret will only be shown once. Make sure to copy and store it securely.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                    API Key
                                </label>
                                <div className="flex gap-2">
                                    <div className="flex-1 rounded-lg bg-gray-900 p-3 font-mono text-xs text-gray-300 break-all border border-white/5">
                                        {createdKey.key}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(createdKey.key)}
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white hover:bg-brand-600 shadow-theme-xs"
                                    >
                                        <CopyIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                    API Secret
                                </label>
                                <div className="flex gap-2">
                                    <div className="flex-1 rounded-lg bg-gray-900 p-3 font-mono text-xs text-gray-300 break-all border border-white/5">
                                        {createdKey.secret}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(createdKey.secret || "")}
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white hover:bg-brand-600 shadow-theme-xs"
                                    >
                                        <CopyIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                            <Button className="w-full" onClick={handleCloseModal}>
                                I've Saved My Credentials
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
