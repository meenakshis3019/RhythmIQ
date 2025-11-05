import { Activity } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary">
            <Activity className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              RhythmIQ
            </h1>
            <p className="text-sm text-muted-foreground">
              Your Smart ECG Assistant
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
