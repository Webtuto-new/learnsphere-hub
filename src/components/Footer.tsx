import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <span className="text-secondary-foreground font-display font-bold text-lg">W</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground">Webtuto</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sri Lanka's premier online learning platform. National & London syllabus classes with expert tutors.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Platform</h4>
            <div className="space-y-2">
              {["Classes", "Recordings", "Bundles", "Seminars", "Workshops"].map((item) => (
                <Link key={item} to={`/${item.toLowerCase()}`} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Curriculum</h4>
            <div className="space-y-2">
              {["National Syllabus", "Cambridge", "Edexcel", "London Syllabus"].map((item) => (
                <span key={item} className="block text-sm text-muted-foreground">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Support</h4>
            <div className="space-y-2">
              {[
                { label: "How To Use", path: "/how-to-use" },
                { label: "Tutor Application", path: "/tutor-application" },
                { label: "Contact", path: "/contact" },
                { label: "Terms", path: "/terms" },
                { label: "Privacy", path: "/privacy" },
              ].map((item) => (
                <Link key={item.path} to={item.path} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-10 pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Webtuto. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
