const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function searchTrailer(title: string, year?: string) {
  const query = `${title} ${year || ''} bande annonce officielle`;
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      query
    )}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch YouTube data');
  }

  const data = await response.json();
  return data.items?.[0]?.id?.videoId;
}
