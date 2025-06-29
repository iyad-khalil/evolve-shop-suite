
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
    console.log('🚀 Starting process-vendor-orders function');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { record } = await req.json()
    console.log('📦 Processing order:', record.id)

    // Récupérer les détails de la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', record.id)
      .single()

    if (orderError) {
      console.error('❌ Error fetching order:', orderError)
      throw orderError
    }

    console.log('✅ Order details retrieved:', {
      orderId: order.id,
      itemsCount: order.items?.length || 0,
      customerName: order.customer_name
    })

    // Vérifier que les items existent
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      console.error('❌ No items found in order')
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'No items found in order',
          vendorOrdersCreated: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Récupérer les détails des produits pour obtenir les vendor_id
    const productIds = order.items.map((item: any) => item.productId)
    console.log('🔍 Looking for products:', productIds)

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, vendor_id, name')
      .in('id', productIds)

    if (productsError) {
      console.error('❌ Error fetching products:', productsError)
      throw productsError
    }

    console.log('📦 Products found:', products?.map(p => ({
      id: p.id,
      name: p.name,
      vendor_id: p.vendor_id
    })))

    if (!products || products.length === 0) {
      console.error('❌ No products found for the given IDs')
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'No products found',
          vendorOrdersCreated: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Créer un map des produits pour récupérer facilement les vendor_id
    const productVendorMap = new Map()
    products.forEach(product => {
      productVendorMap.set(product.id, product.vendor_id)
    })

    console.log('🗺️ Product-Vendor mapping:', Object.fromEntries(productVendorMap))

    // Grouper les items par vendeur
    const vendorGroups: { [vendorId: string]: any[] } = {}
    
    order.items.forEach((item: any) => {
      const vendorId = productVendorMap.get(item.productId)
      console.log(`📝 Item "${item.productName}" -> Vendor ID: ${vendorId}`)
      
      if (vendorId) {
        if (!vendorGroups[vendorId]) {
          vendorGroups[vendorId] = []
        }
        vendorGroups[vendorId].push({
          ...item,
          vendor_id: vendorId
        })
      } else {
        console.warn(`⚠️ No vendor_id found for product ${item.productId} (${item.productName})`)
      }
    })

    const vendorCount = Object.keys(vendorGroups).length
    console.log(`👥 Found ${vendorCount} unique vendors:`, Object.keys(vendorGroups))

    if (vendorCount === 0) {
      console.error('❌ No valid vendor groups created')
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

    // Créer les commandes vendeur
    const vendorOrdersToCreate = []
    
    for (const [vendorId, items] of Object.entries(vendorGroups)) {
      const subtotal = items.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
      }, 0)

      const vendorOrder = {
        vendor_id: vendorId,
        order_id: order.id,
        items: items,
        subtotal: subtotal,
        status: 'pending'
      }

      vendorOrdersToCreate.push(vendorOrder)
      console.log(`📋 Creating vendor order for ${vendorId}:`, {
        itemsCount: items.length,
        subtotal: subtotal
      })
    }

    console.log(`💾 Inserting ${vendorOrdersToCreate.length} vendor orders...`)
    
    const { data: vendorOrders, error: vendorOrderError } = await supabase
      .from('vendor_orders')
      .insert(vendorOrdersToCreate)
      .select()

    if (vendorOrderError) {
      console.error('❌ Error creating vendor orders:', vendorOrderError)
      console.error('❌ Detailed error:', JSON.stringify(vendorOrderError, null, 2))
      throw vendorOrderError
    }

    console.log('✅ Vendor orders created successfully:', vendorOrders?.length)
    console.log('📊 Created orders details:', vendorOrders?.map(vo => ({
      id: vo.id,
      vendor_id: vo.vendor_id,
      subtotal: vo.subtotal,
      itemsCount: vo.items?.length
    })))

    return new Response(
      JSON.stringify({ 
        success: true, 
        vendorOrdersCreated: vendorOrders?.length,
        vendorOrders: vendorOrders?.map(vo => ({
          id: vo.id,
          vendor_id: vo.vendor_id,
          subtotal: vo.subtotal
        }))
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('💥 Critical error in process-vendor-orders:', error)
    console.error('💥 Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        details: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
