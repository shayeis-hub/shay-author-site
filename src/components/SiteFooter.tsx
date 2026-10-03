import Link from 'next/link';
import {site} from '@/content/books';

export function SiteFooter() {
  return <footer className="site-footer"><div className="wrap footer-grid"><div><Link href="/" className="footer-name">Shay Eisenberg<span className="accent">.</span></Link><p>Books, ideas, and the lives behind them.</p></div><nav aria-label="Footer navigation"><Link href="/books">Books</Link><Link href="/about">About</Link><Link href="/ideas">Ideas</Link>{site.authorAmazon && <a href={site.authorAmazon} target="_blank" rel="noopener noreferrer">Amazon author page ↗</a>}{site.youtube && <a href={site.youtube} target="_blank" rel="noopener noreferrer">YouTube ↗</a>}{site.contactEmail && <a href={`mailto:${site.contactEmail}`}>Contact</a>}</nav><small>© {new Date().getFullYear()} Shay Eisenberg</small></div></footer>;
}
