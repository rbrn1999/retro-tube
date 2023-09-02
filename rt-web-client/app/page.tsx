import Image from 'next/image';
import Link from 'next/link';
import { getVideos } from './utilities/firebase/functions';
import styles from './page.module.css';

export default async function Home() {
  const videos = await getVideos();
  return (
    <main className={styles.thumbnailContainer}>
      {
        videos.filter((video) => video.status === "processed").map((video) => (
          <div className={styles.thumbnail}>
            <Link href={`/watch?v=${video.id}`} key={video.id}>
                <Image src={'/thumbnail.png'} alt='video' width={120} height={80}/>
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