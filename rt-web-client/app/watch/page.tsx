'use client';

import Video from '@/app/interfaces/Video';
import { redirect, useSearchParams } from 'next/navigation'
import { getVideo } from '../utilities/firebase/functions';
import { use } from "react";

export default function Watch() {
  const videoPrefix = 'https://storage.googleapis.com/retro-tube-processed-videos/';
  const videoId = useSearchParams().get('v');
  if (!videoId) {
    return redirect('/');
  }
  const video = use(getVideo(videoId)) as Video;
  const videoSrc = video?.filename ?? "";
  
  return (
    <div>
      <h1>Watch Page</h1>
      {
        video ? (
          <video controls src={videoPrefix + videoSrc} />
        )
        : 
        ( <h3>404 Not Found</h3> )
      }
    </div>
  );
}
