import Link from "next/link";
import { useRouter } from "next/router";

/**
 * Navbar — sticky top navigation shared across all pages, highlighting
 * the current route.
 */
export default function Navbar() {
  const router = useRouter();

  const linkClass = (href) =>
    `nav-link${router.pathname === href ? " active" : ""}`;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="brand">
          <span className="brand-dot" aria-hidden="true" />
          StadiumSense AI
        </Link>
        <div className="nav-links">
          <Link href="/" className={linkClass("/")}>
            Home
          </Link>
          <Link href="/fan" className={linkClass("/fan")}>
            Fan Assistant
          </Link>
          <Link href="/staff" className={linkClass("/staff")}>
            Staff Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
