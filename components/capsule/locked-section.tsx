import { Lock } from "lucide-react";
import { differenceInCalendarDays, format } from "date-fns";

export function LockedSection({ openDate }: { openDate: string }) {
  const days = differenceInCalendarDays(new Date(openDate), new Date());

  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed p-8 text-center">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 backdrop-blur-sm" />
      <div className="relative space-y-3">
        <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
        <h3 className="text-lg font-medium">Future letter locked</h3>
        <p className="text-sm text-muted-foreground">
          Unlocks in {Math.max(days, 0)} day{days === 1 ? "" : "s"} on{" "}
          {format(new Date(openDate), "MMMM d, yyyy")}
        </p>
        <div className="mx-auto max-w-md rounded-lg bg-muted/50 p-4 text-left text-sm text-muted-foreground blur-[2px]">
          Dear future me, your passion still matters. Keep going, even when the path feels uncertain...
        </div>
      </div>
    </div>
  );
}
