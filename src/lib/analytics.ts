import { getPostHog } from './posthog';

function track(event: string, properties?: Record<string, unknown>) {
  getPostHog()?.capture(event, properties);
}

export const analytics = {
  // --- Identity ---
  identify(userId: string, traits?: Record<string, string>) {
    getPostHog()?.identify(userId, traits);
  },
  reset() {
    getPostHog()?.reset();
  },

  // --- Core Funnel ---
  quizStarted() {
    track('quiz_started');
  },
  nameEntered() {
    track('name_entered');
  },
  birthdayEntered(starSign: string) {
    track('birthday_entered', { star_sign: starSign });
  },
  sectionCompleted(sectionName: string, sectionNumber: number) {
    track('section_completed', { section_name: sectionName, section_number: sectionNumber });
  },
  quizCompleted() {
    track('quiz_completed');
  },
  miniRevealViewed(sectionName: string, resultValue: string) {
    track('mini_reveal_viewed', { section_name: sectionName, result_value: resultValue });
  },
  miniRevealContinued() {
    track('mini_reveal_continued');
  },
  resultsViewed(dimensions: {
    cognitive_type: string;
    attachment_style: string;
    connection_style: string;
    enneagram_type: string;
    star_sign: string;
  }) {
    track('results_viewed', dimensions);
  },

  // --- Auth ---
  signupStarted(intent: string) {
    track('signup_started', { intent });
  },
  signupCompleted(intent: string) {
    track('signup_completed', { intent });
  },
  signupSkipped(intent: string) {
    track('signup_skipped', { intent });
  },
  loginCompleted() {
    track('login_completed');
  },
  passwordResetRequested() {
    track('password_reset_requested');
  },
  passwordResetCompleted() {
    track('password_reset_completed');
  },

  // --- Engagement ---
  profileCardDownloaded() {
    track('profile_card_downloaded');
  },
  inviteModalOpened() {
    track('invite_modal_opened');
  },
  inviteLinkCreated() {
    track('invite_link_created');
  },
  inviteLinkCopied() {
    track('invite_link_copied');
  },
  inviteLinkShared() {
    track('invite_link_shared');
  },
  connectionViewed() {
    track('connection_viewed');
  },
  compatibilityViewed(score: number, connectionName: string) {
    track('compatibility_viewed', { score, connection_name: connectionName });
  },
  compatibilityCardDownloaded() {
    track('compatibility_card_downloaded');
  },

  // --- Revenue ---
  checkoutStarted(productType: string, price: number) {
    track('checkout_started', { product_type: productType, price });
  },
  checkoutCompleted(productType: string, price: number) {
    track('checkout_completed', { product_type: productType, price });
  },
  individualReportViewed() {
    track('individual_report_viewed');
  },
  compatibilityReportViewed() {
    track('compatibility_report_viewed');
  },
  reportPdfDownloaded(reportType: 'individual' | 'compatibility') {
    track('report_pdf_downloaded', { report_type: reportType });
  },
  upsellClicked(productType: string, source: string) {
    track('upsell_clicked', { product_type: productType, source });
  },

  // --- Navigation ---
  tabChanged(tab: string) {
    track('tab_changed', { tab });
  },
  inviteLandingViewed(inviterCode: string) {
    track('invite_landing_viewed', { inviter_code: inviterCode });
  },
};
