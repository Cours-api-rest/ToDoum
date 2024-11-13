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

// Fetch all Todos with their hypermedia links
export async function GET(req: Request) {
    try {


        // Récupérer le paramètre 'fetchAll' depuis l'URL de la requête
        const url = new URL(req.url);
        const fetchAll = url.searchParams.get("fetchAll") === "true"; // Si fetchAll est 'true', nous ne filtrons pas

        const todos = await prisma.todo.findMany({
            include: { child: true, parent: true }, // Inclure les sous-tâches et les tâches parent
        });

        // Si fetchAll est vrai, on retourne toutes les tâches sans filtrage
        const filteredTodos = fetchAll
            ? todos
            : todos.filter(todo => todo.child.length === 0);

        // Mapper les tâches filtrées pour inclure les liens
        const todosWithLinks = filteredTodos.map(todo => ({
            id: todo.id,
            title: todo.title,
            done: todo.done,
            createdAt: todo.createdAt,
            updatedAt: todo.updatedAt,
            links: createTodoLinks(
                todo.id, todo.parent.length > 0, todo.child.length > 0, todo.child.length > 0 ? todo.child[0].parentId : undefined
            )
        }));

        return NextResponse.json(todosWithLinks, { status: 200 });
    } catch (error: any) {
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
            include: { child: true, parent: true },
        });

        // If there is a parentId, create a link for this sub-task relationship
        if (parentId && typeof parentId === 'number') {
            await prisma.linkTodo.create({
                data: {
                    parentId,
                    childId: todo.id,
                },
            });

            // Update the parent task to mark it as not done
            await prisma.todo.update({
                where: { id: parentId },
                data: {
                    done: false,
                },
            });
        }

        const hasParent = parentId !== undefined;

        return NextResponse.json({
            id: todo.id,
            title: todo.title,
            done: todo.done,
            createdAt: todo.createdAt,
            updatedAt: todo.updatedAt,
            links: createTodoLinks(todo.id, false, hasParent, parentId),
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Error creating todo' }, { status: 500 });
    }
}

