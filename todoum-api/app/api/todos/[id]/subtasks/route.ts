
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000/api/todos';

// Helper function to create hypermedia links
function createTodoLinks(id: number, hasSubtasks: boolean, hasParent: boolean, parentId?: number) {
    const links: { self: string; subtasks?: string; parent?: string } = {
        self: `${baseUrl}/${id}`,
    };

    // Ajout du lien pour les sous-tâches si elles existent
    if (hasSubtasks) {
        links.subtasks = `${baseUrl}/${id}/subtasks`; // Lien vers les sous-tâches
    }

    // Ajout du lien pour la tâche parente si elle existe
    if (hasParent) {
        links.parent = `${baseUrl}/${parentId}`; // Lien vers la tâche parente
    }

    return links;
}

// Fetch sub-tasks of a specific Todo
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    try {
        const todoId = parseInt(id);
        if (isNaN(todoId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        // Vérifier si le Todo existe
        const todos = await prisma.linkTodo.findMany({
            where: { parentId: todoId },
            include: { child: true, parent: true }, // Inclure les sous-tâches et la tâche parente
        });

        if (!todos || todos.length === 0) {
            return NextResponse.json({ error: 'Subtasks not found' }, { status: 404 });
        }

        // Mapper les sous-tâches pour inclure les liens
        const subtasksWithLinks = await Promise.all(todos.map(async todo => {
            const hasSubtasks = await prisma.linkTodo.findMany({
                where: { parentId: todo.child.id },
            });

            return {
                id: todo.child.id,
                title: todo.child.title,
                done: todo.child.done,
                createdAt: todo.child.createdAt,
                updatedAt: todo.child.updatedAt,
                links: createTodoLinks(todo.child.id, hasSubtasks.length > 0, true, todo.parentId),
            };
        }));

        return NextResponse.json(subtasksWithLinks, { status: 200 });
    }
    catch (error: any) {
        console.error("Error fetching todo:", error.message || error);
        return NextResponse.json({ error: 'Error fetching todo' }, { status: 500 });
    }
}
