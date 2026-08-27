import Link from 'next/link';
import { Cloud, Shield, Heart } from 'lucide-react';
import styles from './home.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.iconWrapper}>
          <Cloud size={72} color="#ff8fab" strokeWidth={1.5} />
        </div>
        
        <h1 className={styles.title}>Secure File Storage</h1>
        
        <p className={styles.subtitle}>
          Upload, manage, and share your files safely in the cloud.
        </p>
        
        <div className={styles.features}>
          <div className={styles.featureItem}>
            <Shield size={20} />
            <span>Private</span>
          </div>
          <div className={styles.featureItem}>
            <Heart size={20} />
            <span>Friendly</span>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <Link href="/login" className={styles.loginBtn}>
            Sign In
          </Link>
          <Link href="/register" className={styles.registerBtn}>
            Create an Account
          </Link>
        </div>
      </main>
    </div>
  );
}