'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "../../../components/Dashboard.module.css"; // Adjust path if needed

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {session.user?.image ? (
          <img 
            src={session.user.image} 
            alt="Profile" 
            className={styles.avatar} 
          />
        ) : (
          <div className={styles.placeholderAvatar}>
            {session.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
          </div>
        )}

        <h1 className={styles.welcome}>Welcome, {session.user?.name || "User"}!</h1>
        <p className={styles.email}>{session.user?.email}</p>

        <div className={styles.infoBox}>
          <p className={styles.infoTitle}>Account Status: Active</p>
          <p>You have successfully logged in via {session.user?.image?.includes('google') ? 'Google' : 'Credentials/WeChat'}.</p>
          <p style={{marginTop: '10px', fontSize: '0.9rem', color: '#64748b'}}>
            This is a protected dashboard page visible only to authenticated users.
          </p>
        </div>

        <button onClick={() => signOut({ callbackUrl: '/' })} className={styles.signOutBtn}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
