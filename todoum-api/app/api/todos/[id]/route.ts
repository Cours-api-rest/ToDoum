
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
            include: { child: true, parent: true }, // Inclure les sous-tâches et la tâche parente
        });

        if (!todo) {
            return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
        }

        // Vérifier s'il y a des sous-tâches
        const hasSubtasks = todo.parent.length > 0;

        const hasParent = todo.child.length > 0;

        return NextResponse.json({
            id: todo.id,
            title: todo.title,
            done: todo.done,
            createdAt: todo.createdAt,
            updatedAt: todo.updatedAt,
            links: createTodoLinks(todo.id, hasSubtasks, hasParent, hasParent ? todo.child[0].parentId : undefined),
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
            include: { child: true, parent: true }, // Inclure les sous-tâches et les tâches parent
        });

        if (!existingTodo) {
            return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
        }

        // Construire l'objet de mise à jour pour la tâche principale
        const updateData: { title?: string; done?: boolean } = { title };
        if (done !== undefined) {
            updateData.done = done;
        }

        // Mettre à jour le Todo principal
        const updatedTodo = await prisma.todo.update({
            where: { id: todoId },
            data: updateData,
            include: { child: true, parent: true },
        });

        if (!updatedTodo) {
            return NextResponse.json({ error: 'Error updating todo' }, { status: 500 });
        }

        // Fonction pour mettre à jour les sous-tâches récursivement
        const updateSubtasksRecursively = async (parentId: number, doneStatus: boolean) => {
            const subtasks = await prisma.todo.findMany({
                where: { id: { in: updatedTodo.parent.map(link => link.childId) } },
                include: { child: true, parent: true },
            });

            for (const subtask of subtasks) {
                // Mettre à jour chaque sous-tâche
                await prisma.todo.update({
                    where: { id: subtask.id },
                    data: { done: doneStatus },
                });

                if (subtask.parent.length > 0) {
                    await updateSubtasksRecursively(subtask.id, doneStatus);
                }
            }
        };

        // Fonction pour mettre à jour les parents récursivement si nécessaire
        const updateParentsRecursively = async (childId: number, doneStatus: boolean) => {
            const parentLinks = await prisma.todo.findMany({
                where: { id: { in: updatedTodo.child.map(link => link.parentId) } },
                include: { child: true, parent: true },
            });

            for (const parent of parentLinks) {
                if (doneStatus) {
                    // Si `done` est passé à true, vérifier si tous les enfants sont `done`
                    const allDone = parent.child.every(child => child.done);
                    if (allDone && !parent.done) {
                        await prisma.todo.update({
                            where: { id: parent.id },
                            data: { done: true },
                        });

                        if (parent.parent.length > 0) {
                            // Continuer la mise à jour vers le haut de la hiérarchie
                            for (const child of parent.parent) {
                                // await updateParentsRecursively(child.childId, true);
                            }
                        }
                    }
                } else {
                    // Si `done` est passé à false, marquer tous les parents comme `false`
                    await prisma.todo.update({
                        where: { id: parent.id },
                        data: { done: false },
                    });

                    if (parent.child.length > 0) {
                        // Continuer la mise à jour vers le haut de la hiérarchie
                        for (const child of parent.child) {
                            console.log(child);
                            // await updateParentsRecursively(child.parentId, false);
                        }
                    }
                }
            }
        };

        // Si done est fourni, mettre à jour récursivement toutes les sous-tâches
        if (done !== undefined) {
            await updateSubtasksRecursively(todoId, done);
            await updateParentsRecursively(updatedTodo.child[0].parentId, done);
        }

        // Vérifier s'il y a des sous-tâches et un parent
        const hasSubtasks = updatedTodo.parent.length > 0;
        const hasParent = updatedTodo.child.length > 0;

        return NextResponse.json({
            id: updatedTodo.id,
            title: updatedTodo.title,
            done: updatedTodo.done,
            createdAt: updatedTodo.createdAt,
            updatedAt: updatedTodo.updatedAt,
            links: createTodoLinks(updatedTodo.id, hasSubtasks, hasParent, hasParent ? updatedTodo.child[0].parentId : undefined),
        }, { status: 200 });
    } catch (error) {
        console.error("Error updating todo:", error);
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
