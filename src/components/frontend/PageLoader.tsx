import { Droplet } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <Droplet className="w-16 h-16 text-[#2563eb] mx-auto animate-pulse" />
        </div>
        <div className="inline-block w-12 h-12 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-xl text-[#1a1f71]">Loading...</div>
      </div>
    </div>
  );
}
