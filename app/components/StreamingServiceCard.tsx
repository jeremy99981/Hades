'use client';

import Image from 'next/image';
import Link from 'next/link';

interface StreamingServiceCardProps {
  name: string;
  logo: string;
  gradientFrom: string;
  gradientTo: string;
  providerId: number;
  featuredShowImage: string;
  featuredShowTitle: string;
}

const StreamingServiceCard = ({
  name,
  logo,
  providerId,
  featuredShowImage,
  featuredShowTitle,
}: StreamingServiceCardProps) => {
  return (
    <Link href={`/provider/${providerId}`} className="block">
      <div className="relative w-full h-[200px] rounded-2xl overflow-hidden group cursor-pointer">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <Image
            src={featuredShowImage}
            alt={featuredShowTitle}
            fill
            className="object-cover"
          />
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent"
          />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-8">
          {/* Logo */}
          <div className="w-36 h-10 bg-black/30 backdrop-blur-sm rounded-lg p-2 flex items-center justify-center">
            <Image 
              src={logo} 
              alt={name} 
              width={120}
              height={32}
              className={`object-contain brightness-0 invert ${
                name === 'Netflix' || name === 'Apple TV+' 
                  ? 'max-w-[100px] h-6'
                  : 'max-w-[120px] h-8'
              }`}
              style={{ objectFit: 'contain', objectPosition: 'center' }}
            />
          </div>
          
          {/* Text Content */}
          <div className="space-y-3">
            <div className="inline-flex items-center">
              <span className="text-xs font-medium text-white/90 tracking-wider uppercase px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm">
                Série Tendance
              </span>
            </div>
            
            <h3 className="text-2xl font-medium text-white tracking-wide" style={{
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
            }}>
              {featuredShowTitle}
            </h3>
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </Link>
  );
};

export default StreamingServiceCard;
