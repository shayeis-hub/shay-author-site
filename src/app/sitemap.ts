import type {MetadataRoute} from 'next';
import {books,site} from '@/content/books';
export default function sitemap():MetadataRoute.Sitemap{return ['','/books','/about','/ideas',...books.map(book=>`/books/${book.slug}`)].map(path=>({url:`${site.url}${path}`,changeFrequency:'monthly',priority:path===''?1:path==='/books'?.8:.6}));}
