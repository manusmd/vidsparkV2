"use client";

import React from 'react';
import { VideoTemplate } from '@/app/types';
import { useContentTypes } from "@/hooks/data/useContentTypes";
import { useImageTypes } from "@/hooks/data/useImageTypes";
import { useVoices } from "@/hooks/data/useVoices";
import { CheckCircle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface TemplateInfoBannerProps {
  template: VideoTemplate;
}

export default function TemplateInfoBanner({ template }: TemplateInfoBannerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { contentTypes } = useContentTypes();
  const { imageTypes } = useImageTypes();
  const { voices } = useVoices();

  const contentType = contentTypes.find(ct => ct.id === template.contentTypeId);
  const imageType = imageTypes.find(it => it.id === template.imageStyleId);
  const voice = voices.find(v => v.id === template.voiceId);

  const clearTemplate = () => {
    // Remove template from URL and reload
    const currentPath = window.location.pathname;
    router.push(currentPath);
  };

  return (
    <div className="w-full p-4 bg-primary/10 rounded-lg mb-6 relative">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-lg">Using Template: {template.name}</h3>
              <Badge variant="outline" className="ml-2 font-normal">Template</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              This template includes pre-configured settings for your video.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 mt-3">
              {contentType && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Content Type:</span>{' '}
                  <span className="font-medium">{contentType.title}</span>
                </div>
              )}
              
              {imageType && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Image Style:</span>{' '}
                  <span className="font-medium">{imageType.title}</span>
                </div>
              )}
              
              {voice && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Voice:</span>{' '}
                  <span className="font-medium">{voice.name}</span>
                </div>
              )}
              
              <div className="text-sm">
                <span className="text-muted-foreground">Text Position:</span>{' '}
                <span className="font-medium capitalize">{template.textPosition}</span>
              </div>
              
              <div className="text-sm">
                <span className="text-muted-foreground">Show Title:</span>{' '}
                <span className="font-medium">{template.showTitle ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full absolute top-3 right-3"
          onClick={clearTemplate}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear template</span>
        </Button>
      </div>
    </div>
  );
} 