'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Faq } from '@/types/client/faq';

const fetchFaqs = async (): Promise<Faq[]> => {
  const res = await axios.get('/api/admin/faq');
  return res.data;
};

const FaqClientComponent = () => {
  const { data: faqs, isLoading, isError } = useQuery({
    queryKey: ['faqs'],
    queryFn: fetchFaqs,
  });

  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setActiveFaq((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-900">
        Frequently Asked Questions
      </h1>

      {isLoading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-md" />
          ))}
        </div>
      )}

      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load FAQs. Please try again later.</AlertDescription>
        </Alert>
      )}

      {faqs && faqs?.length === 0 && (
        <p className="text-center text-muted-foreground">No FAQs available.</p>
      )}

      {faqs && faqs?.length > 0 && (
        <div className="space-y-4">
          {faqs?.map((faq) => {
            const isOpen = activeFaq === faq.id;
            return (
              <Card
                key={faq.id}
                className="transition-all duration-300 ease-in-out border border-muted bg-white shadow-sm hover:shadow-md"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex justify-between items-center p-4 text-left"
                >
                  <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="text-gray-500" />
                  ) : (
                    <ChevronDown className="text-gray-500" />
                  )}
                </button>
                <div
                  className={`px-4 overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-[300px] opacity-100 pb-4' : 'max-h-0 opacity-0'
                  }`}
                >
                  <CardContent className="p-0 text-gray-700 text-sm">
                    {/* {faq.answer} */}

                    <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: faq?.answer ?? "" }}
        >
      </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FaqClientComponent;


