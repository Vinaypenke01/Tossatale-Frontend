import coverLane from "@/assets/cover-lane.jpg";
import coverPlatform from "@/assets/cover-platform.jpg";
import coverDesk from "@/assets/cover-desk.jpg";
import coverTerrace from "@/assets/cover-terrace.jpg";
import coverBoat from "@/assets/cover-boat.jpg";
import coverBookshop from "@/assets/cover-bookshop.jpg";

export const covers = {
  lane: coverLane,
  platform: coverPlatform,
  desk: coverDesk,
  terrace: coverTerrace,
  boat: coverBoat,
  bookshop: coverBookshop,
};

export type Writer = {
  slug: string;
  name: string;
  initials: string;
  handle: string;
  verified: boolean;
  role: string;
  location: string;
  bio: string;
  stories: number;
  followers: string;
  reads: string;
  joined: string;
  socials: { label: string; href: string }[];
  achievements: string[];
};

export const writers: Writer[] = [
  {
    slug: "meera-raghavan",
    name: "Meera Raghavan",
    initials: "MR",
    handle: "@meera.writes",
    verified: true,
    role: "Longform & memoir",
    location: "Varanasi, IN",
    bio: "I write about the small rooms of ordinary lives — grandmothers, ledgers, monsoon lanes. Nine years in print, three in longform serials.",
    stories: 42,
    followers: "18.4k",
    reads: "1.2M",
    joined: "March 2021",
    socials: [
      { label: "Website", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "Substack", href: "#" },
    ],
    achievements: ["Editor's Pick ×7", "100k Reads Club", "Series of the Year 2025"],
  },
  {
    slug: "arjun-sethi",
    name: "Arjun Sethi",
    initials: "AS",
    handle: "@arjunonrails",
    verified: true,
    role: "Travel & reportage",
    location: "Kochi, IN",
    bio: "Trains, harbours, border towns. I go where the timetable ends and send back what I find.",
    stories: 31,
    followers: "12.1k",
    reads: "840k",
    joined: "July 2022",
    socials: [
      { label: "Website", href: "#" },
      { label: "X", href: "#" },
    ],
    achievements: ["Editor's Pick ×4", "Top Travel Writer"],
  },
  {
    slug: "nadia-farouk",
    name: "Nadia Farouk",
    initials: "NF",
    handle: "@nadiafarouk",
    verified: true,
    role: "Speculative fiction",
    location: "Lisbon, PT",
    bio: "Quiet science fiction about memory, water and the things we keep. Currently serialising 'The Salt Archive'.",
    stories: 24,
    followers: "9.7k",
    reads: "612k",
    joined: "January 2023",
    socials: [{ label: "Website", href: "#" }],
    achievements: ["Rising Voice 2025", "50k Reads Club"],
  },
  {
    slug: "kabir-menon",
    name: "Kabir Menon",
    initials: "KM",
    handle: "@kabirmenon",
    verified: false,
    role: "Essays & criticism",
    location: "Bengaluru, IN",
    bio: "Essays on cinema, cities and the strange grammar of nostalgia.",
    stories: 17,
    followers: "5.3k",
    reads: "298k",
    joined: "October 2024",
    socials: [{ label: "Letterboxd", href: "#" }],
    achievements: ["Debut of the Month"],
  },
  {
    slug: "ila-bhattacharya",
    name: "Ila Bhattacharya",
    initials: "IB",
    handle: "@ilawrites",
    verified: true,
    role: "Poetry & short fiction",
    location: "Kolkata, IN",
    bio: "Short forms, long silences. Two collections, one very patient cat.",
    stories: 58,
    followers: "22.6k",
    reads: "1.6M",
    joined: "August 2020",
    socials: [
      { label: "Website", href: "#" },
      { label: "Instagram", href: "#" },
    ],
    achievements: ["Editor's Pick ×11", "Million Reads Club", "Community Favourite"],
  },
  {
    slug: "tomas-vidal",
    name: "Tomás Vidal",
    initials: "TV",
    handle: "@tomasvidal",
    verified: false,
    role: "Documentary & film",
    location: "Porto, PT",
    bio: "I film people who don't like being filmed, gently.",
    stories: 12,
    followers: "3.9k",
    reads: "176k",
    joined: "May 2025",
    socials: [{ label: "Vimeo", href: "#" }],
    achievements: ["New Voice"],
  },
];

