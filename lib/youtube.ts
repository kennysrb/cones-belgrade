export interface PlaylistVideo {
  id: string;
  title: string;
  date: string;
}

export async function fetchPlaylistVideos(playlistId: string): Promise<PlaylistVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  const videos: PlaylistVideo[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("key", apiKey);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) break;

    const data = await res.json();
    for (const item of data.items ?? []) {
      const videoId = item.snippet?.resourceId?.videoId;
      const title = item.snippet?.title;
      const publishedAt: string = item.snippet?.publishedAt ?? "";
      if (videoId && title && title !== "Private video" && title !== "Deleted video") {
        videos.push({
          id: videoId,
          title,
          date: publishedAt ? new Date(publishedAt).getFullYear().toString() : "",
        });
      }
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return videos;
}
