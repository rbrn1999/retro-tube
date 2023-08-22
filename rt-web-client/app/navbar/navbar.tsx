'use client';

import Image from "next/image";
import styles from "./navbar.module.css"
import Link from "next/link";
import SignIn from "./sign-in";
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
                    src="/RetroTube-logo.svg" alt="RetroTube logo"/>
                </span>
            </Link>
            { 
               user && <Upload />
            }
            <SignIn user={user} />
        </nav>
    );
}

export default NavBar;