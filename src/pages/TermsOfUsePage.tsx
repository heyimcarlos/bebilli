import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import BilliLogo from '@/components/BilliLogo';

const TermsOfUsePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <BilliLogo size={32} />
          <h1 className="text-lg font-bold text-foreground">Terms of Use</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <p className="text-sm text-muted-foreground">Last updated: February 21, 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            By accessing or using Billi ("the App"), you agree to be bound by these Terms of Use. If you do not agree to these terms, you may not use the App.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">2. Description of Service</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Billi is a gamified social platform for tracking savings and building financial discipline. Billi is not a bank, financial institution, or payment processor. We do not hold, transfer, or manage any real money on behalf of users. All financial values displayed in the App are user-reported tracking entries only.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">3. User Accounts</h2>
          <ul className="text-sm text-muted-foreground leading-relaxed list-disc list-inside space-y-1.5">
            <li>You must be at least 13 years old to create an account</li>
            <li>You are responsible for maintaining the confidentiality of your login credentials</li>
            <li>You agree to provide accurate and complete information during registration</li>
            <li>One person may maintain only one account</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">4. Acceptable Use</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You agree not to use Billi to:
          </p>
          <ul className="text-sm text-muted-foreground leading-relaxed list-disc list-inside space-y-1.5">
            <li>Post offensive, abusive, or inappropriate content</li>
            <li>Harass, bully, or intimidate other users</li>
            <li>Attempt to gain unauthorized access to other accounts or systems</li>
            <li>Use automated bots or scripts to interact with the App</li>
            <li>Misrepresent your identity or affiliation</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">5. Groups and Communities</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Users may create and join savings groups and communities. Group creators are responsible for managing their group's content. Billi reserves the right to remove groups or content that violates these terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">6. Premium Subscription</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Billi offers optional paid Premium features. Subscriptions are billed according to the plan selected. You may cancel at any time. Refunds are handled in accordance with applicable laws and platform policies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">7. Intellectual Property</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All content, branding, design, and code within Billi are the intellectual property of Billi and its creators. You may not copy, modify, distribute, or reverse-engineer any part of the App without written permission.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">8. Disclaimer of Warranties</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Billi is provided "as is" without warranties of any kind. We do not guarantee uninterrupted access or error-free operation. Billi does not provide financial advice and should not be used as a substitute for professional financial guidance.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">9. Limitation of Liability</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To the maximum extent permitted by law, Billi shall not be liable for any indirect, incidental, or consequential damages arising from your use of the App.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">10. Termination</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We reserve the right to suspend or terminate your account at any time for violation of these terms. You may also delete your account at any time through the App settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">11. Changes to Terms</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We may update these Terms from time to time. Continued use of Billi after changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">12. Contact</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you have questions about these Terms, please contact us through the in-app support feature or email us at support@bebilli.com.
          </p>
        </section>

        <div className="pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Billi. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
};

export default TermsOfUsePage;
