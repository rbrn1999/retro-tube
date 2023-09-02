import Image from 'next/image';
import Link from 'next/link';
import { getVideos } from './utilities/firebase/functions';
import styles from './page.module.css';

export default async function Home() {
  const videos = await getVideos();
  const thumbnailPrefix = 'https://storage.googleapis.com/retro-tube-thumbnails/';
  
  return (
    <main className={styles.thumbnailContainer}>
      {
        videos.filter((video) => video.status === "processed").map((video) => (
          <div className={styles.thumbnail} key={video.id}>
            <Link href={`/watch?v=${video.id}`}>
                <Image
                src={video.thumbnail ? thumbnailPrefix+video.thumbnail:'/thumbnail.png'}
                alt='video' width={120} height={80} priority={true}
                />
                <h4>{video.title}</h4>
            </Link>
          </div>
        ))
      }
    </main>
  )
}

// set caching duration, if not set at all the getVideos may not be updated
export const revalidate = 30;