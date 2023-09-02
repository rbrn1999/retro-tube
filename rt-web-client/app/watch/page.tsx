'use client';

import Video from '@/app/interfaces/Video';
import { redirect, useSearchParams } from 'next/navigation'
import { getVideo } from '../utilities/firebase/functions';
import { useEffect, useState } from 'react';

export default function Watch() {
  const videoPrefix = 'https://storage.googleapis.com/retro-tube-processed-videos/';
  const videoId = useSearchParams().get('v');
  const [video, setVideo] = useState<Video | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(true)

  
  useEffect(() => {
    async function fetchVideo() {
      if (!videoId) {
        return;
      }
      try {
        const videoData = await getVideo(videoId);
        setVideo(videoData as Video);
      } catch (error) {
        console.error('Error fetching video:', error);
        setVideo(null)
        // Handle error as needed, e.g., set an error state
      } finally {
        setLoadingVideo(false);
      }
    }
    fetchVideo();
  }, [videoId]);
  const videoSrc = video?.filename ?? "";
  
  if (!videoId) {
    redirect('/');
  }
  if (loadingVideo) {
    return <h1> Loading... </h1>
  }
  if (!video) {
    return <h1>404 Not Found</h1>;
  }
  return (
    <main>
      <h1>{video.title}</h1>
      <video controls src={videoPrefix + videoSrc} />
      <h3> Description: </h3>
      <div> {video.description} </div>
    </main>
  );
}
