import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { applyGeocoding } from '@/lib/geocoding';
const PROJECTS_FILE = path.join(process.cwd(), 'src/data/projects.json');

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const fileContent = fs.readFileSync(PROJECTS_FILE, 'utf8');
        const projects = JSON.parse(fileContent);
        const project = projects.find((p: any) => p.id === Number(id));
        const processed = applyGeocoding([project]);
        const projectWithCoords = processed[0];

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json(projectWithCoords);
    } catch (error) {
        console.error('Error reading projects:', error);
        return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const fileContent = fs.readFileSync(PROJECTS_FILE, 'utf8');
        const projects = JSON.parse(fileContent);

        const index = projects.findIndex((p: any) => p.id === Number(id));
        if (index === -1) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Update the project with the new data
        // We need to map the form data structure back to the project structure
        const updatedProject = { ...projects[index] };

        if (body.development_name !== undefined) updatedProject.development_name = body.development_name;
        if (body.country !== undefined) updatedProject.country = body.country;
        if (body.city !== undefined) updatedProject.province = body.city; // Mapped City to Province in UI
        if (body.area !== undefined) updatedProject.town = body.area; // Mapped Area to Town in UI
        if (body.latitude !== undefined) updatedProject.latitude = parseFloat(body.latitude);
        if (body.longitude !== undefined) updatedProject.longitude = parseFloat(body.longitude);
        if (body.price_from !== undefined) updatedProject.price = parseFloat(body.price_from);
        if (body.price_to !== undefined) updatedProject.price_to = parseFloat(body.price_to);
        if (body.beds !== undefined) updatedProject.beds = parseInt(body.beds);
        if (body.baths !== undefined) updatedProject.baths = parseInt(body.baths);
        if (body.size !== undefined) updatedProject.built_area = parseFloat(body.size);
        if (body.description !== undefined) updatedProject.description = body.description;
        if (body.ready_project !== undefined) updatedProject.ready_project = body.ready_project;
        if (body.amenities !== undefined) updatedProject.amenities = body.amenities;
        if (body.photos !== undefined) {
            updatedProject.images = body.photos.map((url: string) => ({ image_url: url }));
        }

        projects[index] = updatedProject;

        fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 4));

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const fileContent = fs.readFileSync(PROJECTS_FILE, 'utf8');
        const projects = JSON.parse(fileContent);

        const index = projects.findIndex((p: any) => p.id === Number(id));
        if (index === -1) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Remove the project
        projects.splice(index, 1);

        fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 4));

        return NextResponse.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
    }
}
