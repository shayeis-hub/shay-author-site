import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {personLd} from '@/content/books';

const description = 'Shay Eisenberg is an author, certified personal coach, creator, and long-distance runner, writing about habits, family history, and the choices that shape a life.';
const portrait = {url: '/shay-eisenberg.jpg', width: 1365, height: 2048, alt: 'Shay Eisenberg'};

export const metadata: Metadata = {
  title: 'About',
  description,
  alternates: {canonical: '/about'},
  openGraph: {title: 'About Shay Eisenberg', description, url: '/about', images: [portrait]},
  twitter: {card: 'summary_large_image', title: 'About Shay Eisenberg', description, images: [portrait.url]},
};

export default function About() {
  return <main id="main" className="about-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(personLd).replace(/</g, '\\u003c')}} />
    <div className="wrap about-head">
      <p className="eyebrow">About the author</p>
      <h1>I write about the<br/><em>things we carry.</em></h1>
      <div className="about-head-bottom">
        <span>Shay Eisenberg</span>
        <p>Some are habits. Some are stories. Some arrive in a stack of handwritten pages and ask to be told again.</p>
      </div>
    </div>
    <div className="about-content">
      <div className="wrap about-columns">
        <div className="about-aside">
          <div className="portrait-space">
            <Image src="/shay-eisenberg.jpg" alt="Shay Eisenberg standing by the shore" width={1365} height={2048} sizes="(max-width: 700px) min(100vw - 40px, 420px), 420px" />
          </div>
          <p>Author · Creator · Long-distance runner</p>
        </div>
        <div className="about-text">
          <h2>People have always<br/><em>been the subject.</em></h2>
          <p>I&apos;m Shay Eisenberg. I write books that don&apos;t fit neatly on a single shelf - a practical book about habits, my grandfather&apos;s remarkable journey through a Europe at war, a love story that began in 1993, and a picture book for children.</p>
          <p>Long before I began publishing books, much of my work was already about people and change. As a certified personal coach, I&apos;ve guided thousands of participants through group programs focused on behavior change and weight management. That experience eventually found its way into <em>One Habit at a Time</em>.</p>
          <p>Other stories came from somewhere completely different. <em>Five Centimeters Apart</em> grew from a story I had lived. <em>A Soldier of No Country</em> began with handwritten pages my grandfather left behind - and with the realization that if someone didn&apos;t tell his story again, part of it might disappear.</p>
          <p>I also build digital products, run long distances, and keep finding new things I want to make.</p>
          <p>Apparently, sticking to one category was never really the plan.</p>
          <Link href="/books" className="text-link">Explore the books <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </div>
  </main>;
}
