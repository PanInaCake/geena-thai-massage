import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const PRICE_TABLE: Record<string, Record<number, number>> = {
  thai: { 30: 6000, 60: 10000 },
  swedish: { 30: 5000, 60: 9000 }
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { service, duration } = req.body;

  const amount = PRICE_TABLE?.[service]?.[duration];
  if (!amount) {
    return res.status(400).json({ error: 'Invalid selection' });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${service} massage - ${duration} min`
          },
          unit_amount: amount
        },
        quantity: 1
      }
    ],
    success_url: 'https://yourdomain.com/success',
    cancel_url: 'https://yourdomain.com/cancel'
  });

  res.status(200).json({ url: session.url });
}
