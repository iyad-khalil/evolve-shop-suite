
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

// Fonction pour valider et nettoyer les URLs d'images
function getValidImageUrl(imageUrl: string): string | undefined {
  if (!imageUrl) return undefined;
  
  // Si c'est une image base64 ou une URL trop longue, on l'ignore
  if (imageUrl.startsWith('data:') || imageUrl.length > 2000) {
    console.log('⚠️ Image URL too long or base64, skipping:', imageUrl.substring(0, 100) + '...');
    return undefined;
  }
  
  // Vérifier que c'est une URL valide
  try {
    new URL(imageUrl);
    return imageUrl;
  } catch {
    console.log('⚠️ Invalid image URL, skipping:', imageUrl);
    return undefined;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting payment creation...');

    // Créer le client Supabase avec la clé anon pour l'authentification
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Récupérer l'utilisateur authentifié
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error('❌ No authorization header');
      throw new Error("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError);
      throw new Error("User not authenticated");
    }

    console.log('✅ User authenticated:', user.email);

    // Parse request body
    const { orderId, currency = 'usd' }: PaymentRequest = await req.json();

    if (!orderId) {
      console.error('❌ No order ID provided');
      throw new Error("Order ID is required");
    }

    console.log('📦 Looking for order:', orderId);

    // Utiliser la service role key pour récupérer la commande (bypass RLS)
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Récupérer les détails de la commande
    const { data: order, error: orderError } = await supabaseService
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('customer_id', user.id)
      .single();

    if (orderError) {
      console.error('❌ Error fetching order:', orderError);
      throw new Error(`Order fetch error: ${orderError.message}`);
    }

    if (!order) {
      console.error('❌ Order not found for user:', user.id, 'order:', orderId);
      throw new Error("Order not found");
    }

    console.log('✅ Order found:', order.id);

    // Initialiser Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    console.log('💳 Initializing Stripe...');

    // Vérifier si un client Stripe existe déjà
    const customers = await stripe.customers.list({ 
      email: user.email!, 
      limit: 1 
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('✅ Existing Stripe customer found:', customerId);
    } else {
      console.log('📝 No existing Stripe customer');
    }

    // Convertir le montant selon la devise
    const baseAmount = Number(order.total_amount);
    let amount = baseAmount;
    
    // Taux de change approximatifs
    const exchangeRates = {
      usd: 1,
      eur: 0.85,
      mad: 10.5
    };

    amount = Math.round(baseAmount * exchangeRates[currency]);

    console.log('💰 Amount calculation:', { baseAmount, currency, finalAmount: amount });

    // Créer les line items à partir des items de la commande
    const lineItems = (order.items as any[]).map(item => {
      const validImageUrl = getValidImageUrl(item.productImage);
      
      return {
        price_data: {
          currency: currency,
          product_data: {
            name: item.productName,
            // Seulement inclure les images si elles sont valides
            ...(validImageUrl && { images: [validImageUrl] }),
          },
          unit_amount: Math.round((item.price * exchangeRates[currency]) * 100), // Stripe utilise les centimes
        },
        quantity: item.quantity,
      };
    });

    console.log('🛒 Line items created:', lineItems.length, 'items');

    // Créer la session de paiement
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email!,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/order-confirmation/${orderId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout?payment=cancelled`,
      metadata: {
        orderId: orderId,
        userId: user.id
      }
    });

    console.log('✅ Stripe session created:', session.id);

    // Mettre à jour la commande avec l'ID de session Stripe
    await supabaseService
      .from('orders')
      .update({ 
        status: 'payment_pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    console.log('✅ Order status updated to payment_pending');

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
    console.error('💥 Payment creation error:', error);
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
