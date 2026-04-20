import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "lvi63s3m",
  dataset: "production",
  apiVersion: "2024-10-01",
  useCdn: false,
  token: process.env.SANITY_TOKEN,
});

function block(sr, en) {
  return {
    sr: [{ _type: "block", _key: "b1", style: "normal", children: [{ _type: "span", _key: "s1", text: sr, marks: [] }], markDefs: [] }],
    en: [{ _type: "block", _key: "b1", style: "normal", children: [{ _type: "span", _key: "s1", text: en, marks: [] }], markDefs: [] }],
  };
}

const documents = [
  // Site Settings
  {
    _id: "siteSettings",
    _type: "siteSettings",
    title: { sr: "Cones Belgrade", en: "Cones Belgrade" },
    description: {
      sr: "Amaterski hokejaški klub iz Beograda. Igramo, treniramo i gradimo zajednicu od 2014. godine.",
      en: "Amateur ice hockey club from Belgrade. We play, train and build a community since 2014.",
    },
    stats: [
      { _key: "s1", value: "10+", label: { sr: "Godina kluba", en: "Years of club" } },
      { _key: "s2", value: "60+", label: { sr: "Aktivnih igrača", en: "Active players" } },
      { _key: "s3", value: "30+", label: { sr: "Turnira godišnje", en: "Tournaments per year" } },
    ],
  },

  // News Articles
  {
    _id: "news-1",
    _type: "newsArticle",
    title: { sr: "Cones Belgrade osvajaju turnir u Novom Sadu", en: "Cones Belgrade win tournament in Novi Sad" },
    slug: { current: "cones-belgrade-osvajaju-turnir-novi-sad" },
    category: "tournament",
    publishedAt: "2026-04-10T10:00:00Z",
    featured: true,
    excerpt: {
      sr: "Naš tim je ostvario sjajnu pobedu na prolećnom amaterskom turniru u Novom Sadu i doneo kući trofej.",
      en: "Our team achieved a great victory at the spring amateur tournament in Novi Sad and brought home the trophy.",
    },
    body: block(
      "Ekipa Cones Belgrade je odigrala izvanredne utakmice tokom celog vikenda. Nakon dramatičnog finala protiv domaćeg tima, odneli smo pobedu rezultatom 4:3 posle produžetaka. Ovo je naš četvrti trofej ove sezone i dokaz da naporno treniranje daje rezultate. Posebne pohvale idu golmanu Marku Nikoliću koji je odbranio penal u odlučujućem momentu.",
      "The Cones Belgrade squad played outstanding matches throughout the weekend. After a dramatic final against the home team, we claimed victory 4:3 after overtime. This is our fourth trophy this season and proof that hard training pays off. Special praise goes to goalkeeper Marko Nikolić who saved a penalty at the decisive moment."
    ),
  },
  {
    _id: "news-2",
    _type: "newsArticle",
    title: { sr: "Novi pojačanja u timu za sezonu 2026", en: "New additions to the team for the 2026 season" },
    slug: { current: "nova-pojacanja-sezona-2026" },
    category: "roster",
    publishedAt: "2026-03-25T09:00:00Z",
    featured: false,
    excerpt: {
      sr: "S ponosom najavljujemo da su trojica novih igrača potpisala za Cones Belgrade pred novu sezonu.",
      en: "We are proud to announce that three new players have signed for Cones Belgrade ahead of the new season.",
    },
    body: block(
      "Drago nam je da najavimo dolazak trojice novih igrača koji će pojačati naš roster u predstojećoj sezoni. Stefan Jovanović (napadač), Nikola Petrović (odbrambeni igrač) i Aleksandar Ilić (golman) prošli su probni trening i pokazali izuzetan nivo igre. Dobrodošli u porodicu Cones!",
      "We are happy to announce the arrival of three new players who will strengthen our roster in the upcoming season. Stefan Jovanović (forward), Nikola Petrović (defenseman) and Aleksandar Ilić (goaltender) completed their trial training and showed an exceptional level of play. Welcome to the Cones family!"
    ),
  },
  {
    _id: "news-3",
    _type: "newsArticle",
    title: { sr: "Humanitarni hokej meč za decu Beograda", en: "Charity hockey match for the children of Belgrade" },
    slug: { current: "humanitarni-hokej-mec-deca-beograda" },
    category: "community",
    publishedAt: "2026-03-01T12:00:00Z",
    featured: false,
    excerpt: {
      sr: "Cones Belgrade organizuje humanitarnu utakmicu čiji prihodi idu u korist dečje bolnice.",
      en: "Cones Belgrade organises a charity match with proceeds going to the children's hospital.",
    },
    body: block(
      "U okviru naše misije da budemo više od hokejaških kluba, organizujemo humanitarnu utakmicu 15. maja na Ledenom parku Pionir. Ulaz je slobodan, a dobrovoljni prilozi idu u fond za nabavku medicinske opreme za Univerzitetsku dečju kliniku Tiršova. Prijavite se i dođite da zajedno napravimo razliku!",
      "As part of our mission to be more than a hockey club, we are organising a charity match on May 15th at Pionir Ice Park. Entry is free and voluntary contributions go to the fund for medical equipment for the University Children's Clinic Tiršova. Sign up and come make a difference together!"
    ),
  },

  // Events
  {
    _id: "event-1",
    _type: "event",
    title: { sr: "Prolećni amaterski turnir — Beograd 2026", en: "Spring Amateur Tournament — Belgrade 2026" },
    startAt: "2026-05-17T09:00:00Z",
    endAt: "2026-05-18T20:00:00Z",
    kind: "tournament",
    venue: { sr: "Ledeni park Pionir", en: "Pionir Ice Park" },
    city: "Belgrade",
    isFeatured: true,
    description: {
      sr: "Godišnji prolećni turnir u amaterskom hokeju na ledu. Učestvuje osam timova iz Srbije i regiona. Slobodan ulaz za gledaoce.",
      en: "Annual spring amateur ice hockey tournament. Eight teams from Serbia and the region participate. Free entry for spectators.",
    },
  },
  {
    _id: "event-2",
    _type: "event",
    title: { sr: "Prijateljska utakmica: Cones vs. Beogradski Medvedi", en: "Friendly match: Cones vs. Belgrade Bears" },
    startAt: "2026-05-03T18:00:00Z",
    endAt: "2026-05-03T20:00:00Z",
    kind: "match",
    venue: { sr: "Ledeni park Pionir", en: "Pionir Ice Park" },
    city: "Belgrade",
    isFeatured: false,
    description: {
      sr: "Prijateljska utakmica protiv Beogradskih Medveda, jednog od najstarijih amaterskih hokej timova u Srbiji.",
      en: "Friendly match against the Belgrade Bears, one of the oldest amateur hockey teams in Serbia.",
    },
  },
  {
    _id: "event-3",
    _type: "event",
    title: { sr: "Letnji hokejaški kamp za početnike", en: "Summer hockey camp for beginners" },
    startAt: "2026-06-20T09:00:00Z",
    endAt: "2026-06-22T17:00:00Z",
    kind: "camp",
    venue: { sr: "Ledeni park Pionir", en: "Pionir Ice Park" },
    city: "Belgrade",
    isFeatured: false,
    description: {
      sr: "Trodnevni kamp za sve koji žele da nauče da igraju hokej. Iskusni instruktori, oprema obezbeđena za polaznike.",
      en: "Three-day camp for anyone who wants to learn to play hockey. Experienced instructors, equipment provided for participants.",
    },
  },

  // Practice Sessions
  {
    _id: "practice-1",
    _type: "practiceSession",
    dayOfWeek: "mon",
    startTime: "20:00",
    endTime: "22:00",
    venue: { sr: "Ledeni park Pionir", en: "Pionir Ice Park" },
    level: { sr: "Napredni", en: "Advanced" },
    notes: { sr: "Doneti sopstvenu opremu.", en: "Bring your own equipment." },
    order: 1,
  },
  {
    _id: "practice-2",
    _type: "practiceSession",
    dayOfWeek: "wed",
    startTime: "19:00",
    endTime: "21:00",
    venue: { sr: "Ledeni park Pionir", en: "Pionir Ice Park" },
    level: { sr: "Srednji nivo", en: "Intermediate" },
    notes: { sr: "Otvoreno za sve nivoe sa iskustvom.", en: "Open to all levels with some experience." },
    order: 2,
  },
  {
    _id: "practice-3",
    _type: "practiceSession",
    dayOfWeek: "sat",
    startTime: "10:00",
    endTime: "12:00",
    venue: { sr: "Ledeni park Pionir", en: "Pionir Ice Park" },
    level: { sr: "Početnici", en: "Beginners" },
    notes: { sr: "Oprema dostupna za iznajmljivanje na licu mesta.", en: "Equipment available for rental on site." },
    order: 3,
  },

  // Sponsors
  {
    _id: "sponsor-1",
    _type: "sponsor",
    name: "Jelen Pivo",
    url: "https://jelenpivo.rs",
    tier: "platinum",
    order: 1,
  },
  {
    _id: "sponsor-2",
    _type: "sponsor",
    name: "Banca Intesa",
    url: "https://bancaintesa.rs",
    tier: "gold",
    order: 2,
  },
  {
    _id: "sponsor-3",
    _type: "sponsor",
    name: "Sport Vision",
    url: "https://sportvision.rs",
    tier: "silver",
    order: 3,
  },
  {
    _id: "sponsor-4",
    _type: "sponsor",
    name: "Štark",
    url: "https://stark.rs",
    tier: "partner",
    order: 4,
  },
];

async function seed() {
  console.log("Creating documents...");
  for (const doc of documents) {
    await client.createOrReplace({ ...doc });
    console.log(`✓ ${doc._type}: ${doc._id}`);
  }

  console.log("\nPublishing documents...");
  for (const doc of documents) {
    try {
      await client.patch(doc._id).set({ _id: doc._id }).commit();
      console.log(`✓ published ${doc._id}`);
    } catch {}
  }

  console.log("\nDone! All content seeded and published.");
}

seed().catch(console.error);
