// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import Stripe from 'https://esm.sh/stripe@14.25.0?target=deno';
import { corsHeaders } from '../_shared/cors.ts';

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })
  : null;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature) {
    console.error('Missing stripe-signature header');
    return new Response('Missing stripe-signature header', { status: 400, headers: corsHeaders });
  }

  if (!webhookSecret || !stripe) {
    console.error('Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET configuration');
    return new Response('Webhook Secret or Stripe Not Configured', { status: 500, headers: corsHeaders });
  }

  let event: Stripe.Event;

  try {
    const cryptoProvider = Stripe.createSubtleCryptoProvider();
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );
  } catch (err: any) {
    console.error(`Webhook Signature Verification Failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const intentId = paymentIntent.id;

        const { error } = await adminSupabase
          .from('orders')
          .update({
            status: 'succeeded',
            updated_at: new Date().toISOString(),
          })
          .eq('payment_intent_id', intentId);

        if (error) {
          console.error(`Failed to update order status to succeeded for intent ${intentId}:`, error);
          return new Response('Database Update Failed', { status: 500, headers: corsHeaders });
        }
        console.log(`Order status updated to succeeded for intent ${intentId}`);
        break;
      }

      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const intentId = paymentIntent.id;

        const { error } = await adminSupabase
          .from('orders')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('payment_intent_id', intentId);

        if (error) {
          console.error(`Failed to update order status to failed for intent ${intentId}:`, error);
          return new Response('Database Update Failed', { status: 500, headers: corsHeaders });
        }

        console.log(`Order status updated to failed for intent ${intentId}`);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const intentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;

        if (intentId) {
          const { error } = await adminSupabase
            .from('orders')
            .update({
              status: 'refunded',
              updated_at: new Date().toISOString(),
            })
            .eq('payment_intent_id', intentId);

          if (error) {
            console.error(`Failed to update order status to refunded for intent ${intentId}:`, error);
            return new Response('Database Update Failed', { status: 500, headers: corsHeaders });
          }
          console.log(`Order status updated to refunded for intent ${intentId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error(`Error processing webhook event ${event.type}:`, err);
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
  }
});
