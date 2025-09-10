import Image from "next/image";
import styles from "./page.module.css";
import LandDealCalculator from "./calc";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <LandDealCalculator />
      </main>
    </div>
  );
}
