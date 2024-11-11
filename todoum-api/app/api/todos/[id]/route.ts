import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();
const baseUrl = process.env.BASE_URL || 'http://localhost:3000/api/todos';

// Helper function to create hypermedia links
function createTodoLinks(id: number, hasSubtasks: boolean) {
    const links: { self: string; subtasks?: string } = {
        self: `${baseUrl}/${id}`,
    };

    // Ajout du lien pour les sous-tâches si elles existent
    if (hasSubtasks) {
        links.subtasks = `${baseUrl}/${id}/subtasks`; // Lien vers les sous-tâches
    }

    return links;
}

// Fetch a specific Todo by its ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    try {
        const todoId = parseInt(id); // Convertir l'ID en nombre
        if (isNaN(todoId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        // Vérifier si le Todo existe
        const todo = await prisma.todo.findUnique({
            where: { id: todoId },
            include: { child: true }, // Inclure les sous-tâches
        });

        if (!todo) {
            return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
        }

        // Vérifier s'il y a des sous-tâches
        const hasSubtasks = todo.child.length > 0;

        return NextResponse.json({
            id: todo.id,
            title: todo.title,
            done: todo.done,
            createdAt: todo.createdAt,
            updatedAt: todo.updatedAt,
            links: createTodoLinks(todo.id, hasSubtasks),
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching todo' }, { status: 500 });
    }
}

// Update a Todo by its ID
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    try {
        const { title, done } = await request.json();
        const todoId = parseInt(id); // Convertir l'ID en nombre
        if (isNaN(todoId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        // Vérifier si le Todo existe
        const existingTodo = await prisma.todo.findUnique({
            where: { id: todoId },
        });

        if (!existingTodo) {
            return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
        }

        // Mettre à jour le Todo
        const updatedTodo = await prisma.todo.update({
            where: { id: todoId },
            data: { title, done },
            include: { child: true }, // Inclure les sous-tâches après mise à jour
        });

        // Vérifier s'il y a des sous-tâches
        const hasSubtasks = updatedTodo.child.length > 0;

        return NextResponse.json({
            id: updatedTodo.id,
            title: updatedTodo.title,
            done: updatedTodo.done,
            createdAt: updatedTodo.createdAt,
            updatedAt: updatedTodo.updatedAt,
            links: createTodoLinks(updatedTodo.id, hasSubtasks),
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error updating todo' }, { status: 500 });
    }
}

// Delete a Todo by its ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    try {
        const todoId = parseInt(id); // Convertir l'ID en nombre
        if (isNaN(todoId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        // Vérifier si le Todo existe avant de le supprimer
        const existingTodo = await prisma.todo.findUnique({
            where: { id: todoId },
        });

        if (!existingTodo) {
            return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
        }

        async function deleteTodoWithChildren(todoId: number) {
            const childLinks = await prisma.linkTodo.findMany({
                where: { parentId: todoId },
                include: { child: true },
            });

            for (const link of childLinks) {
                await deleteTodoWithChildren(link.childId); // Supprimer les sous-tâches
            }

            // Supprimer tous les liens parent-enfant
            await prisma.linkTodo.deleteMany({
                where: { parentId: todoId },
            });

            // Supprimer le Todo
            await prisma.todo.delete({
                where: { id: todoId },
            });
        }

        await deleteTodoWithChildren(todoId);

        return NextResponse.json({ message: 'Todo and its sub-tasks deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting todo and sub-tasks' }, { status: 500 });
    }
}
