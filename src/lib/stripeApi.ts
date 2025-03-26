import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function handleStripeCall<T>(
  apiCall: () => Promise<T>,
  errorMessage: string,
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    console.error(`Stripe API Error - ${errorMessage}:`, error);

    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`${errorMessage}: ${error.message}`);
    }

    throw new Error(`${errorMessage}: An unexpected error occurred`);
  }
}
export async function getProducts(params?: Stripe.ProductListParams) {
  return handleStripeCall(
    () => stripe.products.list(params),
    "Failed to fetch products",
  );
}

export async function getProduct(productId: string) {
  return handleStripeCall(
    () => stripe.products.retrieve(productId),
    `Failed to fetch product ${productId}`,
  );
}

export async function createProduct(params: Stripe.ProductCreateParams) {
  return handleStripeCall(
    () => stripe.products.create(params),
    "Failed to create product",
  );
}

export async function updateProduct(
  productId: string,
  params: Stripe.ProductUpdateParams,
) {
  return handleStripeCall(
    () => stripe.products.update(productId, params),
    `Failed to update product ${productId}`,
  );
}

export async function deleteProduct(productId: string) {
  return handleStripeCall(
    () => stripe.products.update(productId, { active: false }),
    `Failed to delete product ${productId}`,
  );
}
export async function getPrices(params?: Stripe.PriceListParams) {
  return handleStripeCall(
    () => stripe.prices.list(params),
    "Failed to fetch prices",
  );
}

export async function getPrice(priceId: string) {
  return handleStripeCall(
    () => stripe.prices.retrieve(priceId),
    `Failed to fetch price ${priceId}`,
  );
}

export async function createPrice(params: Stripe.PriceCreateParams) {
  return handleStripeCall(
    () => stripe.prices.create(params),
    "Failed to create price",
  );
}

export async function updatePrice(
  priceId: string,
  params: Stripe.PriceUpdateParams,
) {
  return handleStripeCall(
    () => stripe.prices.update(priceId, params),
    `Failed to update price ${priceId}`,
  );
}

export async function deletePrice(priceId: string) {
  return handleStripeCall(
    () => stripe.prices.update(priceId, { active: false }),
    `Failed to delete price ${priceId}`,
  );
}
export async function getProductFeatures(productId: string) {
  return handleStripeCall(async () => {
    return stripe.products.listFeatures(productId, {
      limit: 100,
    });
  }, `Failed to fetch features for product ${productId}`);
}

export async function addProductFeature(
  productId: string,
  feature: { name: string; description?: string },
) {
  return handleStripeCall(async () => {
    const product = await stripe.products.retrieve(productId);

    const features = product.metadata?.features
      ? JSON.parse(product.metadata.features)
      : [];

    const featureId = `feature_${Date.now()}`;

    features.push({
      id: featureId,
      name: feature.name,
      description: feature.description || "",
    });

    const updatedProduct = await stripe.products.update(productId, {
      metadata: {
        ...product.metadata,
        features: JSON.stringify(features),
      },
    });

    return {
      product: updatedProduct,
      features,
      addedFeature: features[features.length - 1],
    };
  }, `Failed to add feature to product ${productId}`);
}

export async function updateProductFeature(
  productId: string,
  featureId: string,
  update: { name?: string; description?: string },
) {
  return handleStripeCall(async () => {
    const product = await stripe.products.retrieve(productId);

    if (!product.metadata?.features) {
      throw new Error(`No features found for product ${productId}`);
    }

    const features = JSON.parse(product.metadata.features);

    const featureIndex = features.findIndex(
      (f: Stripe.ProductFeature) => f.id === featureId,
    );
    if (featureIndex === -1) {
      throw new Error(
        `Feature ${featureId} not found for product ${productId}`,
      );
    }

    features[featureIndex] = {
      ...features[featureIndex],
      ...(update.name && { name: update.name }),
      ...(update.description !== undefined && {
        description: update.description,
      }),
    };

    const updatedProduct = await stripe.products.update(productId, {
      metadata: {
        ...product.metadata,
        features: JSON.stringify(features),
      },
    });

    return {
      product: updatedProduct,
      features,
      updatedFeature: features[featureIndex],
    };
  }, `Failed to update feature ${featureId} for product ${productId}`);
}

export async function removeProductFeature(
  productId: string,
  featureId: string,
) {
  return handleStripeCall(async () => {
    const res = await stripe.products.deleteFeature(productId, featureId);

    const features = await getProductFeatures(productId);

    return {
      deleted: res.deleted,
      features,
      removedFeature: { id: featureId },
    };
  }, `Failed to remove feature ${featureId} from product ${productId}`);
}

export async function getAllFeatures(
  params?: Stripe.Entitlements.FeatureListParams,
) {
  return handleStripeCall(async () => {
    const features = await stripe.entitlements.features.list(params);
    return features.data;
  }, "Failed to fetch all features");
}

function generateLookupKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export async function createFeature(
  params: Stripe.Entitlements.FeatureCreateParams,
) {
  return handleStripeCall(async () => {
    if (!params.lookup_key && params.name) {
      params.lookup_key = generateLookupKey(params.name);
    }

    const feature = await stripe.entitlements.features.create(params);
    return feature;
  }, "Failed to create feature");
}

export async function updateFeature(
  featureId: string,
  params: Stripe.Entitlements.FeatureUpdateParams,
) {
  return handleStripeCall(async () => {
    const feature = await stripe.entitlements.features.update(
      featureId,
      params,
    );
    return feature;
  }, `Failed to update feature ${featureId}`);
}

export async function assignFeatureToProduct(
  productId: string,
  featureId: string,
) {
  return handleStripeCall(async () => {
    const productFeature = await stripe.products.createFeature(productId, {
      entitlement_feature: featureId,
    });

    return productFeature;
  }, `Failed to assign feature to product ${productId}`);
}

export { stripe };
