import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface ReleaseNoteCardProps {
  note: {
    id: number;
    version: string;
    title: string;
    description: string;
    type: string;
    date: string;
    changes: string[];
  };
}

export function ReleaseNoteCard({ note }: ReleaseNoteCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "major":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "minor":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "patch":
        return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">v{note.version}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(note.date).toLocaleDateString()}
            </div>
          </div>
          <Badge className={getTypeColor(note.type)} variant="secondary">
            {note.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">{note.title}</h3>
            <p className="text-sm text-muted-foreground">{note.description}</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Changes:</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {note.changes.map((change, index) => (
                <li key={index}>{change}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}