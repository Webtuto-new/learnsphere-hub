import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description?: string;
  path?: string;
}

const SEOHead = ({ title, description, path }: SEOHeadProps) => {
  useEffect(() => {
    const fullTitle = title === "Webtuto" ? "Webtuto — Sri Lanka's #1 Online Learning Platform" : `${title} | Webtuto`;
    document.title = fullTitle;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(name.startsWith("og:") || name.startsWith("twitter:") ? "property" : "name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const desc = description || "Live classes, expert tutors, and comprehensive courses for National, Cambridge & Edexcel syllabuses on Webtuto.";
    setMeta("description", desc);
    setMeta("og:title", fullTitle);
    setMeta("og:description", desc);
    if (path) {
      setMeta("og:url", `${window.location.origin}${path}`);
    }
    setMeta("og:type", "website");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", desc);
  }, [title, description, path]);

  return null;
};

export default SEOHead;
