import Link from 'next/link';
import Image from 'next/image';
import {books, personLd} from '@/content/books';
import {BookCover} from '@/components/BookCover';

export default function Home() {
  const [featured, ...rest] = books;
  return <main id="main">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(personLd).replace(/</g,'\\u003c')}} />
    <section className="hero wrap"><div className="hero-kicker eyebrow">An author’s home · Stories in many forms</div><h1>Shay<br/><em>Eisenberg<span className="accent">.</span></em></h1><div className="hero-bottom"><p>On the small choices we make. The people we love. The lives we inherit.</p><Link href="/books" className="text-link">Explore the books <span aria-hidden="true">↗</span></Link></div><div className="hero-number" aria-hidden="true">01 / 04</div></section>

    <section className="feature-section"><div className="wrap feature-grid"><div className="feature-copy"><p className="eyebrow light-label">Featured book <span className="hairline"/></p><h2>A Soldier<br/>of No Country</h2><p>His life crossed borders, war, and service under a foreign flag. His story survived in a handwritten memoir.</p><p className="feature-small">The story of Shay’s grandfather, Joseph, retold for readers beyond the family.</p><div className="actions"><Link className="button button-light" href={`/books/${featured.slug}`}>Discover the book <span aria-hidden="true">↗</span></Link><a className="subtle-link" href={featured.amazon} target="_blank" rel="noopener noreferrer">View on Amazon ↗</a></div></div><Link href={`/books/${featured.slug}`} className="feature-cover-link" aria-label="Read about A Soldier of No Country"><Image src={featured.cover} alt="Cover of A Soldier of No Country" width={480} height={768} priority sizes="(max-width: 700px) 65vw, 32vw" /></Link><div className="feature-index" aria-hidden="true">THE BOOKS / 001</div></div></section>

    <section className="shelf wrap"><div className="section-heading"><div><p className="eyebrow">The collection</p><h2>Some stories are found.<br/><em>Others are lived.</em></h2></div><Link className="text-link" href="/books">All books <span aria-hidden="true">↗</span></Link></div><div className="book-shelf">{rest.map((book,index)=><article className={`shelf-item shelf-${index+1}`} key={book.slug}><Link href={`/books/${book.slug}`} className="shelf-cover-link"><BookCover book={book}/></Link><p className="eyebrow book-category">{book.category}</p><h3><Link href={`/books/${book.slug}`}>{book.title}</Link></h3><p>{book.short}</p><Link href={`/books/${book.slug}`} className="quiet-link">About this book ↗</Link></article>)}</div></section>

    <section className="about-strip"><div className="wrap about-strip-inner"><div className="eyebrow">A little about Shay <span className="hairline"/></div><div><h2>From the page<br/><em>to everyday life.</em></h2><p>Shay Eisenberg writes across genres: books about habits, a family history recovered from a manuscript, a love story lived over decades, and a story for children. What connects them is an interest in people and the choices that shape their days.</p><Link className="text-link" href="/about">Meet Shay <span aria-hidden="true">↗</span></Link></div></div></section>
  </main>;
}
