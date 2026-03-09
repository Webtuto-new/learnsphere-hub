import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="inline-block mb-4">
              <img src={logo} alt="Webtuto.LK" className="h-10 w-auto" />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sri Lanka's premier online learning platform. National & London syllabus classes with expert tutors.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Platform</h4>
            <div className="space-y-2.5">
              {[
                { label: "Classes", path: "/classes" },
                { label: "Recordings", path: "/recordings" },
                { label: "Bundles", path: "/bundles" },
                { label: "Seminars", path: "/seminars" },
                { label: "Workshops", path: "/workshops" },
              ].map((item) => (
                <Link key={item.path} to={item.path} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Support</h4>
            <div className="space-y-2.5">
              {[
                { label: "How To Use", path: "/how-to-use" },
                { label: "Become a Tutor", path: "/tutor-application" },
                { label: "Contact", path: "/contact" },
              ].map((item) => (
                <Link key={item.path} to={item.path} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Webtuto.LK — All rights reserved.</span>
          <span className="text-xs">Sri Lanka's #1 Online Learning Platform</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
