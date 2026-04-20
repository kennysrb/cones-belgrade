const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const HOCKEY_IMAGES = {
  hero: u("1580748141549-71748dbe0bdc"),
  gallery: [
    u("1580748141549-71748dbe0bdc"),
    u("1547099882-93ab62c0b459"),
    u("1604580864964-0462f5d5b1a8"),
    u("1518310383802-640c2de311b2"),
    u("1571019613454-1cb2f99b2d8b"),
  ],
  articles: [
    u("1547058759-1e37e41bbb1b"),
    u("1519861531473-4dcba7d89952", 800),
    u("1504450758481-7338efa44de7", 800),
  ],
  events: [
    u("1572204059-d745b1ee5e8e", 800),
    u("1559087867-ce105cef3dc1", 800),
    u("1546519638-68e109498ffc", 800),
  ],
};
