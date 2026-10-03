import Image from 'next/image';
import type {Book} from '@/content/books';

export function BookCover({book, priority = false, className = ''}: {book: Book; priority?: boolean; className?: string}) {
  return <div className={`cover-frame ${book.coverShape === 'square' ? 'cover-square' : ''} ${className}`}>
    <Image src={book.cover} alt={`Cover of ${book.title}`} fill sizes="(max-width: 700px) 75vw, 350px" priority={priority} className="cover-image" />
  </div>;
}
