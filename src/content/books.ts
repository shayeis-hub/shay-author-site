export type Book = {
  slug: string; title: string; category: string; cover: string; coverShape?: 'square';
  coverWidth: number; coverHeight: number;
  short: string; description: string[]; detail: string; theme: string;
  amazon?: string; format?: string; behind?: string; seo: string;
};

// Book content and sales links live here. Add a new entry to add a new book page.
export const books: Book[] = [
  {
    slug: 'a-soldier-of-no-country', title: 'A Soldier of No Country',
    category: 'Historical narrative · True story', cover: '/books/soldier.jpg', coverWidth: 1600, coverHeight: 2560,
    short: 'A life carried across borders, wars, and the question of where home begins.',
    description: [
      'Joseph’s life took him across a changing Europe, through displacement and service in the French Foreign Legion, and eventually toward Eretz Israel. At every turn, papers, borders, and uniforms decided what he could call home.',
      'Drawn from a handwritten memoir left by Shay’s grandfather and the family record, this is a literary telling of a life lived under other people’s flags.'
    ],
    detail: 'A family history told for anyone who has wondered what a person carries when everything familiar is taken away.',
    behind: 'The story began with Joseph’s handwritten German memoir. Shay shaped his grandfather’s account into a book for readers beyond the family, while keeping its known history at the center.',
    theme: 'slate', amazon: 'https://www.amazon.com/dp/B0HJB2RCG7', format: 'Kindle',
    seo: 'The story of Joseph Eisenberg, drawn from his handwritten memoir: displacement, the French Foreign Legion, and a journey toward Eretz Israel.'
  },
  {
    slug: 'one-habit-at-a-time', title: 'One Habit at a Time',
    category: 'Habits · Health', cover: '/books/habit.jpg', coverWidth: 1280, coverHeight: 2048,
    short: 'A quieter, more workable way to change: begin with one habit.',
    description: [
      'Trying to change everything at once rarely leaves room to live. One Habit at a Time offers a progressive approach to everyday health and weight management, built around small changes that can become part of ordinary life.',
      'It grows out of Shay’s years guiding people through group programs and his interest in what helps a good intention become a lasting practice.'
    ],
    detail: 'Practical nonfiction about consistency, patience, and the choices repeated when no one is watching.',
    theme: 'forest', amazon: 'https://www.amazon.com/dp/B0HFCHQ8H1', seo: 'A practical book by Shay Eisenberg on sustainable habits, health, and changing one behavior at a time.'
  },
  {
    slug: 'five-centimeters-apart', title: 'Five Centimeters Apart',
    category: 'A true love story', cover: '/books/five.jpg',
    short: 'A small distance. A long way to find the courage to cross it.',
    description: [
      'In 1993, Ben and Noa began with a horseback ride, a bag carried for her, and letters sent from an army base. Their relationship took shape in the spaces between meetings, calls, and the things they were still too shy to say.',
      'More than thirty years later, Shay returns to those early moments in a personal account of how two people found their way toward a life together.'
    ],
    detail: 'An intimate memoir of hesitation, affection, and all the years on the other side of a first small gesture.',
    theme: 'clay', coverWidth: 1600, coverHeight: 2560, amazon: 'https://www.amazon.com/dp/B0HJ52MJJK', seo: 'Shay Eisenberg’s true love story about Ben and Noa, and the small moments that became a life together.'
  },
  {
    slug: 'seven-empty-circles', title: 'Seven Empty Circles',
    category: 'A picture book for children', cover: '/books/seven.png', coverShape: 'square', coverWidth: 1254, coverHeight: 1254,
    short: 'A curious adventure about the everyday choices that help us grow.',
    description: [
      'Juno and Bo discover a glowing map with seven empty circles. As they follow it, ordinary moments become an invitation to notice how they eat, drink, move, and care for themselves.',
      'A bright picture book that opens conversations about healthy habits with warmth and curiosity.'
    ],
    detail: 'A story for young readers and the grown-ups who read alongside them.',
    theme: 'gold', amazon: 'https://www.amazon.com/dp/B0HHR5P477', seo: 'A children’s picture book by Shay Eisenberg about Juno, Bo, and discovering everyday healthy habits.'
  }
];

export const bookBySlug = (slug: string) => books.find(book => book.slug === slug);
export const site = {
  url: 'https://shayeisenberg.com',
  title: 'Shay Eisenberg',
  description: 'Books and ideas by Shay Eisenberg. Stories about people, behavior, and the small moments that shape a life.',
  authorAmazon: undefined as string | undefined,
  youtube: 'https://www.youtube.com/c/shayeis',
  contactEmail: undefined as string | undefined,
};

export const personId = `${site.url}/#person`;
export const personLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': personId,
  name: 'Shay Eisenberg',
  url: site.url,
  image: `${site.url}/shay-eisenberg.jpg`,
  jobTitle: 'Author, certified personal coach, and long-distance runner',
  description: site.description,
  ...(site.youtube ? {sameAs: [site.youtube]} : {}),
};
