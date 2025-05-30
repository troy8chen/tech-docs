'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getActiveDomains } from '@/lib/config';

interface DomainSelectorProps {
  selectedDomain: string;
  onDomainChange: (domain: string) => void;
  className?: string;
}

export function DomainSelector({ selectedDomain, onDomainChange, className }: DomainSelectorProps) {
  const activeDomains = getActiveDomains();
  const selectedDomainConfig = activeDomains[selectedDomain];

  return (
    <div className={className}>
      <Select value={selectedDomain} onValueChange={onDomainChange}>
        <SelectTrigger className="w-full">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{selectedDomainConfig?.icon || '📚'}</span>
              <span className="font-medium">{selectedDomainConfig?.name || 'Unknown Domain'}</span>
              <Badge variant="secondary" className="text-xs">
                {Object.keys(activeDomains).length} domains
              </Badge>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(activeDomains).map(([key, domain]) => (
            <SelectItem key={key} value={key}>
              <div className="flex items-center gap-2">
                <span>{domain.icon || '📚'}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{domain.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {domain.description || `Namespace: ${domain.namespace}`}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 