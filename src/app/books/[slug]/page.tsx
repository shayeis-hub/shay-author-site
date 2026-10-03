import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {books,bookBySlug,site,personId} from '@/content/books';
import {BookCover} from '@/components/BookCover';

export function generateStaticParams(){return books.map(({slug})=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const book=bookBySlug(slug);if(!book)return {};const url=`/books/${slug}`;return {title:book.title,description:book.seo,alternates:{canonical:url},openGraph:{type:'book',title:book.title,description:book.seo,url,images:[{url:book.cover,width:book.coverWidth,height:book.coverHeight,alt:`Cover of ${book.title}`}]},twitter:{card:'summary_large_image',title:book.title,description:book.seo,images:[book.cover]}};}

export default async function BookPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const book=bookBySlug(slug);if(!book)notFound();
  const i=books.indexOf(book);const next=books[(i+1)%books.length];
  const url=`${site.url}/books/${slug}`;
  const schema={'@context':'https://schema.org','@type':'Book',name:book.title,author:{'@type':'Person','@id':personId,name:'Shay Eisenberg',url:site.url},url,mainEntityOfPage:url,image:`${site.url}${book.cover}`,description:book.seo,genre:book.category,...(book.format==='Kindle'?{bookFormat:'https://schema.org/EBook'}:{}),...(book.amazon?{sameAs:book.amazon}:{})};
  const breadcrumbSchema={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Books',item:`${site.url}/books`},{'@type':'ListItem',position:2,name:book.title,item:url}]};
  return <main id="main" className={`book-page ${book.theme}`}><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}} /><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbSchema).replace(/</g,'\\u003c')}} /><div className="wrap"><div className="breadcrumbs"><Link href="/books">Books</Link><span aria-hidden="true">/</span><span>{book.title}</span></div><div className="book-hero"><div className="book-hero-art"><BookCover book={book} priority/></div><div className="book-hero-copy"><p className="eyebrow">{book.category}</p><h1>{book.title}</h1><p className="book-deck">{book.short}</p><div className="book-actions">{book.amazon&&<a className="button button-dark" href={book.amazon} target="_blank" rel="noopener noreferrer">View on Amazon <span aria-hidden="true">↗</span></a>}{book.format&&<span className="format">Available on {book.format}</span>}</div></div></div></div><section className="book-body wrap"><div className="eyebrow">Inside the book <span className="hairline"/></div><div className="book-prose">{book.description.map((paragraph)=><p key={paragraph}>{paragraph}</p>)}<blockquote>{book.detail}</blockquote>{book.behind&&<div className="behind"><h2>Behind the book</h2><p>{book.behind}</p></div>}</div></section><div className="wrap book-next"><span className="eyebrow">Keep exploring</span><Link href={`/books/${next.slug}`}>{next.title}<span aria-hidden="true">↗</span></Link></div></main>;
}
