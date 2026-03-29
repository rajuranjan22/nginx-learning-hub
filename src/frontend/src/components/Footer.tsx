import { CATEGORIES } from "@/data/lessons";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  const columns = [
    {
      title: "Learn",
      links: CATEGORIES.slice(0, 5),
    },
    {
      title: "Advanced",
      links: CATEGORIES.slice(5),
    },
    {
      title: "Resources",
      links: ["Documentation", "Community", "Blog", "Changelog", "Status"],
    },
    {
      title: "Company",
      links: ["About", "Careers", "Contact", "Privacy Policy", "Terms"],
    },
  ];

  return (
    <footer
      className="border-t border-border mt-auto"
      style={{ background: "var(--header-bg)" }}
      data-ocid="footer.panel"
    >
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="text-base font-bold"
              style={{ color: "var(--green-accent)" }}
            >
              NGINX
            </span>
            <span className="text-base font-bold text-foreground">Academy</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © {year}. Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              style={{ color: "var(--green-accent)" }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
