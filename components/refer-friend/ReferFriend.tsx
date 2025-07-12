'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
// Add this with your other imports

import { 
  Send, 
  Copy,
  Check,
  Loader2,
  
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import PageSkeleton from '../PageSkeleton';
import { ReferralStats } from '@/types/client/refer-friend';


async function fetchReferralStats(): Promise<ReferralStats> {
  try {
    const response = await axios.get('/api/refer-friend');
    console.log('response=',response);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch referral stats');
    }
    throw new Error('Failed to fetch referral stats');
  }
}

async function sendEmailInvitation(email: string) {
  try {
    const response = await axios.post('/api/refer-friend', { email });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to send invitation');
    }
    throw new Error('Failed to send invitation');
  }
}

export default function ReferFriendPage() {
  const [email, setEmail] = useState('');
  const [isCopied, setIsCopied] = useState<{ code: boolean; link: boolean }>({ code: false, link: false });

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['referral-stats'],
    queryFn: fetchReferralStats,
  });

  const sendEmailMutation = useMutation({
    mutationFn: sendEmailInvitation,
    onSuccess: () => {
      toast.success('Invitation sent successfully!');
      setEmail('');
      refetch(); // Refresh stats after successful referral
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const referralUrl = stats ? `${window.location.origin}/signup?ref=${stats.referralCode}` : '';
  // const linkedinReferralUrl = stats ? `${window.location.origin}/signup?ref=${stats.referralCode}&from=linkedin` : '';
 
  
  const handleCopy = (type: 'code' | 'link') => {
    const textToCopy = type === 'code' ? stats?.referralCode : referralUrl;

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setIsCopied({ ...isCopied, [type]: true });
      toast.success(`${type === 'code' ? 'Referral code' : 'Referral link'} copied!`);
      setTimeout(() => setIsCopied({ ...isCopied, [type]: false }), 2000);
    }
  };

  const handleShare = (platform: string) => {
    const shareText = `Join this awesome platform using my referral link 👇\n${referralUrl}`;
    
    const platforms = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(shareText)}`,
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      // linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`,
      // linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(linkedinReferralUrl)}`,

    };

    window.open(platforms[platform as keyof typeof platforms]);
  };

  const handleEmailReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    sendEmailMutation.mutate(email);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{(error as Error)?.message}</p>
          <Button onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <PageSkeleton type="refer-friend" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Refer a Friend</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Referrals</p>
                <p className="text-2xl font-bold">{stats?.totalReferrals || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Rewards</p>
                <p className="text-2xl font-bold">{stats?.totalRewards || 0} JP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {stats?.referralCode}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy('code')}
                className="flex items-center space-x-2"
              >
                {isCopied.code ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{isCopied.code ? 'Copied!' : 'Copy Code'}</span>
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                value={referralUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy('link')}
                className="flex items-center space-x-2"
              >
                {isCopied.link ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{isCopied.link ? 'Copied!' : 'Copy Link'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>


         <Card>
          <CardHeader>
            <CardTitle>Share Via</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                onClick={() => handleShare('whatsapp')}
                className="flex items-center space-x-2 bg-[#25D366] hover:bg-[#25D366]/90 text-white"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Share on WhatsApp</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('telegram')}
                className="flex items-center space-x-2 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.563 8.994l-1.83 8.59c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.566-4.458c.534-.196 1.006.128.832.941z"/>
                </svg>
                <span>Share on Telegram</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('x')}
                className="flex items-center space-x-2 bg-black hover:bg-black/90 text-white"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>Share on X</span>
              </Button>
            </div>
          </CardContent>
        </Card> 






        <Card>
          <CardHeader>
            <CardTitle>Invite via Email</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailReferral}>
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="mt-4" disabled={sendEmailMutation.isPending}>
                {sendEmailMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
                Send Invitation
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
