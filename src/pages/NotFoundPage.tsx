import { MapPinOff } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/page-heading';
import { EmptyState } from '@/components/ui/empty-state';

export default function NotFoundPage() {
  return (
    <Card>
      <EmptyState
        icon={MapPinOff}
        title="This page doesn’t exist"
        description="The address may have changed. Everything at Hodo Souk is a step away."
        className="py-24"
        action={
          <ButtonLink href="/" size="xl">
            Go to the home page
          </ButtonLink>
        }
      />
      <h1 className="sr-only">Page not found</h1>
    </Card>
  );
}
