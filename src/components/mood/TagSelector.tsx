import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMoodTags } from "@/hooks/useMoodTags";
import { toast } from "sonner";

interface TagSelectorProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export function TagSelector({ selected, onChange }: TagSelectorProps) {
  const { tags, addTag, isLoaded } = useMoodTags();
  const [newTag, setNewTag] = useState("");
  const [adding, setAdding] = useState(false);

  const toggleTag = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((t) => t !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  const handleAdd = async () => {
    const name = newTag.trim();
    if (!name) return;
    try {
      await addTag(name);
      onChange([...selected, name.toLowerCase()]);
      setNewTag("");
      setAdding(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not add tag";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Tags</label>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Plus className="h-3 w-3" /> New
          </button>
        )}
      </div>

      {adding && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Tag name"
            autoFocus
            maxLength={32}
            className="h-9 flex-1 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="h-9 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              setNewTag("");
            }}
            className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Cancel"
          >
            <X className="mx-auto h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!isLoaded && (
          <span className="text-xs text-muted-foreground">Loading tags…</span>
        )}
        {isLoaded && tags.length === 0 && (
          <span className="text-xs text-muted-foreground">No tags yet — add your first.</span>
        )}
        {tags.map((tag) => {
          const isSelected = selected.includes(tag.name);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.name)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {tag.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
