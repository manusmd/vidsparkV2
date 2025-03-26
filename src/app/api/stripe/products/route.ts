import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct, getPrices, getProductFeatures } from '@/lib/stripeApi';
import { getAuth } from '@/lib/firebaseAdmin';
import Stripe from 'stripe';

// Helper function to check if a user is an admin
async function isAdmin(userId: string): Promise<boolean> {
  try {
    // First check custom claims (backend admin)
    const user = await getAuth().getUser(userId);
    if (user.customClaims?.admin === true) {
      return true;
    }

    // If not in custom claims, check Firestore roles (frontend admin)
    const db = (await import('@/lib/firebaseAdmin')).db;
    const userDoc = await db.collection('users').doc(userId).get();

    if (userDoc.exists) {
      const data = userDoc.data();
      const roles = data?.roles;
      return Array.isArray(roles) && roles.includes('admin');
    }

    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Authentication middleware
async function authenticate(request: NextRequest): Promise<{ userId: string } | null> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    // Extract the token
    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return null;
    }

    // Verify the token
    const decodedToken = await getAuth().verifyIdToken(token);
    return { userId: decodedToken.uid };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const auth = await authenticate(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if the user is an admin
    const admin = await isAdmin(auth.userId);
    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const active = searchParams.get('active');

    // Prepare query parameters for Stripe
    const params: Stripe.ProductListParams = {};
    if (active !== null) {
      params.active = active === 'true';
    }

    // Fetch products from Stripe
    const productsResponse = await getProducts(params);
    const products = productsResponse.data;

    // Fetch prices and features for each product
    const productsWithPricesAndFeatures = await Promise.all(
      products.map(async (product) => {
        const pricesResponse = await getPrices({ product: product.id });
        const features = await getProductFeatures(product.id);
        return {
          ...product,
          prices: pricesResponse.data,
          features: features
        };
      })
    );

    // Return the products with prices and features
    return NextResponse.json({ products: productsWithPricesAndFeatures });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const auth = await authenticate(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if the user is an admin
    const admin = await isAdmin(auth.userId);
    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Parse the request body
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    // Create the product in Stripe
    const product = await createProduct({
      name: body.name,
      description: body.description,
      active: body.active !== false, // Default to true if not specified
      metadata: body.metadata || {},
      images: body.images || [],
      tax_code: body.tax_code,
    });

    // Return the created product
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
