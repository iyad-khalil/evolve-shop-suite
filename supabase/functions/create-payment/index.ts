
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  orderId: string;
  currency: 'usd' | 'eur' | 'mad';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Créer le client Supabase avec la clé anon pour l'authentification
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Récupérer l'utilisateur authentifié
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    // Parse request body
    const { orderId, currency = 'usd' }: PaymentRequest = await req.json();

    if (!orderId) {
      throw new Error("Order ID is required");
    }

    // Récupérer les détails de la commande
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('customer_id', user.id)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    // Initialiser Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Vérifier si un client Stripe existe déjà
    const customers = await stripe.customers.list({ 
      email: user.email!, 
      limit: 1 
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Convertir le montant selon la devise
    const baseAmount = Number(order.total_amount);
    let amount = baseAmount;
    
    // Taux de change approximatifs (vous pourrez les ajuster ou utiliser une API de taux)
    const exchangeRates = {
      usd: 1,
      eur: 0.85,
      mad: 10.5
    };

    amount = Math.round(baseAmount * exchangeRates[currency]);

    // Créer les line items à partir des items de la commande
    const lineItems = (order.items as any[]).map(item => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.productName,
          images: item.productImage ? [item.productImage] : [],
        },
        unit_amount: Math.round((item.price * exchangeRates[currency]) * 100), // Stripe utilise les centimes
      },
      quantity: item.quantity,
    }));

    // Créer la session de paiement
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email!,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/order-confirmation/${orderId}?payment=success`,
      cancel_url: `${req.headers.get("origin")}/checkout?payment=cancelled`,
      metadata: {
        orderId: orderId,
        userId: user.id
      }
    });

    // Mettre à jour la commande avec l'ID de session Stripe
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    await supabaseService
      .from('orders')
      .update({ 
        status: 'payment_pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Payment creation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