export const writerBySlug = (slug: string) => writers.find((w) => w.slug === slug);
export const storiesByWriter = (slug: string) => stories.filter((s) => s.writer === slug);

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  count: number;
};

export const categories: Category[] = [
  { slug: "memoir", name: "Memoir", blurb: "Lives, remembered slowly.", count: 218 },
  { slug: "fiction", name: "Fiction", blurb: "Invented truths.", count: 486 },
  { slug: "travel", name: "Travel", blurb: "Timetables and detours.", count: 174 },
  { slug: "essays", name: "Essays", blurb: "Thinking out loud, carefully.", count: 302 },
  { slug: "speculative", name: "Speculative", blurb: "Futures that feel like home.", count: 129 },
  { slug: "poetry", name: "Poetry", blurb: "Short forms, long echoes.", count: 241 },
  { slug: "food", name: "Food & Kitchens", blurb: "Recipes as autobiography.", count: 96 },
  { slug: "cinema", name: "Cinema", blurb: "Frames worth arguing over.", count: 88 },
];

export type Story = {
  slug: string;
  title: string;
  dek: string;
  cover: string;
  category: string;
  categorySlug: string;
  tags: string[];
  writer: string;
  readingTime: number;
  views: string;
  likes: string;
  date: string;
  series?: string;
  part?: string;
  featured?: boolean;
  trending?: boolean;
  bookmarked?: boolean;
  progress?: number;
  body: string[];
};

const sampleBody = (opener: string) => [
  opener,
  "For years I believed the house was the story. It took me a decade of returning to understand that the house was only the room the story happened to be standing in — patient, whitewashed, unbothered by our arrivals.",
  "## The ledger",
  "My grandmother kept accounts in a cloth-bound ledger with a rubber band around its middle. Rice, kerosene, the tailor, the man who came on Thursdays with fish. Her handwriting was small and upright and completely without doubt.",
  "> She never wrote down what anything meant. She only wrote down what it cost.",
  "When she died we found the ledger in the almirah under a folded sari, the rubber band gone brittle and split. The last entry was for a bus ticket she never used.",
  "## What the river keeps",
  "Downriver, the boatmen say the water takes nothing, it only moves things to a place you have not walked yet. I have decided to believe them. It is a more generous physics than the one I was taught.",
  "There is a particular hour before the light turns — you know it if you have lived near water — when the far bank stops being a place and becomes only a colour. I have written most of this in that hour, over four monsoons, in three cities, on the back of whatever was nearest.",
  "What I want to say is simple, and it takes a whole story to say it: we are made mostly of the ordinary afternoons nobody thought to record. So record them. Badly, if you must. Record them anyway.",
];

