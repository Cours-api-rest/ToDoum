<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  ColumnFiltersState,
  ExpandedState,
  SortingState,
  VisibilityState,
} from "@tanstack/vue-table";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createColumnHelper,
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import { ArrowUpDown, ChevronDown, Trash } from "lucide-vue-next";
import { h, ref } from "vue";
import { cn, valueUpdater } from "~/utils/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";

export interface Payment {
  id: string;
  createdAt: Date;
  title: string;
  done: boolean;
}

const data: Payment[] = [
  {
    id: "m5gr84i9",
    title: "ken99@yahoo.com",
    done: false,
    createdAt: new Date("2021-01-01"),
  },
  {
    id: "3u1reuv4",
    title: "Abe45@gmail.com",
    done: false,
    createdAt: new Date("2021-01-02"),
  },
  {
    id: "derv1ws0",
    title: "Monserrat44@gmail.com",
    done: false,
    createdAt: new Date("2021-01-03"),
  },
  {
    id: "5kma53ae",
    title: "Silas22@gmail.com",
    done: false,
    createdAt: new Date("2021-01-04"),
  },
  {
    id: "bhqecj4p",
    title: "carmella@hotmail.com",
    done: false,
    createdAt: new Date("2021-01-05"),
  },
];

const columnHelper = createColumnHelper<Payment>();

const columns = [
  columnHelper.display({
    id: "select",
    header: ({ table }) =>
      h(Checkbox, {
        checked:
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate"),
        "onUpdate:checked": (value) => table.toggleAllPageRowsSelected(!!value),
        ariaLabel: "Select all",
      }),
    cell: ({ row }) => {
      return h(Checkbox, {
        checked: row.getIsSelected(),
        ariaLabel: "Select row",
        "onUpdate:checked": (value) => {
          row.toggleSelected(!!value);
          row.original.done = !!value;
          console.log("Checkbox clicked", row.original);
        },
      });
    },
    enableSorting: false,
    enableHiding: false,
  }),

  columnHelper.accessor("title", {
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Title", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", { class: "lowercase" }, row.getValue("title")),
  }),
  columnHelper.accessor("createdAt", {
    header: () => h("div", { class: "text-right" }, "Created At"),
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as Date;
      return h(
        "div",
        { class: "text-right font-medium" },
        createdAt.toLocaleDateString()
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;
      return h("div", { class: "relative" });
    },
  }),
  columnHelper.display({
    id: "delete",
    header: ({ table }) =>
      h(Trash, {
        icon: "trash",
        onClick: () => {
          const selectedRows = table.getFilteredSelectedRowModel().rows;
          console.log("Delete selected rows:", selectedRows);
        },
        ariaLabel: "Delete selected rows",
        size: 20,
      }),
    cell: ({ row }) => {
      return h(Trash, {
        icon: "trash",
        onClick: () => {
          console.log("Delete row:", row.original);
        },
        ariaLabel: "Delete row",
        class: "cursor-pointer",
        size: 20,
      });
    },
    enableSorting: false,
    enableHiding: false,
  }),
];

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref({});
const expanded = ref<ExpandedState>({});

const table = useVueTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, rowSelection),
  onExpandedChange: (updaterOrValue) => valueUpdater(updaterOrValue, expanded),
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
    get expanded() {
      return expanded.value;
    },
    columnPinning: {
      left: ["Done"],
    },
  },
});
</script>

<template>
  <main class="flex justify-center items-center">
    <div class="w-full p-10 max-w-[800px]">
      <div class="flex gap-2 items-center py-4">
        <Input
          class="max-w-sm"
          placeholder="Filter titles..."
          :model-value="table.getColumn('title')?.getFilterValue() as string"
          @update:model-value="table.getColumn('title')?.setFilterValue($event)"
        />
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="ml-auto">
              Columns <ChevronDown class="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              v-for="column in table
                .getAllColumns()
                .filter((column) => column.getCanHide())"
              :key="column.id"
              class="capitalize"
              :checked="column.getIsVisible()"
              @update:checked="(value) => column.toggleVisibility(!!value)"
            >
              {{ column.id }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow
              v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id"
            >
              <TableHead
                v-for="header in headerGroup.headers"
                :key="header.id"
                :data-pinned="header.column.getIsPinned()"
                :class="
                  cn(
                    { 'sticky bg-background/95': header.column.getIsPinned() },
                    header.column.getIsPinned() === 'left'
                      ? 'left-0'
                      : 'right-0'
                  )
                "
              >
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="table.getRowModel().rows?.length">
              <template v-for="row in table.getRowModel().rows" :key="row.id">
                <TableRow :data-state="row.getIsSelected() && 'selected'">
                  <TableCell
                    v-for="cell in row.getVisibleCells()"
                    :key="cell.id"
                    :data-pinned="cell.column.getIsPinned()"
                    :class="
                      cn(
                        {
                          'sticky bg-background/95': cell.column.getIsPinned(),
                        },
                        cell.column.getIsPinned() === 'left'
                          ? 'left-0'
                          : 'right-0'
                      )
                    "
                  >
                    <FlexRender
                      :render="cell.column.columnDef.cell"
                      :props="cell.getContext()"
                    />
                  </TableCell>
                </TableRow>
                <TableRow v-if="row.getIsExpanded()">
                  <TableCell :colspan="row.getAllCells().length">
                    {{ row.original }}
                  </TableCell>
                </TableRow>
              </template>
            </template>
            <TableRow v-else>
              <TableCell :colspan="columns.length" class="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div class="flex items-center justify-end space-x-2 py-4">
        <div class="flex-1 text-sm text-muted-foreground">
          {{ table.getFilteredSelectedRowModel().rows.length }} of
          {{ table.getFilteredRowModel().rows.length }} row(s) selected.
        </div>
        <div class="space-x-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="!table.getCanPreviousPage()"
            @click="table.previousPage()"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="!table.getCanNextPage()"
            @click="table.nextPage()"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  </main>
</template>
