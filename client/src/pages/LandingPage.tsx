import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to TaskFlow</h1>
      <p className={styles.subtitle}>
        The collaborative, real-time project management tool designed to keep your team in sync.
        Organize tasks, manage projects, and boost productivity.
      </p>
      <div className={styles.buttonContainer}>
        <Link to="/login" className={styles.ctaButton}>
          Get Started
        </Link>
        <Link to="/register" className={styles.secondaryButton}>
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;