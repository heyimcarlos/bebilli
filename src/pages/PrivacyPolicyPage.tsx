import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import BilliLogo from '@/components/BilliLogo';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <BilliLogo size={32} />
          <h1 className="text-lg font-bold text-foreground">Privacy Policy</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <p className="text-sm text-muted-foreground">Last updated: February 21, 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">1. Introduction</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Billi ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile and web application.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">2. Information We Collect</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We collect information you provide directly when creating an account, including your name, email address, phone number, city, country, and preferred language and currency. We also collect usage data such as savings contributions, group memberships, streaks, and interaction patterns within the app.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">3. How We Use Your Information</h2>
          <ul className="text-sm text-muted-foreground leading-relaxed list-disc list-inside space-y-1.5">
            <li>To create and manage your account</li>
            <li>To provide gamified savings tracking and social features</li>
            <li>To display leaderboards, streaks, and badges within your groups</li>
            <li>To send notifications about your activity (with your consent)</li>
            <li>To improve and personalize your experience</li>
            <li>To communicate updates, offers, and partner promotions</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">4. Data Sharing & Visibility</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your public profile (name and avatar) is visible to members of the same groups and communities you belong to. Sensitive information such as your phone number, city, and country is never shared publicly. We do not sell your personal data to third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">5. Data Protection</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We take your privacy seriously and implement measures to protect your personal information. Your data is stored on reliable cloud infrastructure with access controls in place.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">6. Cookies & Analytics</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use essential cookies to maintain your session and preferences (language, currency, theme). We may use anonymized analytics to understand usage patterns and improve the platform. No third-party advertising trackers are used.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">7. Your Rights</h2>
          <ul className="text-sm text-muted-foreground leading-relaxed list-disc list-inside space-y-1.5">
            <li>Access, correct, or delete your personal data at any time</li>
            <li>Withdraw consent for notifications</li>
            <li>Request a copy of all your stored data</li>
            <li>Delete your account and all associated data</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">8. Children's Privacy</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Billi is not intended for use by children under 13 years of age. We do not knowingly collect personal information from children.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">9. Changes to This Policy</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of significant changes through the app or via email. Your continued use of Billi after changes constitutes acceptance.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">10. Contact Us</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you have questions about this Privacy Policy or your data, please contact us through the in-app support feature or email us at privacy@bebilli.com.
          </p>
        </section>

        <div className="pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Billi. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
