"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import NumberInput from "@/components/form/input/NumberInput";
import TextArea from "@/components/form/input/TextArea";
import FileInput from "@/components/form/input/FileInput";
import Checkbox from "@/components/form/input/Checkbox";
import Select from "@/components/form/Select";
import MapSelector from "@/components/properties/MapSelector";
import PhotoUpload from "@/components/properties/PhotoUpload";
import { amenitiesList } from "@/data/amenities";

import { useParams } from "next/navigation";
import { newBuildingIds } from "@/data/newBuildingIds";
import { countries, cities, areas } from "@/data/locations";

export default function PropertyEditPage() {
    const router = useRouter();
    const params = useParams();
    const [isMapOpen, setIsMapOpen] = useState(false);

    const [formData, setFormData] = useState({
        property_type: "new-building" as "new-building" | "secondary" | "rent",
        development_name: "",
        country: "",
        city: "",
        area: "",
        latitude: "",
        longitude: "",
        price_from: "",
        price_to: "",
        developer: "",
        bedrooms_from: "",
        bedrooms_to: "",
        bedrooms: "",
        bathrooms_from: "",
        bathrooms_to: "",
        bathrooms: "",
        size_from: "",
        size_to: "",
        size: "",
        ready_project: false,
        description: "",
        payment_plan: "",
        reference_id: "",
        photos: [] as string[],
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    React.useEffect(() => {
        if (params?.id) {
            setIsLoading(true);
            fetch(`/api/properties/${params.id}`)
                .then(res => res.json())
                .then(project => {
                    if (project && !project.error) {
                        // Determine property type with override logic
                        let type: "new-building" | "secondary" | "rent" = "secondary";

                        if (project.property_type === "New Building" ||
                            (project.reference_id && newBuildingIds.includes(project.reference_id))) {
                            type = "new-building";
                        } else if ((project.property_type as string) === "Rent") {
                            type = "rent";
                        }

                        setFormData({
                            property_type: type,
                            development_name: project.development_name || "",
                            country: project.country || "Spain",
                            city: project.province || "",
                            area: project.town || "",
                            latitude: project.latitude?.toString() || project.coordinates?.latitude.toString() || "",
                            longitude: project.longitude?.toString() || project.coordinates?.longitude.toString() || "",
                            price_from: project.price?.toString() || "",
                            price_to: project.price_to?.toString() || "",
                            developer: "",
                            bedrooms_from: project.beds?.toString() || "",
                            bedrooms_to: "",
                            bedrooms: project.beds?.toString() || "",
                            bathrooms_from: project.baths?.toString() || "",
                            bathrooms_to: "",
                            bathrooms: project.baths?.toString() || "",
                            size_from: project.built_area?.toString() || "",
                            size_to: project.built_area_to?.toString() || "",
                            size: project.built_area?.toString() || "",
                            ready_project: project.ready_project || false,
                            description: project.description || "",
                            payment_plan: project.payment_plan || "",
                            reference_id: project.reference_id || "",
                            photos: project.images?.map((img: any) => img.image_url) || [],
                        });

                        // Populate amenities
                        if (project.amenities) {
                            setSelectedAmenities(project.amenities);
                        }
                    } else {
                        console.error("Project not found or error:", project.error);
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch project:", err);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [params?.id]);

    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [units, setUnits] = useState<any[]>([]);

    // Ensure the current city is in the list options
    const cityOptions = [...cities.map(c => ({ value: c.name, label: c.name }))];

    // Check if current mapped city matches the list, otherwise add it.
    // The "Map Province to City" means project.province is used as the selected value.
    if (formData.city && !cities.some(c => c.name === formData.city)) {
        cityOptions.push({ value: formData.city, label: formData.city });
    }

    // Filter areas based on selected city if we had cityId mapping, but for now show all or filter by name match?
    // Since we mapped Province -> City, and Location data has cityId, we'd need to know the ID of the selected city/province.
    // For simplicity, let's show all areas or try to match.
    // Given the request is "give all locations", showing all might be safest or filtering if possible.
    // Let's filter if we can find the city ID.
    const selectedCity = cities.find(c => c.name === formData.city);
    const filteredAreas = selectedCity
        ? areas.filter(a => a.cityId === selectedCity.id)
        : areas;

    // Ensure the current area (mapped from town) is in the list options
    const areaOptions = [...filteredAreas.map(a => ({ value: a.name, label: a.name }))];

    if (formData.area && !filteredAreas.some(a => a.name === formData.area)) {
        areaOptions.push({ value: formData.area, label: formData.area });
    }

    // Amenities from mock data
    const amenities = amenitiesList;

    const handleAmenityToggle = (amenity: string) => {
        setSelectedAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity]
        );
    };

    const handleAddUnit = () => {
        setUnits([
            ...units,
            {
                id: Date.now().toString(),
                unit_id: "",
                type: "",
                total_size: "",
                balcony_size: "",
                price: "",
                plan_image: null,
            },
        ]);
    };

    const handleRemoveUnit = (id: string) => {
        setUnits(units.filter((unit) => unit.id !== id));
    };

    const handleMapSelect = (lat: number, lng: number) => {
        setFormData({
            ...formData,
            latitude: lat.toString(),
            longitude: lng.toString(),
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const dataToSave = {
                ...formData,
                amenities: selectedAmenities,
                // Units logic would go here if backend supports it
            };

            const res = await fetch(`/api/properties/${params?.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSave),
            });

            if (res.ok) {
                alert('Property saved successfully!');
            } else {
                const error = await res.json();
                alert(`Failed to save: ${error.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error saving property:', error);
            alert('An error occurred while saving.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-title-md2 font-bold text-gray-dark dark:text-white">
                    Edit Property
                </h2>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/properties")}
                    >
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>

            {/* Form Container */}
            {isLoading ? (
                <div className="flex h-100 items-center justify-center rounded-xl border border-gray-200 bg-white p-10 dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
                        <p className="text-gray-500">Loading property data...</p>
                    </div>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="p-4 space-y-6">
                        {/* Property Type Selector */}
                        <section>
                            <h3 className="mb-4 text-lg font-semibold text-gray-dark dark:text-white">
                                Property Type *
                            </h3>
                            <div className="inline-flex w-full rounded-lg border border-stroke bg-white p-1 dark:border-white/[0.05] dark:bg-white/[0.03]">
                                {[
                                    { value: "new-building", label: "New Building" },
                                    { value: "secondary", label: "Secondary" },
                                    { value: "rent", label: "Rent" },
                                ].map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, property_type: type.value as any })}
                                        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${formData.property_type === type.value
                                            ? "bg-brand-500 text-white shadow-sm"
                                            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                            }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Basic Information */}
                        <section>
                            <h3 className="mb-4 text-lg font-semibold text-gray-dark dark:text-white">
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Name *
                                    </label>
                                    <InputField
                                        type="text"
                                        placeholder="Marriott"
                                        value={formData.development_name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, development_name: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Country *
                                        </label>
                                        <Select
                                            options={countries.map(c => ({ value: c.name, label: c.name }))}
                                            placeholder="Select country"
                                            value={formData.country}
                                            onChange={(value) =>
                                                setFormData({ ...formData, country: value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            City *
                                        </label>
                                        <Select
                                            options={cityOptions}
                                            placeholder="Select city"
                                            value={formData.city}
                                            onChange={(value: string) =>
                                                setFormData({ ...formData, city: value })
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Area *
                                    </label>
                                    <Select
                                        options={areaOptions}
                                        placeholder="Select area"
                                        value={formData.area}
                                        onChange={(value) =>
                                            setFormData({ ...formData, area: value })
                                        }
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Latitude *
                                        </label>
                                        <InputField
                                            type="text"
                                            placeholder="25.07990305"
                                            value={formData.latitude}
                                            onChange={(e) =>
                                                setFormData({ ...formData, latitude: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Longitude *
                                        </label>
                                        <InputField
                                            type="text"
                                            placeholder="55.24594483"
                                            value={formData.longitude}
                                            onChange={(e) =>
                                                setFormData({ ...formData, longitude: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsMapOpen(true)}
                                            className="w-full"
                                        >
                                            Select on Map
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Photos */}
                        <section>
                            <h3 className="mb-4 text-lg font-semibold text-gray-dark dark:text-white">
                                Photos *
                            </h3>
                            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                                First photo will be set as main photo
                            </p>
                            <PhotoUpload
                                onChange={(files) => console.log('Photos:', files)}
                                initialPhotos={formData.photos}
                                key={formData.photos.join(',')} // Force re-render when photos load
                            />
                        </section>

                        {/* Pricing & Details */}
                        <section>
                            <h3 className="mb-4 text-lg font-semibold text-gray-dark dark:text-white">
                                Pricing & Details
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {/* Price */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {formData.property_type === "new-building" ? "Price From (EUR) *" : "Price (EUR) *"}
                                        </label>
                                        <NumberInput
                                            placeholder="450,000"
                                            value={formData.price_from}
                                            onChange={(value) =>
                                                setFormData({ ...formData, price_from: value })
                                            }
                                        />
                                    </div>
                                    {formData.property_type === "new-building" && (
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Price To (EUR)
                                            </label>
                                            <NumberInput
                                                placeholder="850,000"
                                                value={formData.price_to}
                                                onChange={(value) =>
                                                    setFormData({ ...formData, price_to: value })
                                                }
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Bedrooms */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {formData.property_type === "new-building" ? "Bedrooms From *" : "Bedrooms *"}
                                        </label>
                                        <Select
                                            options={[
                                                { value: "1", label: "1" },
                                                { value: "2", label: "2" },
                                                { value: "3", label: "3" },
                                                { value: "4", label: "4" },
                                                { value: "5", label: "5" },
                                                { value: "6", label: "6" },
                                                { value: "7", label: "7" },
                                                { value: "8", label: "8" },
                                                { value: "9", label: "9" },
                                                { value: "10+", label: "10+" },
                                            ]}
                                            placeholder="Select bedrooms"
                                            value={formData.property_type === "new-building" ? formData.bedrooms_from : formData.bedrooms}
                                            onChange={(value: string) =>
                                                formData.property_type === "new-building"
                                                    ? setFormData({ ...formData, bedrooms_from: value })
                                                    : setFormData({ ...formData, bedrooms: value })
                                            }
                                        />
                                    </div>
                                    {formData.property_type === "new-building" && (
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Bedrooms To *
                                            </label>
                                            <Select
                                                options={[
                                                    { value: "1", label: "1" },
                                                    { value: "2", label: "2" },
                                                    { value: "3", label: "3" },
                                                    { value: "4", label: "4" },
                                                    { value: "5", label: "5" },
                                                    { value: "6", label: "6" },
                                                    { value: "7", label: "7" },
                                                    { value: "8", label: "8" },
                                                    { value: "9", label: "9" },
                                                    { value: "10+", label: "10+" },
                                                ]}
                                                placeholder="Select bedrooms"
                                                value={formData.bedrooms_to}
                                                onChange={(value: string) =>
                                                    setFormData({ ...formData, bedrooms_to: value })
                                                }
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Bathrooms */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {formData.property_type === "new-building" ? "Bathrooms From *" : "Bathrooms *"}
                                        </label>
                                        <Select
                                            options={[
                                                { value: "1", label: "1" },
                                                { value: "2", label: "2" },
                                                { value: "3", label: "3" },
                                                { value: "4", label: "4" },
                                                { value: "5", label: "5" },
                                                { value: "6", label: "6" },
                                                { value: "7", label: "7" },
                                                { value: "8", label: "8" },
                                                { value: "9", label: "9" },
                                                { value: "10+", label: "10+" },
                                            ]}
                                            placeholder="Select bathrooms"
                                            value={formData.property_type === "new-building" ? formData.bathrooms_from : formData.bathrooms}
                                            onChange={(value: string) =>
                                                formData.property_type === "new-building"
                                                    ? setFormData({ ...formData, bathrooms_from: value })
                                                    : setFormData({ ...formData, bathrooms: value })
                                            }
                                        />
                                    </div>
                                    {formData.property_type === "new-building" && (
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Bathrooms To *
                                            </label>
                                            <Select
                                                options={[
                                                    { value: "1", label: "1" },
                                                    { value: "2", label: "2" },
                                                    { value: "3", label: "3" },
                                                    { value: "4", label: "4" },
                                                    { value: "5", label: "5" },
                                                    { value: "6", label: "6" },
                                                    { value: "7", label: "7" },
                                                    { value: "8", label: "8" },
                                                    { value: "9", label: "9" },
                                                    { value: "10+", label: "10+" },
                                                ]}
                                                placeholder="Select bathrooms"
                                                value={formData.bathrooms_to}
                                                onChange={(value: string) =>
                                                    setFormData({ ...formData, bathrooms_to: value })
                                                }
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Size */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {formData.property_type === "new-building" ? "Size From (sq.m) *" : "Size (sq.m) *"}
                                        </label>
                                        <InputField
                                            type="number"
                                            placeholder="103.64"
                                            value={formData.property_type === "new-building" ? formData.size_from : formData.size}
                                            onChange={(e) =>
                                                formData.property_type === "new-building"
                                                    ? setFormData({ ...formData, size_from: e.target.value })
                                                    : setFormData({ ...formData, size: e.target.value })
                                            }
                                        />
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            ≈ 1115.58 sq ft
                                        </p>
                                    </div>
                                    {formData.property_type === "new-building" && (
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Size To (sq.m) *
                                            </label>
                                            <InputField
                                                type="number"
                                                placeholder="205.00"
                                                value={formData.size_to}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, size_to: e.target.value })
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6">
                                <Checkbox
                                    id="ready_project"
                                    label="Ready Project"
                                    checked={formData.ready_project}
                                    onChange={(checked) =>
                                        setFormData({ ...formData, ready_project: checked })
                                    }
                                />
                            </div>
                            <div className="mt-6">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Description *
                                </label>
                                <TextArea
                                    rows={4}
                                    placeholder="The property is an existing Apartment building in Barsha South..."
                                    value={formData.description}
                                    onChange={(value) =>
                                        setFormData({ ...formData, description: value })
                                    }
                                />
                            </div>

                            <div className="mt-6">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Payment Plan
                                </label>
                                <TextArea
                                    rows={2}
                                    placeholder="Payment plan: On booking: 30%, Upon Handover: 70%"
                                    value={formData.payment_plan}
                                    onChange={(value) =>
                                        setFormData({ ...formData, payment_plan: value })
                                    }
                                />
                            </div>
                        </section>

                        {/* Facilities */}
                        <section>
                            <h3 className="mb-4 text-lg font-semibold text-gray-dark dark:text-white">
                                Facilities
                            </h3>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {(showAllAmenities ? amenities : amenities.slice(0, 12)).map((amenity) => (
                                    <Checkbox
                                        key={amenity}
                                        id={amenity}
                                        label={amenity}
                                        checked={selectedAmenities.includes(amenity)}
                                        onChange={() => handleAmenityToggle(amenity)}
                                    />
                                ))}
                            </div>
                            {amenities.length > 12 && (
                                <button
                                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                                    className="mt-4 text-sm text-brand-500 hover:text-brand-600"
                                >
                                    {showAllAmenities
                                        ? "Show Less"
                                        : `Show More (${amenities.length - 12} more)`
                                    }
                                </button>
                            )}
                        </section>

                        {/* Units */}
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-dark dark:text-white">
                                    Units
                                </h3>
                                <Button size="sm" onClick={handleAddUnit}>
                                    Add Unit
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {units.map((unit, index) => (
                                    <div
                                        key={unit.id}
                                        className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-white/[0.05] dark:bg-white/[0.02]"
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <h4 className="font-medium text-gray-dark dark:text-white">
                                                Unit {index + 1}
                                            </h4>
                                            <button
                                                onClick={() => handleRemoveUnit(unit.id)}
                                                className="text-sm text-red-500 hover:text-red-600"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Unit ID *
                                                    </label>
                                                    <InputField type="text" placeholder="699" />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Type *
                                                    </label>
                                                    <Select
                                                        options={[
                                                            { value: "Apartment", label: "Apartment" },
                                                            { value: "Penthouse", label: "Penthouse" },
                                                            { value: "Villa", label: "Villa" },
                                                            { value: "Townhouse", label: "Townhouse" },
                                                            { value: "Studio", label: "Studio" },
                                                        ]}
                                                        placeholder="Select type"
                                                        onChange={(value: string) => console.log(value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Total Size (sq.m) *
                                                    </label>
                                                    <NumberInput placeholder="103.64" />
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        ≈ 1115.58 sq ft
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Balcony Size (sq.m)
                                                    </label>
                                                    <NumberInput placeholder="0.00" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Price (EUR) *
                                                    </label>
                                                    <NumberInput placeholder="500,000" />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Plan Image
                                                    </label>
                                                    <FileInput id={`unit-plan-${unit.id}`} name="plan_image" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            )}

            {/* Map Selector Modal */}
            < MapSelector
                isOpen={isMapOpen}
                onClose={() => setIsMapOpen(false)
                }
                onSelect={handleMapSelect}
                initialLat={formData.latitude ? parseFloat(formData.latitude) : undefined}
                initialLng={formData.longitude ? parseFloat(formData.longitude) : undefined}
            />
        </div >
    );
}
