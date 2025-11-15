export type Post = {
  slug: string
  title: string
  excerpt: string
  date: string
  image: string
}

export const posts: Post[] = [
  {
    slug: 'autumn-flavors',
    title: 'Autumn Flavors Arrive',
    excerpt: 'Seasonal dishes with warm spices and fresh harvest.',
    date: '2025-11-01',
    image: '/images/Bread and Wok fried.jpg'
  },
  {
    slug: 'hotpot-weekend',
    title: 'Hot Pot Weekend Special',
    excerpt: 'Bring friends and enjoy our signature broth.',
    date: '2025-11-08',
    image: '/images/HotPot.jpg'
  },
  {
    slug: 'noodle-art',
    title: 'The Art of Noodles',
    excerpt: 'Hand-pulled noodles and rich sauces.',
    date: '2025-11-10',
    image: '/images/Noodles and rice.jpg'
  }
]
