'use client';

import Image from "next/image";
import styles from "./navbar.module.css"
import Link from "next/link";
import SignIn from "./sign-in";
import Upload from "./upload";
import { onAuthStateChangedHelper } from "../utilities/firebase/firebase";
import { useEffect, useState} from "react";
import { User } from "firebase/auth";

function NavBar() {
    const [user, setUser] = useState<User | null>(null);
    
    useEffect(() => {
        const unsubscribe = onAuthStateChangedHelper((user) => {
            setUser(user);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return (
        <nav className={styles.nav}>
            <Link href="/">
                <span className={styles.logoContainer}>
                    <Image width={100} height={18}
                    src="/RetroTube-logo.svg" alt="RetroTube logo" priority={true} />
                </span>
            </Link>
            <div className={styles.filler}/>
            { user && <Upload /> }
            { user && <Image className={styles.profileImage} width={20} height={20} alt="profile picture" src={user?.photoURL ?? ""} /> }
            <SignIn user={user} />
        </nav>
    );
}

export default NavBar;