export const stories: Story[] = [
  {
    slug: "the-ledger-my-grandmother-kept",
    title: "The Ledger My Grandmother Kept",
    dek: "Four monsoons, one cloth-bound account book, and everything a family refuses to say out loud.",
    cover: covers.lane,
    category: "Memoir",
    categorySlug: "memoir",
    tags: ["family", "monsoon", "varanasi", "inheritance"],
    writer: "meera-raghavan",
    readingTime: 14,
    views: "84.2k",
    likes: "6.1k",
    date: "12 Jul 2026",
    series: "House of Small Rooms",
    part: "Part 1 of 6",
    featured: true,
    trending: true,
    progress: 62,
    body: sampleBody(
      "The house on Bhelupur road had eleven doors and not one of them closed properly. This is the first thing anyone tells you about it, and the last thing they remember.",
    ),
  },
  {
    slug: "night-train-to-nowhere-in-particular",
    title: "Night Train to Nowhere in Particular",
    dek: "I bought a ticket to the last station on the line to find out who else was still awake.",
    cover: covers.platform,
    category: "Travel",
    categorySlug: "travel",
    tags: ["railways", "night", "strangers"],
    writer: "arjun-sethi",
    readingTime: 11,
    views: "62.8k",
    likes: "4.4k",
    date: "09 Jul 2026",
    trending: true,
    bookmarked: true,
    progress: 18,
    body: sampleBody(
      "The platform announcer had a voice built for bad news, and at 1:40 in the morning he used it to tell nine of us that the train would be another hour.",
    ),
  },
  {
    slug: "the-salt-archive",
    title: "The Salt Archive",
    dek: "In a city that stores memories in seawater, the archivist is running out of jars.",
    cover: covers.boat,
    category: "Speculative",
    categorySlug: "speculative",
    tags: ["memory", "water", "series"],
    writer: "nadia-farouk",
    readingTime: 19,
    views: "51.3k",
    likes: "5.8k",
    date: "05 Jul 2026",
    series: "The Salt Archive",
    part: "Part 3 of 9",
    trending: true,
    body: sampleBody(
      "Every citizen is entitled to nine jars. Mine were full by the time I was thirty-one, which the clerks called enthusiasm and my mother called grief.",
    ),
  },
  {
    slug: "what-my-desk-knows",
    title: "What My Desk Knows About Me",
    dek: "An inventory of a working surface, and the eleven years of drafts it has quietly survived.",
    cover: covers.desk,
    category: "Essays",
    categorySlug: "essays",
    tags: ["craft", "writing", "routine"],
    writer: "kabir-menon",
    readingTime: 8,
    views: "38.9k",
    likes: "3.2k",
    date: "02 Jul 2026",
    bookmarked: true,
    progress: 100,
    body: sampleBody(
      "There is a ring on the left edge of my desk from a glass I put down in 2015, on a night I finished nothing at all.",
    ),
  },
  {
    slug: "two-grandmothers-and-a-kite",
    title: "Two Grandmothers and a Kite",
    dek: "Every January the sky above our terrace fills up, and two women who never agreed on anything take the same side.",
    cover: covers.terrace,
    category: "Memoir",
    categorySlug: "memoir",
    tags: ["family", "festival", "rooftops"],
    writer: "ila-bhattacharya",
    readingTime: 7,
    views: "44.6k",
    likes: "5.1k",
    date: "28 Jun 2026",
    featured: true,
    body: sampleBody(
      "They shared a terrace for forty years and a single opinion: that the boy from the next building flew his kites like a coward.",
    ),
  },
  {
    slug: "the-shop-that-sold-endings",
    title: "The Shop That Sold Endings",
    dek: "A bookshop in the old quarter that will not sell you the first half of anything.",
    cover: covers.bookshop,
    category: "Fiction",
    categorySlug: "fiction",
    tags: ["bookshops", "magic realism"],
    writer: "ila-bhattacharya",
    readingTime: 16,
    views: "72.1k",
    likes: "7.6k",
    date: "24 Jun 2026",
    trending: true,
    body: sampleBody(
      "The sign said FINISHED WORKS ONLY, which I took for pretension until I tried to buy a novel and was handed only its last forty pages.",
    ),
  },
  {
    slug: "a-brief-history-of-our-kitchen",
    title: "A Brief History of Our Kitchen",
    dek: "Six recipes, four decades, and one aluminium pot nobody is allowed to throw away.",
    cover: covers.terrace,
    category: "Food & Kitchens",
    categorySlug: "food",
    tags: ["food", "family", "recipes"],
    writer: "meera-raghavan",
    readingTime: 10,
    views: "29.4k",
    likes: "2.7k",
    date: "20 Jun 2026",
    body: sampleBody(
      "The pot is older than my mother's marriage and has outlived two stoves, one flood and a serious argument about ownership.",
    ),
  },
  {
    slug: "harbour-at-four-in-the-morning",
    title: "Harbour at Four in the Morning",
    dek: "Before the auction, before the ice, before the tourists — the quietest working hour in Kochi.",
    cover: covers.boat,
    category: "Travel",
    categorySlug: "travel",
    tags: ["kochi", "harbour", "work"],
    writer: "arjun-sethi",
    readingTime: 9,
    views: "33.7k",
    likes: "2.9k",
    date: "16 Jun 2026",
    body: sampleBody(
      "The men do not talk much at four. Talking is for five, when the price is known and there is something to be furious about.",
    ),
  },
  {
    slug: "letters-i-did-not-send",
    title: "Letters I Did Not Send",
    dek: "Eleven drafts to the same person, written across nine years, none of them posted.",
    cover: covers.desk,
    category: "Poetry",
    categorySlug: "poetry",
    tags: ["letters", "longing"],
    writer: "ila-bhattacharya",
    readingTime: 6,
    views: "58.2k",
    likes: "8.4k",
    date: "11 Jun 2026",
    body: sampleBody(
      "Draft one is two lines long and says everything. The other ten are apologies for the first.",
    ),
  },
];

