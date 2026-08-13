import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "teal" | "coral" | "gold" | "berry" | "leaf" | "cream";

const TONES: Record<Tone, string> = {
  teal: "bg-primary text-primary-foreground",
  coral: "bg-accent text-accent-foreground",
  gold: "bg-gold text-gold-foreground",
  berry: "bg-berry text-berry-foreground",
  leaf: "bg-leaf text-leaf-foreground",
  cream: "bg-card text-foreground border-2 border-border",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: Tone;
  children: ReactNode;
};

export function ClayButton({ tone = "teal", className = "", children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`clay clay-press inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-bold disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none ${TONES[tone]} ${className}`}
    >
      {children}
    </button>
  );
}
