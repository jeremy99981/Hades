import { PROVIDER_IDS, clientApi } from './lib/tmdb';
import HomePage from './components/HomePage';

const streamingServicesConfig = [
  {
    name: 'Netflix',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1920px-Netflix_2015_logo.svg.png',
    gradientFrom: '#E50914',
    gradientTo: '#B20710',
    providerId: PROVIDER_IDS.netflix.provider,
    networkId: PROVIDER_IDS.netflix.network
  },
  {
    name: 'Prime Video',
    logo: 'https://m.media-amazon.com/images/G/01/digital/video/acquisition/web_footer_logo._CB462908456_.png',
    gradientFrom: '#00A8E1',
    gradientTo: '#005C7A',
    providerId: PROVIDER_IDS.prime.provider,
    networkId: PROVIDER_IDS.prime.network
  },
  {
    name: 'Disney+',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
    gradientFrom: '#0063E5',
    gradientTo: '#0E3766',
    providerId: PROVIDER_IDS.disney.provider,
    networkId: PROVIDER_IDS.disney.network
  },
  {
    name: 'Apple TV+',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg',
    gradientFrom: '#000000',
    gradientTo: '#2D2D2D',
    providerId: PROVIDER_IDS.apple.provider,
    networkId: PROVIDER_IDS.apple.network
  },
  {
    name: 'Hulu',
    logo: 'https://press.hulu.com/wp-content/uploads/2020/02/hulu-white.png',
    gradientFrom: '#1CE783',
    gradientTo: '#168B52',
    providerId: PROVIDER_IDS.hulu.provider,
    networkId: PROVIDER_IDS.hulu.network
  },
  {
    name: 'Paramount+',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Paramount_Plus.svg/1024px-Paramount_Plus.svg.png',
    gradientFrom: '#0064FF',
    gradientTo: '#003299',
    providerId: PROVIDER_IDS.paramount.provider,
    networkId: PROVIDER_IDS.paramount.network
  }
];

export default async function Page() {
  try {
    const [trendingMovies, trendingTVShows] = await Promise.all([
      clientApi.getTrending('movie'),
      clientApi.getTrending('tv')
    ]);

    // Vérifier si nous avons des résultats
    if (!trendingMovies.results?.length) {
      throw new Error('No trending movies available');
    }

    // Sélectionner un film aléatoire pour le héro
    const featuredMovie = trendingMovies.results[Math.floor(Math.random() * trendingMovies.results.length)];

    // Récupérer les détails du film en vedette (incluant les vidéos)
    const heroDetails = await clientApi.getDetails('movie', featuredMovie.id.toString());

    // Trouver la bande-annonce
    const trailer = heroDetails.videos?.results?.find(video => video.type === 'Trailer' && video.site === 'YouTube');

    // Récupérer les contenus par service de streaming
    const networkPromises = streamingServicesConfig.map(service => 
      clientApi.getTrendingByNetwork(service.networkId.toString())
    );
    
    const networkShows = await Promise.all(networkPromises);
    
    const streamingServicesWithShows = streamingServicesConfig.map((service, index) => ({
      ...service,
      trendingShow: networkShows[index]
    }));

    return (
      <HomePage
        trendingMovies={trendingMovies}
        trendingTVShows={trendingTVShows}
        featuredMovie={featuredMovie}
        trailer={trailer}
        streamingServicesWithShows={streamingServicesWithShows}
      />
    );
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-2xl font-bold mb-4">Une erreur est survenue</h1>
        <p>Impossible de charger le contenu. Veuillez réessayer plus tard.</p>
      </div>
    );
  }
}