export const storyBySlug = (slug: string) => stories.find((s) => s.slug === slug);
export const featuredStory = stories[0]!;
export const trendingStories = stories.filter((s) => s.trending);
export const latestStories = stories.slice(0, 6);

export type Series = {
  slug: string;
  title: string;
  writer: string;
  parts: number;
  cover: string;
  blurb: string;
  progress: number;
};

export const series: Series[] = [
  {
    slug: "house-of-small-rooms",
    title: "House of Small Rooms",
    writer: "meera-raghavan",
    parts: 6,
    cover: covers.lane,
    blurb: "A family home, told one door at a time.",
    progress: 33,
  },
  {
    slug: "the-salt-archive",
    title: "The Salt Archive",
    writer: "nadia-farouk",
    parts: 9,
    cover: covers.boat,
    blurb: "Nine jars, one archivist, a city made of remembering.",
    progress: 22,
  },
  {
    slug: "last-stations",
    title: "Last Stations",
    writer: "arjun-sethi",
    parts: 5,
    cover: covers.platform,
    blurb: "Five terminal towns at the end of five lines.",
    progress: 60,
  },
  {
    slug: "borrowed-endings",
    title: "Borrowed Endings",
    writer: "ila-bhattacharya",
    parts: 4,
    cover: covers.bookshop,
    blurb: "Short fiction about the last page.",
    progress: 0,
  },
];

export const collections = [
  {
    slug: "monsoon-reading",
    title: "Monsoon Reading",
    count: 12,
    blurb: "Stories best read with the windows open and the lights low.",
    cover: covers.lane,
  },
  {
    slug: "one-sitting",
    title: "Read in One Sitting",
    count: 18,
    blurb: "Under ten minutes, complete in themselves.",
    cover: covers.desk,
  },
  {
    slug: "quiet-futures",
    title: "Quiet Futures",
    count: 9,
    blurb: "Speculative fiction without a single explosion.",
    cover: covers.boat,
  },
];

export const blogs = [
  {
    slug: "how-we-choose-editors-picks",
    title: "How we choose an Editor's Pick",
    dek: "The four questions our editors ask before a story gets the seal.",
    date: "14 Jul 2026",
    readingTime: 5,
    tag: "Inside tossatale",
    cover: covers.desk,
  },
  {
    slug: "writing-a-serial-without-losing-readers",
    title: "Writing a serial without losing your readers",
    dek: "Pacing, recaps, and the art of the honest cliffhanger.",
    date: "08 Jul 2026",
    readingTime: 7,
    tag: "Craft",
    cover: covers.bookshop,
  },
  {
    slug: "reader-report-2026",
    title: "The 2026 Reader Report",
    dek: "What 340,000 readers finished, abandoned, and returned to twice.",
    date: "01 Jul 2026",
    readingTime: 9,
    tag: "Research",
    cover: covers.terrace,
  },
  {
    slug: "paying-writers-properly",
    title: "Paying writers properly, explained plainly",
    dek: "Where the money comes from and where it goes.",
    date: "23 Jun 2026",
    readingTime: 6,
    tag: "Inside tossatale",
    cover: covers.platform,
  },
];

