import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();
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
            include: { child: true },
        });

        const todosWithLinks = todos.map(todo => ({
            id: todo.id,
            title: todo.title,
            done: todo.done,
            createdAt: todo.createdAt,
            updatedAt: todo.updatedAt,
            links: createTodoLinks(todo.id, todo.child.length > 0),
        }));

        return NextResponse.json(todosWithLinks, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching todos' }, { status: 500 });
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
