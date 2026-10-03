import type {Metadata} from 'next';
import Link from 'next/link';
export const metadata:Metadata={title:'Page not found',robots:{index:false,follow:false}};
export default function NotFound(){return <main id="main" className="wrap ideas-page"><p className="eyebrow">404 / Page not found</p><h1>A page<br/><em>out of place.</em></h1><div className="ideas-bottom"><p>This address doesn’t lead to a page on the site.</p><Link className="text-link" href="/">Back to the beginning ↗</Link></div></main>}
