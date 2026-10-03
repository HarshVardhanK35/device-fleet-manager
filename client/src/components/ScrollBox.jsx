import * as ScrollArea from "@radix-ui/react-scroll-area";

function ScrollBox({ className = "", children }) {
  return (
    <ScrollArea.Root className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <ScrollArea.Viewport
        className={`w-full h-full [&>div]:!block ${className}`}
      >
        {children}
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        orientation="vertical"
        className="flex select-none touch-none p-0.5 bg-bg-hover w-2.5 rounded-full"
      >
        <ScrollArea.Thumb className="flex-1 bg-text-muted rounded-full relative" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}

export default ScrollBox;
