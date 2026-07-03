import { Construction } from "lucide-react";

interface UnderDevelopmentProps {
  moduleName?: string;
}

export function UnderDevelopment({ moduleName }: UnderDevelopmentProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-warning-muted border border-warning-border rounded-2xl p-12 max-w-md w-full shadow-sm">
        <div className="flex justify-center mb-4">
          <div className="bg-warning-muted p-4 rounded-full">
            <Construction className="size-10 text-warning" />
          </div>
        </div>
        {moduleName && (
          <p className="text-sm text-warning font-medium mb-2 uppercase tracking-wide">{moduleName}</p>
        )}
        <h2 className="text-2xl font-bold text-primary mb-3">Module Under Development</h2>
        <p className="text-muted-foreground text-sm">
          This module is currently being developed and will be available soon.
        </p>
      </div>
    </div>
  );
}
