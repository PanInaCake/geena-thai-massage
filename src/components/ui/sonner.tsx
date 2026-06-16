import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-left"
      expand
      visibleToasts={4}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-2 group-[.toaster]:border-border group-[.toaster]:shadow-2xl group-[.toaster]:min-w-[min(100vw-2rem,28rem)] group-[.toaster]:p-5 group-[.toaster]:text-base",
          title: "group-[.toast]:text-lg group-[.toast]:font-semibold group-[.toast]:leading-snug",
          description: "group-[.toast]:text-base group-[.toast]:text-muted-foreground group-[.toast]:leading-relaxed",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:text-base group-[.toast]:px-4 group-[.toast]:py-2",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:text-base group-[.toast]:px-4 group-[.toast]:py-2",
          closeButton:
            "group-[.toast]:scale-125 group-[.toast]:opacity-80 group-[.toast]:hover:opacity-100",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
