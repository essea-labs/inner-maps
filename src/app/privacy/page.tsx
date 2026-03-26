import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Inner Maps',
  description: 'How Inner Maps collects, uses, and protects your personal information.',
};

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <Link href="/quiz" className="legal-back">← Back</Link>
      <h1>Privacy Policy</h1>
      <p className="legal-updated">Last updated: March 26, 2025</p>

      <p>
        Inner Maps (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the Inner Maps personality
        quiz application. This Privacy Policy explains how we collect, use, and protect your
        information when you use our service.
      </p>

      <h2>Information We Collect</h2>

      <h3>Account Information</h3>
      <p>
        When you create an account, we collect your email address and, if you sign in with Google,
        basic profile information provided by Google (name and email). We use Supabase for
        authentication and data storage.
      </p>

      <h3>Quiz Data</h3>
      <p>
        We collect your quiz responses and the personality results derived from them, including your
        cognitive type, attachment style, connection style, enneagram type, and star sign. We also
        collect the name and birthday you provide during the quiz.
      </p>

      <h3>Payment Information</h3>
      <p>
        If you purchase a premium report, payment is processed by Stripe. We do not store your
        credit card number or full payment details on our servers. Stripe&apos;s privacy policy
        governs the handling of your payment information.
      </p>

      <h3>Usage Data</h3>
      <p>
        We may collect basic usage data such as pages visited and features used to improve
        the service.
      </p>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To generate and display your personality profile</li>
        <li>To calculate compatibility scores with your connections</li>
        <li>To save your results so you can access them later</li>
        <li>To process payments for premium reports</li>
        <li>To send you emails only if you explicitly opt in</li>
        <li>To improve and maintain the service</li>
      </ul>

      <h2>Data Sharing</h2>
      <p>
        We do not sell, rent, or trade your personal information to third parties. We share data
        only with:
      </p>
      <ul>
        <li><strong>Supabase</strong> — for authentication and data storage</li>
        <li><strong>Stripe</strong> — for payment processing</li>
        <li><strong>Your connections</strong> — when you invite someone and they complete the quiz,
          both parties can see compatibility results based on shared profile data</li>
      </ul>

      <h2>Cookies &amp; Local Storage</h2>
      <p>
        We use browser cookies and local/session storage to maintain your login session, remember
        quiz progress, and store invite codes. We do not use third-party tracking cookies.
      </p>

      <h2>Data Retention</h2>
      <p>
        Your account data and quiz results are retained as long as your account is active. You may
        request deletion of your account and associated data at any time by contacting us.
      </p>

      <h2>Data Security</h2>
      <p>
        We use industry-standard security measures including encrypted connections (HTTPS) and
        secure authentication through Supabase. However, no method of transmission over the
        internet is 100% secure.
      </p>

      <h2>Children&apos;s Privacy</h2>
      <p>
        Inner Maps is not intended for children under 13. We do not knowingly collect personal
        information from children under 13.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of significant
        changes by posting the new policy on this page with an updated date.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy or want to request data deletion, please
        contact us at <a href="mailto:ask@innermaps.io">ask@innermaps.io</a>.
      </p>
    </div>
  );
}
