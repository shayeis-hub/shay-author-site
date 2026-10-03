import Link from 'next/link';

export function SiteHeader() {
  return <header className="site-header wrap">
    <Link className="wordmark" href="/" aria-label="Shay Eisenberg home">SE<span className="wordmark-dot">.</span><span className="wordmark-name">Shay Eisenberg</span></Link>
    <nav aria-label="Main navigation"><Link href="/books">Books</Link><Link href="/about">About</Link><Link href="/ideas">Ideas</Link></nav>
  </header>;
}
