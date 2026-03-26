import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service — Inner Maps',
  description: 'Terms and conditions for using the Inner Maps personality quiz application.',
};

export default function TermsOfService() {
  return (
    <div className="legal-page">
      <Link href="/quiz" className="legal-back">← Back</Link>
      <h1>Terms of Service</h1>
      <p className="legal-updated">Last updated: March 26, 2025</p>

      <p>
        Welcome to Inner Maps. By accessing or using our application, you agree to be bound by
        these Terms of Service. If you do not agree, please do not use the service.
      </p>

      <h2>Nature of the Service</h2>
      <p>
        Inner Maps is a personality discovery and relationship compatibility tool designed for
        entertainment and self-reflection purposes only. Our quizzes and results are{' '}
        <strong>not clinical assessments</strong> and should not be used as a substitute for
        professional psychological, medical, or therapeutic advice.
      </p>
      <p>
        Inner Maps is not affiliated with, endorsed by, or licensed by the Myers-Briggs Foundation,
        the Enneagram Institute, or any other personality assessment organization. The personality
        frameworks used (cognitive types, enneagram, attachment theory, love languages) are based on
        publicly available concepts.
      </p>

      <h2>Accounts</h2>
      <p>
        You may create an account using your email address or Google sign-in. You are responsible
        for maintaining the security of your account and password. You must be at least 16 years
        old to use Inner Maps or create an account.
      </p>

      <h2>Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the service for any unlawful purpose</li>
        <li>Attempt to access other users&apos; accounts or data without permission</li>
        <li>Interfere with or disrupt the service</li>
        <li>Scrape, copy, or redistribute our content or quiz questions</li>
        <li>Misrepresent your identity or create accounts on behalf of others without consent</li>
      </ul>

      <h2>Compatibility &amp; Connections</h2>
      <p>
        When you invite someone to take the quiz, both parties consent to sharing their personality
        profiles for the purpose of generating compatibility results. Either party can view the
        compatibility breakdown. You should only invite people you know and have a genuine
        relationship with.
      </p>

      <h2>Premium Content &amp; Payments</h2>
      <p>
        Certain features (deep-dive reports, compatibility reports) require a one-time purchase.
        Payments are processed securely through Stripe. All purchases are final — we do not offer
        refunds for digital content that has been delivered. If you experience a technical issue
        preventing access to purchased content, contact us and we will resolve it.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        All quiz questions, result descriptions, report content, design elements, and code are owned
        by Inner Maps and its creators. You may share your own results (e.g., profile cards) but
        may not reproduce or redistribute our quiz content, algorithms, or reports.
      </p>

      <h2>User Content</h2>
      <p>
        You retain ownership of any personal information you provide. By using the service, you
        grant us a limited license to use your quiz responses and profile data to operate the
        service (generate results, calculate compatibility, etc.).
      </p>

      <h2>Disclaimer of Warranties</h2>
      <p>
        The service is provided &quot;as is&quot; without warranties of any kind, express or
        implied. We do not guarantee the accuracy, completeness, or usefulness of any personality
        assessments or compatibility scores.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Inner Maps and its creators shall not be liable for
        any indirect, incidental, special, or consequential damages arising from your use of the
        service, including but not limited to decisions made based on quiz results.
      </p>

      <h2>Termination</h2>
      <p>
        We reserve the right to suspend or terminate your account at any time for violation of
        these terms. You may delete your account at any time by contacting us.
      </p>

      <h2>International Users (GDPR)</h2>
      <p>
        If you are located in the European Union or European Economic Area, your use of Inner Maps
        is subject to the General Data Protection Regulation (GDPR). We process your personal data
        based on your consent (when you create an account and take the quiz) and our legitimate
        interest in operating the service. You have the right to access, correct, delete, or port
        your data at any time. See our <Link href="/privacy">Privacy Policy</Link> for full details
        on your rights.
      </p>

      <h2>California Residents (CCPA)</h2>
      <p>
        If you are a California resident, you have additional rights under the California Consumer
        Privacy Act (CCPA), including the right to know what personal information we collect, the
        right to request deletion, and the right to opt out of the sale of your data. We do not
        sell your personal information. See our <Link href="/privacy">Privacy Policy</Link> for
        full details.
      </p>

      <h2>Governing Law</h2>
      <p>
        These Terms are governed by and construed in accordance with applicable law. Any disputes
        arising from your use of the service will be resolved in accordance with the laws of the
        jurisdiction where Inner Maps operates.
      </p>

      <h2>Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the service after changes
        constitutes acceptance of the new terms.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have questions about these Terms, please contact us
        at <a href="mailto:ask@innermaps.io">ask@innermaps.io</a>.
      </p>
    </div>
  );
}
