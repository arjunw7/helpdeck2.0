import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Lock, Globe } from "lucide-react";
import { Category } from "@/lib/api/categories";
import Link from "next/link";

interface CategoriesTableProps {
  categories: Category[];
}

export function CategoriesTable({ categories }: CategoriesTableProps) {
  const getAccessIcon = (accessibility: string) => {
    return accessibility === "private" ? Lock : Globe;
  };

  const formatAccess = (accessibility: string) => {
    return accessibility.charAt(0).toUpperCase() + accessibility.slice(1);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Access</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => {
            const AccessIcon = getAccessIcon(category.accessibility);
            return (
              <TableRow key={category.id}>
                <TableCell>
                  <Link
                    href={`/knowledge-base/categories/${category.id}`}
                    className="flex items-center hover:text-primary"
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    {category.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={category.accessibility === "private" ? "secondary" : "outline"}
                    className="flex w-fit items-center gap-1"
                  >
                    <AccessIcon className="h-3 w-3" />
                    {formatAccess(category.accessibility)}
                  </Badge>
                </TableCell>
                <TableCell>{category.profiles.full_name}</TableCell>
                <TableCell>
                  {new Date(category.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  );
}