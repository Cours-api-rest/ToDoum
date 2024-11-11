import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Fetch sub-tasks of a specific Todo
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    try {
        const todoId = parseInt(id);
        if (isNaN(todoId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const subtasks = await prisma.linkTodo.findMany({
            where: { parentId: todoId },
            include: { child: true },
        });

        const subtasksWithLinks = subtasks.map(link => ({
            ...link.child,
            links: {
                self: `/api/todos/${link.child.id}`,
            },
        }));

        return NextResponse.json(subtasksWithLinks, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching sub-tasks' }, { status: 500 });
    }
}
