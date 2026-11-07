// Site copy of the new-member deal. The checkout (base44/functions/createStripeCheckout)
// is what really applies it (Stripe coupon ACTNOW50X3: 50% off, first 3 months).
// No end date, no countdown. To end the offer, change the checkout function first.
export const DEAL_TEXT = 'Special pricing for new members: 50% off your first 3 months. We may end or change this offer at any time.';
export const dealIsOn = () => true;
// Half price, rounded the way Stripe rounds a 50% coupon.
export const dealPrice = (price) => {
  const cents = Math.round(price * 100);
  return (cents - Math.round(cents / 2)) / 100;
};
export const fmtMoney = (n) => (Number.isInteger(n) ? n.toLocaleString() : n.toFixed(2));
