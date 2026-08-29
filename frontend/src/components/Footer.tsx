import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border py-16 px-6 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
        {/* Brand */}
        <div className="col-span-1 md:col-span-1 flex flex-col items-start">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl font-bold tracking-tight text-foreground">ZERAVYNEX</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Zeravynex
          </p>
        </div>

        {/* Product */}
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-foreground">Product</h4>
          <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link to="/dashboard/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          <Link to="/dashboard/api" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API</Link>
          <Link to="/roadmap" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Roadmap</Link>
        </div>

        {/* Resources */}
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-foreground">Resources</h4>
          <Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</Link>
          <a href="https://github.com/zeravynex" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">GitHub</a>
          <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
          <Link to="/research" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Research</Link>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-foreground">Company</h4>
          <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
          <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
