export interface ProjectImage {
    image_url: string;
}

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface Unit {
    id: string;
    unit_id: string;
    type: string;
    total_size: number;
    balcony_size?: number;
    price: number;
    plan_image?: string;
}

export interface Project {
    id: number;
    development_name: string;
    town: string;
    province: string;
    type: string;
    latitude?: number; // Added per user request
    longitude?: number; // Added per user request
    price: number;
    price_to?: number;
    currency: string;
    built_area: number;
    built_area_to?: number;
    beds: number;
    baths: number;
    completion_date: number; // Timestamp
    images: ProjectImage[];

    // Additional fields for edit form
    reference_id?: string;
    status?: "Active" | "Inactive" | "Reserved";
    country?: string;
    area?: string;
    coordinates?: Coordinates;
    developer?: string;
    description?: string;
    payment_plan?: string;
    amenities?: string[]; // Array of amenity IDs or names
    units?: Unit[];
    ready_project?: boolean;
    property_type?: "new-building" | "secondary" | "rent" | "New Building" | "Off Plan";
}
