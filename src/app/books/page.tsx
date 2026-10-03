import type {Metadata} from 'next';
import Link from 'next/link';
import {books} from '@/content/books';
import {BookCover} from '@/components/BookCover';

const portrait = {url: '/shay-eisenberg.jpg', width: 1365, height: 2048, alt: 'Shay Eisenberg'};

export const metadata: Metadata = {title:'Books',description:'Explore the books of Shay Eisenberg: family history, habits, a true love story, and a picture book for children.',alternates:{canonical:'/books'},openGraph:{title:'Books by Shay Eisenberg',description:'Stories about the lives we inherit and the choices we make.',url:'/books',images:[portrait]},twitter:{card:'summary_large_image',title:'Books by Shay Eisenberg',description:'Stories about the lives we inherit and the choices we make.',images:[portrait.url]}};

export default function BooksPage() {return <main id="main" className="wrap listing-page"><div className="page-intro"><p className="eyebrow">The books · 01—04</p><h1>Books that follow<br/><em>human lives.</em></h1><p>Four books, each in its own voice. History, habits, love, and a little adventure.</p></div><div className="catalogue">{books.map((book,i)=><article className={`catalogue-row ${book.theme}`} key={book.slug}><Link className="catalogue-art" href={`/books/${book.slug}`} aria-label={`Explore ${book.title}`}><BookCover book={book} priority={i===0}/></Link><div className="catalogue-copy"><p className="eyebrow">{String(i+1).padStart(2,'0')} / {book.category}</p><h2><Link href={`/books/${book.slug}`}>{book.title}</Link></h2><p>{book.short}</p><Link className="text-link" href={`/books/${book.slug}`}>Explore the book <span aria-hidden="true">↗</span></Link></div></article>)}</div></main>}
