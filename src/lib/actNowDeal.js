// Site copy of the act-now deal (the checkout's copy in
// base44/functions/createStripeCheckout is what charges). No end date is shown;
// DEAL_ENDS_AT is a hidden backstop.
export const DEAL_ENDS_AT = Date.parse('2026-11-16T05:59:59Z');
export const dealIsOn = () => Date.now() <= DEAL_ENDS_AT;
// Half price, rounded the way Stripe rounds a 50% coupon.
export const dealPrice = (price) => {
  const cents = Math.round(price * 100);
  return (cents - Math.round(cents / 2)) / 100;
};
export const fmtMoney = (n) => (Number.isInteger(n) ? n.toLocaleString() : n.toFixed(2));
