import Navbar from '@/components/common/Navbar';
import ClientCommunity from '@/components/community/ClientCommunity';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[#f3f9f8]">
      <Navbar />
      <ClientCommunity />
    </div>
  );
}
