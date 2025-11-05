import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Developed with</span>
          <Heart className="w-4 h-4 text-destructive fill-destructive" />
          <span>by S. Meenakshi | RhythmIQ Project</span>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">
          © 2025 RhythmIQ. For informational purposes only. Always consult a
          healthcare professional.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
