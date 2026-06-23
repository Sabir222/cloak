'use client';

import { ChevronRight } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

type FaqItem = {
  q: string;
  a: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <Accordion
      className="flex w-full flex-col"
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      variants={{
        expanded: { opacity: 1, scale: 1 },
        collapsed: { opacity: 0, scale: 0.7 },
      }}
    >
      {items.map((item, i) => (
        <AccordionItem
          key={i}
          value={`faq-${i}`}
          className="py-2 border-b border-gray-200 last:border-b-0"
        >
          <AccordionTrigger className="w-full py-3 text-left text-gray-900">
            <div className="flex items-center">
              <ChevronRight className="h-4 w-4 text-orange-500 transition-transform duration-200 group-data-expanded:rotate-90" />
              <div className="ml-2 font-medium text-gray-900">
                {item.q}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="origin-left">
            <p className="pl-6 pr-2 text-gray-500 text-sm leading-relaxed">
              {item.a}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}