export const videos = [
  {
    slug: "meera-on-writing-family",
    title: "Meera Raghavan on writing about family",
    duration: "12:40",
    views: "41.2k",
    series: "In the Room",
    cover: covers.lane,
  },
  {
    slug: "harbour-film",
    title: "Harbour, 4AM — a short documentary",
    duration: "08:15",
    views: "27.9k",
    series: "Field Notes",
    cover: covers.boat,
  },
  {
    slug: "bookshop-of-endings",
    title: "The bookshop that sells only endings",
    duration: "06:02",
    views: "33.5k",
    series: "Field Notes",
    cover: covers.bookshop,
  },
  {
    slug: "desk-tour-ila",
    title: "Ila's desk, drawer by drawer",
    duration: "09:48",
    views: "19.4k",
    series: "In the Room",
    cover: covers.desk,
  },
];

export const platformStats = [
  { value: "12,480", label: "Stories published" },
  { value: "3,120", label: "Writers publishing" },
  { value: "1.4M", label: "Hours read this year" },
  { value: "86%", label: "Finish what they start" },
];

export type SiteContactSettings = {
  supportEmail: string;
  pitchesEmail: string;
  pressEmail: string;
  phone: string;
  address: string;
  workingHours: string;
  formHeadline: string;
  formSubtitle: string;
  autoReplyMessage: string;
  inboxNotificationEmail: string;
  enablePublicForm: boolean;
};

export type SiteFooterSettings = {
  aboutText: string;
  tagline: string;
  copyrightText: string;
  subnoteText: string;
};

export const defaultContactSettings: SiteContactSettings = {
  supportEmail: "members@tossatale.com",
  pitchesEmail: "pitches@tossatale.com",
  pressEmail: "press@tossatale.com",
  phone: "+91 (080) 4123-8901",
  address: "24 Riverfront Lane, Old City, Varanasi, UP — 221001",
  workingHours: "Mon – Fri, 9:00 AM – 6:00 PM IST",
  formHeadline: "Write to us. We write back.",
  formSubtitle: "Four editors read this inbox. Expect a reply within two working days.",
  autoReplyMessage: "Thank you for reaching out to tossatale. An editor will review your note within 48 hours.",
  inboxNotificationEmail: "desk-notifications@tossatale.com",
  enablePublicForm: true,
};

export const defaultFooterSettings: SiteFooterSettings = {
  aboutText: "A home for longform stories, serials and quiet films — made by writers who take their time, for readers who like to linger.",
  tagline: "“Every life is a library.”",
  copyrightText: "© 2026 tossatale. Written by humans.",
  subnoteText: "Made with paper, ink and patience.",
};

export type AnnouncementSettings = {
  enabled: boolean;
  text: string;
  badgeText: string;
  linkText: string;
  linkTo: string;
};

export const defaultAnnouncementSettings: AnnouncementSettings = {
  enabled: false,
  badgeText: "NEW ANNOUNCEMENT",
  text: "tossatale Audio is now open for early access members — listen to stories read aloud by their authors.",
  linkText: "Learn more",
  linkTo: "/coming-soon",
};

export type FeaturedWritersSettings = {
  eyebrow: string;
  title: string;
  blurb: string;
  featuredSlugs: string[];
};

export const defaultFeaturedWritersSettings: FeaturedWritersSettings = {
  eyebrow: "The people behind the pages",
  title: "Featured writers",
  blurb: "Meet the curious writers, reporters, and memoirists publishing on tossatale.",
  featuredSlugs: ["meera-raghavan", "arjun-sethi", "ila-bhattacharya", "nadia-farouk", "kabir-menon", "tomas-vidal"],
};
