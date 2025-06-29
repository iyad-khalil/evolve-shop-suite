
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { record } = await req.json()
    console.log('Processing order:', record.id)

    // Récupérer les détails de la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', record.id)
      .single()

    if (orderError) {
      console.error('Error fetching order:', orderError)
      throw orderError
    }

    console.log('Order details:', order)

    // Récupérer les détails des produits pour obtenir les vendor_id
    const productIds = order.items.map((item: any) => item.productId)
    console.log('Product IDs:', productIds)

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, vendor_id')
      .in('id', productIds)

    if (productsError) {
      console.error('Error fetching products:', productsError)
      throw productsError
    }

    console.log('Products with vendor_id:', products)

    // Créer un map des produits pour récupérer facilement les vendor_id
    const productVendorMap = new Map()
    products?.forEach(product => {
      productVendorMap.set(product.id, product.vendor_id)
    })

    // Grouper les items par vendeur en utilisant les vrais vendor_id
    const vendorGroups: { [vendorId: string]: any[] } = {}
    
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        const vendorId = productVendorMap.get(item.productId)
        console.log(`Item ${item.productName} -> Vendor ID: ${vendorId}`)
        
        if (vendorId) {
          if (!vendorGroups[vendorId]) {
            vendorGroups[vendorId] = []
          }
          vendorGroups[vendorId].push({
            ...item,
            vendor_id: vendorId // S'assurer que le vendor_id est présent
          })
        } else {
          console.warn(`No vendor_id found for product ${item.productId}`)
        }
      })
    }

    console.log('Vendor groups:', Object.keys(vendorGroups))

    // Créer les commandes vendeur
    const vendorOrdersToCreate = []
    
    for (const [vendorId, items] of Object.entries(vendorGroups)) {
      const subtotal = items.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
      }, 0)

      vendorOrdersToCreate.push({
        vendor_id: vendorId,
        order_id: order.id,
        items: items,
        subtotal: subtotal,
        status: 'pending'
      })
    }

    if (vendorOrdersToCreate.length > 0) {
      console.log('Creating vendor orders:', vendorOrdersToCreate.length)
      
      const { data: vendorOrders, error: vendorOrderError } = await supabase
        .from('vendor_orders')
        .insert(vendorOrdersToCreate)
        .select()

      if (vendorOrderError) {
        console.error('Error creating vendor orders:', vendorOrderError)
        throw vendorOrderError
      }

      console.log('Vendor orders created successfully:', vendorOrders?.length)
      return new Response(
        JSON.stringify({ 
          success: true, 
          vendorOrdersCreated: vendorOrders?.length,
          vendorOrders: vendorOrders
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      console.log('No vendor orders to create - no valid vendor_id found')
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'No valid vendor_id found for products',
          vendorOrdersCreated: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

  } catch (error) {
    console.error('Error processing vendor orders:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
