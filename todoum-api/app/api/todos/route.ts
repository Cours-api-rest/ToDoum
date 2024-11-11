import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000/api/todos';

// Helper function to create hypermedia links
function createTodoLinks(id: number, hasSubtasks: boolean) {
    const links: { self: string; subtasks?: string } = {
        self: `${baseUrl}/${id}`,
    };
    if (hasSubtasks) {
        links.subtasks = `${baseUrl}/${id}/subtasks`;
    }
    return links;
}

// Fetch all Todos with their hypermedia links
export async function GET() {
    try {
        const todos = await prisma.todo.findMany({
            include: {
                child: { // Include the child links
                    include: { child: true } // Nested include to fetch the actual child Todo data
                }
            }
        });

        // Ensure todos is a valid array
        const todosWithLinks = (todos || []).map(todo => ({
            id: todo.id,
            title: todo.title,
            done: todo.done,
            createdAt: todo.createdAt,
            updatedAt: todo.updatedAt,
            links: createTodoLinks(
                todo.id,
                Array.isArray(todo.child) && todo.child.length > 0
            ),
            subtasks: todo.child.map(link => link.child) // Map to include actual child Todos
        }));

        return NextResponse.json(todosWithLinks, { status: 200 });
    } catch (error : any) {
        console.error("Erreur lors de l'exécution de prisma.todo.findMany:", error.message || error);
        return NextResponse.json({ error: 'Erreur lors de la récupération des todos' }, { status: 500 });
    }
}


// Create a new Todo with hypermedia links
export async function POST(request: Request) {
    try {
        const { title, parentId } = await request.json();

        if (!title || typeof title !== 'string') {
            return NextResponse.json({ error: 'Invalid title' }, { status: 400 });
        }

        const todo = await prisma.todo.create({
            data: { title },
        });

        // If there is a parentId, create a link for this sub-task relationship
        if (parentId && typeof parentId === 'number') {
            await prisma.linkTodo.create({
                data: {
                    parentId,
                    childId: todo.id,
                },
            });
        }

        return NextResponse.json({
            ...todo,
            links: createTodoLinks(todo.id, false), // Initially, no subtasks
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Error creating todo' }, { status: 500 });
    }
}
