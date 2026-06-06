/**
 * Mafash lightweight Google Apps Script webshop API.
 * Backend: Google Sheets, Google Drive product images, MailApp, LockService.
 *
 * Setup:
 * 1. Paste this file as Code.gs in Apps Script.
 * 2. Run setupDatabaseStructure once.
 * 3. Deploy as Web App.
 */

var APP = {
  VERSION: "3.2.0-mafash-schedule",
  TIMEZONE: Session.getScriptTimeZone() || "Europe/Amsterdam",
  SESSION_HOURS: 24 * 14,
  DEFAULT_ADMIN: { name: "Owner", email: "admin@webshop.local", password: "Admin12345!" },
  CATEGORIES: ["Tops", "Bottoms", "Outerwear", "Footwear"],
  SHEETS: {
    products: [
      "product_id",
      "id",
      "created_at",
      "updated_at",
      "name",
      "brand",
      "category",
      "description",
      "sizes",
      "sku",
      "status",
      "active",
      "featured",
      "sort_order",
      "stock",
      "image_url",
      "cost_price",
      "sell_price",
      "retail_price",
      "vat_enabled",
      "vat_percentage",
      "price_ex_vat",
      "price_inc_vat",
      "shipping_class",
      "discount_type",
      "discount_value",
      "discount_code",
      "discount_starts_at",
      "discount_ends_at",
      "visible_from",
      "visible_until",
      "launch_badge_text",
      "drive_folder_id",
      "drive_folder_url",
      "archived",
    ],
    product_images: [
      "image_id",
      "product_id",
      "drive_file_id",
      "image_url",
      "alt_text",
      "sort_order",
      "active",
      "created_at",
    ],
    product_variants: [
      "variant_id",
      "product_id",
      "size",
      "stock",
      "sort_order",
      "active",
      "created_at",
      "updated_at",
    ],
    proof_reviews: [
      "proof_id",
      "image_url",
      "drive_file_id",
      "customer_name",
      "link_url",
      "product_name",
      "badge_text",
      "quote",
      "review_date",
      "sort_order",
      "active",
      "created_at",
      "updated_at",
      "archived",
    ],
    customer_reviews: [
      "review_id",
      "name",
      "email",
      "rating",
      "message",
      "status",
      "active",
      "created_at",
      "updated_at",
      "approved_at",
      "archived",
    ],
    collections: [
      "collection_id",
      "name",
      "description",
      "product_ids",
      "start_at",
      "end_at",
      "status",
      "badge_text",
      "active",
      "created_at",
      "updated_at",
      "archived",
    ],
    scheduled_actions: [
      "action_id",
      "name",
      "action_type",
      "discount_type",
      "discount_value",
      "discount_code",
      "target_type",
      "target_ids",
      "starts_at",
      "ends_at",
      "frontend_text",
      "status",
      "active",
      "created_at",
      "updated_at",
      "archived",
    ],
    bundles: [
      "bundle_id",
      "name",
      "product_ids",
      "discount_type",
      "discount_value",
      "fixed_bundle_price",
      "start_at",
      "end_at",
      "status",
      "active",
      "frontend_text",
      "created_at",
      "updated_at",
      "archived",
    ],
    orders: [
      "order_id",
      "created_at",
      "updated_at",
      "customer_name",
      "email",
      "phone",
      "address",
      "customer_city",
      "customer_postal_code",
      "customer_country",
      "delivery_type",
      "status",
      "payment_status",
      "fulfillment_status",
      "subtotal",
      "discount_total",
      "coupon_code",
      "bundle_discount",
      "bundle_names",
      "shipping_cost",
      "vat_rate",
      "vat_amount",
      "total_excl_vat",
      "total_price",
      "payment_link",
      "paid",
      "track_trace",
      "notes",
      "last_email_sent",
      "archived",
      "archived_at",
    ],
    order_items: [
      "item_id",
      "order_id",
      "product_id",
      "product_name",
      "brand",
      "category",
      "size",
      "price",
      "cost_price",
      "profit",
      "availability_status",
      "quantity",
      "line_total",
      "bundle_id",
    ],
    coupons: [
      "coupon_id",
      "created_at",
      "updated_at",
      "code",
      "discount_type",
      "discount_value",
      "active",
      "expires_at",
      "usage_limit",
      "used_count",
    ],
    settings: ["key", "value"],
    bedrijf: ["key", "value"],
    staff: [
      "staff_id",
      "created_at",
      "updated_at",
      "name",
      "email",
      "password_hash",
      "role",
      "permissions",
      "active",
      "last_login",
    ],
    sessions: [
      "token_id",
      "created_at",
      "expires_at",
      "actor_type",
      "actor_id",
      "email",
      "role",
      "token",
      "active",
      "last_seen",
    ],
    email_log: ["email_id", "created_at", "order_id", "to", "subject", "type", "status", "error"],
    audit_log: [
      "log_id",
      "created_at",
      "actor_email",
      "action",
      "target_type",
      "target_id",
      "details",
    ],
  },
  DEFAULT_SETTINGS: {
    shop_name: "MA Fashion",
    admin_email: "admin@webshop.local",
    shipping_cost: "12",
    free_shipping_above: "200",
    vat_percentage: "21",
    drive_products_root_folder_id: "",
    drive_products_root_folder_name: "",
    postcode_lookup_url: "",
  },
  DEFAULT_COMPANY: {
    website_name: "MA Fashion",
    company_name: "MA Fashion",
    brand_name: "MA Fashion",
    tagline: "Outlet Authentic Luxury",
    announcement_bar:
      "Authenticated luxury & contemporary essentials, at outlet pricing - Shipped globally from France",
    footer_text:
      "Authenticated luxury & contemporary essentials, at outlet pricing. Shipped globally from France.",
    email_1: "care@mafashion.com",
    phone_1: "",
    shipping_cost: "12",
    free_shipping_above: "200",
    vat_percentage: "21",
    credit_enabled: "true",
    credit_text: "Website ontwikkeld door Van Appiah",
    credit_url: "https://vanappiah.com/",
    credit_label: "VA",
  },
};
var APP_RUNTIME = {};

function doGet(e) {
  e = e || {};
  if (param_(e, "action")) return output_(route_(e.parameter.action, e.parameter || {}));
  return output_(ok_({ name: "Mafash Webshop API", version: APP.VERSION }));
}

function doPost(e) {
  var body = parseBody_(e);
  return output_(route_(body.action || param_(e || {}, "action"), body));
}

function setupDatabaseStructure() {
  ensureDatabase_(true);
  ensureOwner_();
  return ok_({ version: APP.VERSION, sheets: Object.keys(APP.SHEETS) });
}

function route_(action, payload) {
  try {
    payload = payload || {};
    ensureDatabase_();
    action = clean_(action);
    var routes = {
      health: function () {
        return ok_({ ok: true, version: APP.VERSION, time: now_() });
      },
      setupDatabaseStructure: setupDatabaseStructure,
      company: getCompany,
      getCompany: getCompany,
      getProducts: getProducts,
      getProductsPublic: getProducts,
      getProductsPage: getProductsPage,
      products: getProducts,
      getProductDetails: getProductDetails,
      getProofReviews: getProofReviews,
      getProofReviewsPublic: getProofReviews,
      proofReviews: getProofReviews,
      lookupAddress: lookupAddress,
      createOrder: createOrder,
      adminLogin: adminLogin,
      getStaffSession: getStaffSession,
      getProductsAdmin: getProductsAdmin,
      createProduct: createProduct,
      updateProduct: updateProduct,
      archiveProduct: archiveProduct,
      restoreProduct: restoreProduct,
      createProductDriveFolder: createProductDriveFolder,
      repairMissingProductDriveFolders: repairMissingProductDriveFolders,
      bulkCheckProducts: bulkCheckProducts,
      bulkCreateProductDriveFolders: bulkCreateProductDriveFolders,
      bulkUpdateProducts: bulkUpdateProducts,
      bulkApplyDiscountToProducts: bulkApplyDiscountToProducts,
      bulkArchiveProducts: bulkArchiveProducts,
      bulkSyncProductImages: bulkSyncProductImages,
      syncProductImages: syncProductImages,
      updateProductVariants: updateProductVariants,
      getProofReviewsAdmin: getProofReviewsAdmin,
      getProofReviewAdmin: getProofReviewsAdmin,
      getProofsAdmin: getProofReviewsAdmin,
      createProofReview: createProofReview,
      updateProofReview: updateProofReview,
      archiveProofReview: archiveProofReview,
      bulkUpdateProofReviews: bulkUpdateProofReviews,
      updateProductSchedule: updateProductSchedule,
      getCollectionsAdmin: getCollectionsAdmin,
      getCollectionsPublic: getCollectionsPublic,
      createCollection: createCollection,
      updateCollection: updateCollection,
      archiveCollection: archiveCollection,
      getScheduledActionsAdmin: getScheduledActionsAdmin,
      getActiveScheduledActionsPublic: getActiveScheduledActionsPublic,
      createScheduledAction: createScheduledAction,
      updateScheduledAction: updateScheduledAction,
      archiveScheduledAction: archiveScheduledAction,
      bulkUpdateScheduledActions: bulkUpdateScheduledActions,
      createCustomerReview: createCustomerReview,
      getCustomerReviewsPublic: getCustomerReviewsPublic,
      getCustomerReviewsAdmin: getCustomerReviewsAdmin,
      getReviewsAdmin: getCustomerReviewsAdmin,
      customerReviewsAdmin: getCustomerReviewsAdmin,
      updateCustomerReviewStatus: updateCustomerReviewStatus,
      archiveCustomerReview: archiveCustomerReview,
      bulkUpdateCustomerReviews: bulkUpdateCustomerReviews,
      getBundlesAdmin: getBundlesAdmin,
      getBundlesPublic: getBundlesPublic,
      createBundle: createBundle,
      updateBundle: updateBundle,
      archiveBundle: archiveBundle,
      getOrders: getOrders,
      getNewOrders: getNewOrders,
      getArchivedOrders: getArchivedOrders,
      getOrderDetails: getOrderDetails,
      archiveOrder: archiveOrder,
      restoreOrder: restoreOrder,
      archiveCompletedOrders: archiveCompletedOrders,
      bulkArchiveOrders: bulkArchiveOrders,
      updatePaymentStatus: updatePaymentStatus,
      updateFulfillmentStatus: updateFulfillmentStatus,
      resendOrderEmail: resendOrderEmail,
      sendPaymentLinkEmail: sendPaymentLinkEmail,
      getCompanySettings: getCompanySettings,
      updateCompanySettings: updateCompanySettings,
    };
    if (!routes[action]) throw err_("Onbekende actie: " + action, 404);
    return routes[action](payload);
  } catch (error) {
    return fail_(error.message || "Er ging iets mis.", error.code || 500);
  }
}

function getCompany() {
  return ok_(getCompanyMap_());
}

function getCompanySettings(payload) {
  requireStaff_(payload);
  return ok_(getCompanyMap_());
}

function updateCompanySettings(payload) {
  var auth = requireStaff_(payload);
  var values = payload.values || payload.company || {};
  Object.keys(values).forEach(function (key) {
    if (["credit_enabled", "credit_text", "credit_url", "credit_label"].indexOf(key) !== -1) return;
    setCompany_(key, clean_(values[key]));
  });
  audit_(auth.email, "company_updated", "bedrijf", "bedrijf", values);
  return ok_(getCompanyMap_());
}

function getProducts(payload) {
  payload = payload || {};
  ensureProductIdsCached_();
  var cacheKey =
    "public_products_v2_" +
    [
      clean_(payload.category),
      clean_(payload.brand),
      bool_(payload.featured),
      bool_(payload.only_in_stock),
      Math.max(0, Math.floor(num_(payload.limit))),
      Math.max(0, Math.floor(num_(payload.offset))),
    ].join("_");
  var cached = CacheService.getScriptCache().get(cacheKey);
  if (cached) return ok_(JSON.parse(cached));
  var ctx = productContext_();
  var productRows = rows_("products").filter(function (p) {
    var id = productId_(p);
    var stock = productStock_(id, p, ctx);
    var state = productScheduleState_(p);
    return (
      bool_(p.active) &&
      !bool_(p.archived) &&
      (state === "live" || (bool_(payload.include_teasers) && state === "scheduled")) &&
      (bool_(payload.only_in_stock) ? stock > 0 : true)
    );
  });
  if (payload.category)
    productRows = productRows.filter(function (p) {
      return same_(p.category, payload.category);
    });
  if (payload.brand)
    productRows = productRows.filter(function (p) {
      return same_(p.brand, payload.brand);
    });
  if (payload.featured)
    productRows = productRows.filter(function (p) {
      return bool_(p.featured);
    });
  productRows.sort(function (a, b) {
    return num_(a.sort_order) - num_(b.sort_order);
  });
  var offset = Math.max(0, Math.floor(num_(payload.offset)));
  var limit = Math.max(0, Math.floor(num_(payload.limit)));
  if (offset || limit) productRows = productRows.slice(offset, limit ? offset + limit : undefined);
  var data = productRows.map(function (p) {
    return publicProduct_(p, ctx);
  });
  CacheService.getScriptCache().put(cacheKey, JSON.stringify(jsonSafe_(data)), 60);
  return ok_(data);
}

function getProductsPage(payload) {
  payload = payload || {};
  ensureProductIdsCached_();
  var cachePayload = {
    category: clean_(payload.category),
    brand: clean_(payload.brand),
    featured: bool_(payload.featured),
    only_in_stock: bool_(payload.only_in_stock),
    include_teasers: bool_(payload.include_teasers),
    page: Math.max(1, Math.floor(num_(payload.page || 1))),
    limit: Math.max(1, Math.min(24, Math.floor(num_(payload.limit || 12)))),
  };
  var cache = CacheService.getScriptCache();
  var cacheKey =
    "products_page_v1_" +
    Utilities.base64EncodeWebSafe(JSON.stringify(cachePayload)).slice(0, 180);
  var cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);
  var ctx = productContext_();
  var productRows = rows_("products").filter(function (p) {
    var id = productId_(p);
    var stock = productStock_(id, p, ctx);
    var state = productScheduleState_(p);
    return (
      bool_(p.active) &&
      !bool_(p.archived) &&
      (state === "live" || (cachePayload.include_teasers && state === "scheduled")) &&
      (cachePayload.only_in_stock ? stock > 0 : true)
    );
  });
  if (cachePayload.category)
    productRows = productRows.filter(function (p) {
      return same_(p.category, cachePayload.category);
    });
  if (cachePayload.brand)
    productRows = productRows.filter(function (p) {
      return same_(p.brand, cachePayload.brand);
    });
  if (cachePayload.featured)
    productRows = productRows.filter(function (p) {
      return bool_(p.featured);
    });
  productRows.sort(function (a, b) {
    return num_(a.sort_order) - num_(b.sort_order);
  });
  var limit = cachePayload.limit;
  var page = cachePayload.page;
  var total = productRows.length;
  var offset = (page - 1) * limit;
  var items = productRows.slice(offset, offset + limit).map(function (p) {
    return publicProduct_(p, ctx);
  });
  var result = ok_({
    items: items,
    total: total,
    page: page,
    limit: limit,
    page_count: Math.max(1, Math.ceil(total / limit)),
    has_next: offset + limit < total,
    has_previous: page > 1,
  });
  cache.put(cacheKey, JSON.stringify(result), 45);
  return result;
}

function getProductDetails(payload) {
  validateRequired_(payload, ["product_id"]);
  var row = findRowAny_("products", ["product_id", "id"], payload.product_id);
  if (!row || !bool_(row.record.active) || productScheduleState_(row.record) !== "live")
    throw err_("Product niet gevonden.", 404);
  return ok_(publicProduct_(row.record, productContext_()));
}

function getProofReviews() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get("public_proof_reviews_v1");
  if (cached) return ok_(JSON.parse(cached));
  var data = rows_("proof_reviews")
    .filter(function (p) {
      return bool_(p.active) && !bool_(p.archived);
    })
    .sort(sortOrder_)
    .map(publicProofReview_);
  cache.put("public_proof_reviews_v1", JSON.stringify(jsonSafe_(data)), 120);
  return ok_(data);
}

function lookupAddress(payload) {
  payload = payload || {};
  var postal = clean_(payload.postal_code || payload.customer_postal_code)
    .toUpperCase()
    .replace(/\s+/g, "");
  var house = clean_(payload.house_number || payload.number).replace(/\D+/g, "");
  if (!/^[1-9][0-9]{3}[A-Z]{2}$/.test(postal) || !house) {
    return ok_({ found: false, street: "", city: "", postal_code: postal });
  }
  var fallback = {
    "1033WG:132": { street: "Marskramerstraat", city: "Amsterdam" },
  };
  var key = postal + ":" + house;
  if (fallback[key]) {
    return ok_({
      found: true,
      street: fallback[key].street,
      city: fallback[key].city,
      postal_code: postal.replace(/^([0-9]{4})([A-Z]{2})$/, "$1 $2"),
    });
  }
  var settings = getSettingsMap_();
  var template = clean_(settings.postcode_lookup_url);
  if (!template) return ok_({ found: false, street: "", city: "", postal_code: postal });
  try {
    var url = template
      .replace("{{postal_code}}", encodeURIComponent(postal))
      .replace("{{house_number}}", encodeURIComponent(house));
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
      return ok_({ found: false, street: "", city: "", postal_code: postal });
    }
    var data = JSON.parse(response.getContentText());
    return ok_({
      found: true,
      street: clean_(data.street || data.straat || data.address && data.address.street),
      city: clean_(data.city || data.plaats || data.woonplaats || data.address && data.address.city),
      postal_code: postal.replace(/^([0-9]{4})([A-Z]{2})$/, "$1 $2"),
    });
  } catch (error) {
    console.error(error);
    return ok_({ found: false, street: "", city: "", postal_code: postal });
  }
}

function createOrder(payload) {
  validateRequired_(payload, ["customer_name", "email", "phone", "delivery_type", "items"]);
  validateEmail_(payload.email);
  if (!Array.isArray(payload.items) || payload.items.length === 0)
    throw err_("Winkelwagen is leeg.", 400);

  var created = null;
  var result = withLock_(function () {
    var normalized = [];
    var subtotal = 0;
    var discountTotal = 0;
    payload.items.forEach(function (item) {
      var productId = clean_(item.product_id || item.id);
      var found = findRowAny_("products", ["product_id", "id"], productId);
      if (!found || !bool_(found.record.active))
        throw err_("Product bestaat niet: " + productId, 400);
      var product = found.record;
      if (productScheduleState_(product) !== "live")
        throw err_(product.name + " is nu niet beschikbaar.", 409);
      var qty = Math.max(1, Math.floor(num_(item.quantity || item.qty || 1)));
      var size = clean_(item.size);
      var variant = findActiveVariant_(product.product_id || product.id, size);
      var variants = productVariants_(product.product_id || product.id);
      if (variants.length && !size) throw err_("Kies een maat voor " + product.name + ".", 400);
      if (variants.length && !variant)
        throw err_("Maat " + size + " is niet beschikbaar voor " + product.name + ".", 409);
      var available = variant ? num_(variant.record.stock) : num_(product.stock);
      var requestStatus = available >= qty ? "in_stock" : "on_request";
      var sale = publicPrice_(product, product.product_id || product.id);
      var price = sale.base;
      var lineDiscount = money_((sale.base - sale.price) * qty);
      subtotal += price * qty - lineDiscount;
      discountTotal += lineDiscount;
      normalized.push({
        row: found.row,
        product: product,
        variant: variant,
        quantity: qty,
        size: size,
        price: price,
        line_discount: lineDiscount,
        availability_status: requestStatus,
      });
    });

    var coupon = getValidCoupon_(payload.coupon_code);
    if (coupon) {
      var couponDiscount = discountAmount_(subtotal, coupon.discount_type, coupon.discount_value);
      subtotal -= couponDiscount;
      discountTotal += couponDiscount;
      incrementCouponUse_(coupon.code);
    }

    var bundleResult = applyBundleDiscounts_(normalized, subtotal);
    if (bundleResult.discount > 0) {
      subtotal = money_(subtotal - bundleResult.discount);
      discountTotal = money_(discountTotal + bundleResult.discount);
    }

    normalized.forEach(function (item) {
      if (item.variant) {
        updateByRow_("product_variants", item.variant.row, {
          stock: Math.max(0, num_(item.variant.record.stock) - item.quantity),
          updated_at: now_(),
        });
        updateProductStock_(item.product.product_id || item.product.id);
      } else {
        updateByRow_("products", item.row, {
          stock: Math.max(0, num_(item.product.stock) - item.quantity),
          updated_at: now_(),
        });
      }
    });

    var company = getCompanyMap_();
    var vatRate = num_(company.vat_percentage || 21);
    var shipping =
      clean_(payload.delivery_type) === "ophalen" || hasFreeShippingAction_()
        ? 0
        : shippingFor_(subtotal, company);
    var total = money_(subtotal + shipping);
    var excl = money_(total / (1 + vatRate / 100));
    var order = {
      order_id: id_("ORD"),
      created_at: now_(),
      updated_at: now_(),
      customer_name: clean_(payload.customer_name),
      email: clean_(payload.email).toLowerCase(),
      phone: clean_(payload.phone),
      address: clean_(payload.address),
      customer_city: clean_(payload.customer_city),
      customer_postal_code: clean_(payload.customer_postal_code),
      customer_country: clean_(payload.customer_country || "Nederland"),
      delivery_type: clean_(payload.delivery_type),
      status: "new",
      payment_status: "pending",
      fulfillment_status: "pending",
      subtotal: money_(subtotal),
      discount_total: money_(discountTotal),
      coupon_code: coupon ? coupon.code : clean_(payload.coupon_code).toUpperCase(),
      bundle_discount: money_(bundleResult.discount),
      bundle_names: bundleResult.names.join(", "),
      shipping_cost: money_(shipping),
      vat_rate: vatRate,
      vat_amount: money_(total - excl),
      total_excl_vat: excl,
      total_price: total,
      payment_link: "",
      paid: false,
      track_trace: "",
      notes: clean_(payload.notes),
      last_email_sent: "",
    };
    append_("orders", order);
    normalized.forEach(function (item) {
      append_("order_items", {
        item_id: id_("ITM"),
        order_id: order.order_id,
        product_id: item.product.product_id || item.product.id,
        product_name: item.product.name,
        brand: item.product.brand,
        category: item.product.category,
        size: item.size,
        price: item.price,
        cost_price: money_(item.product.cost_price),
        profit: money_(
          (item.price - num_(item.product.cost_price)) * item.quantity - item.line_discount,
        ),
        availability_status: item.availability_status,
        quantity: item.quantity,
        line_total: money_(item.price * item.quantity - item.line_discount),
        bundle_id: bundleResult.itemBundleIds[item.product.product_id || item.product.id] || "",
      });
    });
    created = order;
    return {
      order_id: order.order_id,
      total_price: order.total_price,
      payment_status: order.payment_status,
      fulfillment_status: order.fulfillment_status,
    };
  });

  try {
    if (created) sendOrderMail_(created);
  } catch (mailError) {
    console.error(mailError);
  }
  clearPublicCache_();
  return ok_(result);
}

function adminLogin(payload) {
  validateRequired_(payload, ["email", "password"]);
  ensureOwner_();
  var row = findRow_("staff", "email", clean_(payload.email).toLowerCase());
  if (
    !row ||
    !bool_(row.record.active) ||
    !verifyPassword_(payload.password, row.record.password_hash)
  )
    throw err_("Adminlogin mislukt.", 401);
  var session = createSession_(row.record);
  updateByRow_("staff", row.row, { last_login: now_(), updated_at: now_() });
  return ok_({ token: session.token, staff: safeStaff_(row.record), permissions: ["*"] });
}

function getStaffSession(payload) {
  var auth = requireStaff_(payload);
  return ok_({ staff: safeStaff_(auth.staff), permissions: ["*"] });
}

function getProductsAdmin(payload) {
  payload = payload || {};
  requireStaff_(payload);
  ensureProductIds_();
  resetRuntimeCache_();
  var ctx = productContext_();
  var search = clean_(payload.search).toLowerCase();
  var filtered = rows_("products").filter(function (p) {
    var haystack = [p.name, p.brand, p.sku, p.category, p.product_id, p.id].join(" ").toLowerCase();
    if (search && haystack.indexOf(search) === -1) return false;
    if (payload.category && !same_(p.category, payload.category)) return false;
    if (payload.status && !same_(p.status, payload.status)) return false;
    if (payload.featured !== undefined && clean_(payload.featured) !== "" && bool_(p.featured) !== bool_(payload.featured)) return false;
    if (bool_(payload.missing_drive_folder) && clean_(p.drive_folder_id)) return false;
    if (bool_(payload.missing_image) && clean_(p.image_url)) return false;
    return true;
  });
  filtered = filtered.sort(sortCreatedDesc_);
  var total = filtered.length;
  var offset = Math.max(0, Math.floor(num_(payload.offset)));
  var limit = Math.max(0, Math.floor(num_(payload.limit || total)));
  var page = limit ? filtered.slice(offset, offset + limit) : filtered;
  return ok_({
    items: page.map(function (p) {
      return adminProductOut_(p, ctx);
    }),
    total: total,
    offset: offset,
    limit: limit || total,
    has_more: limit ? offset + limit < total : false,
  });
}

function adminProductById_(productId) {
  resetRuntimeCache_();
  var row = findRowAny_("products", ["product_id", "id"], productId);
  if (!row) throw err_("Product niet gevonden.", 404);
  return adminProductOut_(row.record, productContext_());
}

function adminProductOut_(p, ctx) {
  var id = productId_(p);
  var out = merge_(p, {});
  out.product_id = id;
  out.id = id;
  out.images = productImages_(id, p, ctx);
  out.image_count = out.images.length;
  out.variants = productVariants_(id, p, ctx);
  out.stock = productStock_(id, p, ctx);
  out.schedule_state = productScheduleState_(p);
  out.has_drive_folder = !!clean_(p.drive_folder_id);
  out.has_image = !!(clean_(p.image_url) || out.images.length);
  return out;
}

function createProductDriveFolder(payload) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, ["product_id"]);
  var row = findRowAny_("products", ["product_id", "id"], payload.product_id);
  if (!row) throw err_("Product niet gevonden.", 404);
  if (clean_(row.record.drive_folder_id)) {
    return ok_({
      product_id: row.record.product_id || row.record.id,
      drive_folder_id: row.record.drive_folder_id,
      drive_folder_url: row.record.drive_folder_url,
      product: adminProductById_(payload.product_id),
    });
  }
  var folder = ensureProductFolder_(row.record.product_id || row.record.id, clean_(payload.folder_name || row.record.name));
  updateByRow_("products", row.row, {
    drive_folder_id: folder.id,
    drive_folder_url: folder.url,
    updated_at: now_(),
  });
  clearPublicCache_();
  audit_(auth.email, "product_drive_folder_created", "product", payload.product_id, folder);
  return ok_({
    product_id: row.record.product_id || row.record.id,
    drive_folder_id: folder.id,
    drive_folder_url: folder.url,
    product: adminProductById_(payload.product_id),
  });
}

function repairMissingProductDriveFolders(payload) {
  var auth = requireStaff_(payload);
  var created = 0;
  var skipped = 0;
  var errors = [];
  rows_("products").forEach(function (p) {
    var id = productId_(p);
    if (!id || clean_(p.drive_folder_id)) {
      skipped++;
      return;
    }
    try {
      var row = findRowAny_("products", ["product_id", "id"], id);
      var folder = ensureProductFolder_(id, p.name || id);
      updateByRow_("products", row.row, {
        drive_folder_id: folder.id,
        drive_folder_url: folder.url,
        updated_at: now_(),
      });
      created++;
    } catch (error) {
      errors.push({ product_id: id, message: error.message });
    }
  });
  clearPublicCache_();
  audit_(auth.email, "product_drive_folders_repaired", "product", "bulk", {
    created: created,
    skipped: skipped,
    errors: errors,
  });
  return ok_({ created: created, skipped: skipped, errors: errors });
}

function bulkIds_(payload, field) {
  payload = payload || {};
  var value = payload[field || "product_ids"] || payload.ids || payload.selected_ids || [];
  return splitIds_(value);
}

function bulkCheckProducts(payload) {
  requireStaff_(payload);
  var ids = bulkIds_(payload, "product_ids");
  if (!ids.length) throw err_("Geen producten geselecteerd.", 400);
  var ctx = productContext_();
  var products = ids.map(function (id) {
    var row = findRowAny_("products", ["product_id", "id"], id);
    if (!row) return { product_id: id, exists: false };
    var out = adminProductOut_(row.record, ctx);
    return {
      product_id: out.product_id,
      exists: true,
      missing_drive_folder: !clean_(out.drive_folder_id),
      missing_image: !out.has_image,
      stock: out.stock,
      variants: out.variants.length,
      status: out.status,
      schedule_state: out.schedule_state,
    };
  });
  return ok_({ checked: products.length, products: products });
}

function bulkCreateProductDriveFolders(payload) {
  var auth = requireStaff_(payload);
  var ids = bulkIds_(payload, "product_ids");
  if (!ids.length) throw err_("Geen producten geselecteerd.", 400);
  var created = 0;
  var skipped = 0;
  var errors = [];
  var products = [];
  ids.forEach(function (id) {
    try {
      var row = findRowAny_("products", ["product_id", "id"], id);
      if (!row) throw err_("Product niet gevonden.", 404);
      if (clean_(row.record.drive_folder_id)) {
        skipped++;
      } else {
        var folder = ensureProductFolder_(row.record.product_id || row.record.id, row.record.name || id);
        updateByRow_("products", row.row, {
          drive_folder_id: folder.id,
          drive_folder_url: folder.url,
          updated_at: now_(),
        });
        created++;
      }
      products.push(adminProductById_(id));
    } catch (error) {
      errors.push({ product_id: id, message: error.message });
    }
  });
  clearPublicCache_();
  audit_(auth.email, "bulk_product_drive_folders_created", "product", "bulk", {
    created: created,
    skipped: skipped,
    errors: errors,
  });
  return ok_({ created: created, skipped: skipped, errors: errors, products: products });
}

function bulkUpdateProducts(payload) {
  var auth = requireStaff_(payload);
  var ids = bulkIds_(payload, "product_ids");
  if (!ids.length) throw err_("Geen producten geselecteerd.", 400);
  var patch = {};
  if (payload.featured !== undefined && clean_(payload.featured) !== "") patch.featured = bool_(payload.featured);
  if (payload.status !== undefined && clean_(payload.status) !== "") patch.status = clean_(payload.status);
  if (payload.active !== undefined && clean_(payload.active) !== "") patch.active = bool_(payload.active);
  if (payload.category !== undefined && clean_(payload.category) !== "") patch.category = normalizeCategory_(payload.category);
  if (payload._discount_patch) {
    patch.discount_type = clean_(payload.discount_type || "none");
    patch.discount_value = money_(payload.discount_value);
    patch.discount_code = clean_(payload.discount_code);
    patch.discount_starts_at = clean_(payload.discount_starts_at);
    patch.discount_ends_at = clean_(payload.discount_ends_at);
  }
  if (!Object.keys(patch).length) throw err_("Geen bulk-wijziging opgegeven.", 400);
  patch.updated_at = now_();
  var products = [];
  var errors = [];
  ids.forEach(function (id) {
    try {
      var row = findRowAny_("products", ["product_id", "id"], id);
      if (!row) throw err_("Product niet gevonden.", 404);
      updateByRow_("products", row.row, patch);
      products.push(adminProductById_(id));
    } catch (error) {
      errors.push({ product_id: id, message: error.message });
    }
  });
  clearPublicCache_();
  audit_(auth.email, "bulk_products_updated", "product", "bulk", patch);
  return ok_({ updated: products.length, errors: errors, products: products });
}

function bulkApplyDiscountToProducts(payload) {
  payload = payload || {};
  payload.discount_type = clean_(payload.discount_type || "percent");
  validateDiscount_(payload.discount_type, payload.discount_value);
  return bulkUpdateProducts(
    merge_(payload, {
      status: payload.status === undefined ? "" : payload.status,
      featured: "",
      active: "",
      _discount_patch: true,
    }),
  );
}

function bulkArchiveProducts(payload) {
  return bulkUpdateProducts(merge_(payload || {}, { status: "archived", active: false }));
}

function bulkSyncProductImages(payload) {
  requireStaff_(payload);
  var ids = bulkIds_(payload, "product_ids");
  if (!ids.length) throw err_("Geen producten geselecteerd.", 400);
  var synced = 0;
  var products = [];
  var errors = [];
  ids.forEach(function (id) {
    try {
      var result = syncProductImages(merge_(payload, { product_id: id }));
      if (result.success) {
        synced += (result.data.synced || []).length;
        if (result.data.product) products.push(result.data.product);
      }
    } catch (error) {
      errors.push({ product_id: id, message: error.message });
    }
  });
  return ok_({ synced: synced, errors: errors, products: products });
}

function createProduct(payload) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, ["name", "sell_price", "category"]);
  var id = id_("PROD");
  var pricing = productPricing_(payload);
  var folder = ensureProductFolder_(id, payload.name);
  var product = {
    product_id: id,
    id: id,
    created_at: now_(),
    updated_at: now_(),
    name: clean_(payload.name),
    brand: clean_(payload.brand || "MA Fashion"),
    category: normalizeCategory_(payload.category),
    description: clean_(payload.description),
    sizes: clean_(payload.sizes || ""),
    sku: clean_(payload.sku),
    status: clean_(payload.status || "active"),
    active: payload.active === undefined ? true : bool_(payload.active),
    featured: bool_(payload.featured),
    sort_order: Math.floor(num_(payload.sort_order)),
    stock: Math.max(0, Math.floor(num_(payload.stock))),
    image_url: clean_(payload.image_url),
    cost_price: pricing.cost_price,
    sell_price: pricing.sell_price,
    retail_price: money_(payload.retail_price || payload.sell_price),
    vat_enabled: pricing.vat_enabled,
    vat_percentage: pricing.vat_percentage,
    price_ex_vat: pricing.price_ex_vat,
    price_inc_vat: pricing.price_inc_vat,
    shipping_class: clean_(payload.shipping_class || "standard"),
    discount_type: clean_(payload.discount_type || "none"),
    discount_value: money_(payload.discount_value),
    discount_code: clean_(payload.discount_code),
    discount_starts_at: clean_(payload.discount_starts_at),
    discount_ends_at: clean_(payload.discount_ends_at),
    visible_from: clean_(payload.visible_from),
    visible_until: clean_(payload.visible_until),
    launch_badge_text: clean_(payload.launch_badge_text),
    drive_folder_id: folder.id,
    drive_folder_url: folder.url,
    archived: false,
  };
  validateDiscount_(product.discount_type, product.discount_value);
  append_("products", product);
  replaceProductVariants_(id, parseVariants_(payload.variants || payload.variant_stock, product.sizes));
  updateProductStock_(id);
  appendProductImageIfPresent_(id, payload);
  clearPublicCache_();
  audit_(auth.email, "product_created", "product", id, product);
  return ok_(adminProductById_(id));
}

function updateProduct(payload) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, ["product_id"]);
  var row = findRowAny_("products", ["product_id", "id"], payload.product_id);
  if (!row) throw err_("Product niet gevonden.", 404);
  var merged = merge_(row.record, payload);
  var pricing = productPricing_(merged);
  var patch = { updated_at: now_() };
  ["name", "brand", "description", "sizes", "sku", "image_url", "shipping_class"].forEach(
    function (k) {
      if (payload[k] !== undefined) patch[k] = clean_(payload[k]);
    },
  );
  if (payload.category !== undefined) patch.category = normalizeCategory_(payload.category);
  if (payload.stock !== undefined) patch.stock = Math.max(0, Math.floor(num_(payload.stock)));
  if (payload.status !== undefined) patch.status = clean_(payload.status);
  if (payload.active !== undefined) patch.active = bool_(payload.active);
  if (payload.featured !== undefined) patch.featured = bool_(payload.featured);
  if (payload.sort_order !== undefined) patch.sort_order = Math.floor(num_(payload.sort_order));
  if (payload.discount_type !== undefined) patch.discount_type = clean_(payload.discount_type);
  if (payload.discount_value !== undefined) patch.discount_value = money_(payload.discount_value);
  if (payload.discount_code !== undefined) patch.discount_code = clean_(payload.discount_code);
  if (payload.discount_starts_at !== undefined) patch.discount_starts_at = clean_(payload.discount_starts_at);
  if (payload.discount_ends_at !== undefined) patch.discount_ends_at = clean_(payload.discount_ends_at);
  if (payload.retail_price !== undefined) patch.retail_price = money_(payload.retail_price);
  ["visible_from", "visible_until", "launch_badge_text"].forEach(function (k) {
    if (payload[k] !== undefined) patch[k] = clean_(payload[k]);
  });
  if (
    payload.sell_price !== undefined ||
    payload.cost_price !== undefined ||
    payload.vat_enabled !== undefined ||
    payload.vat_percentage !== undefined
  ) {
    patch.cost_price = pricing.cost_price;
    patch.sell_price = pricing.sell_price;
    patch.price_ex_vat = pricing.price_ex_vat;
    patch.price_inc_vat = pricing.price_inc_vat;
    patch.vat_enabled = pricing.vat_enabled;
    patch.vat_percentage = pricing.vat_percentage;
  }
  validateDiscount_(
    patch.discount_type || row.record.discount_type || "none",
    patch.discount_value !== undefined ? patch.discount_value : row.record.discount_value,
  );
  updateByRow_("products", row.row, patch);
  if (payload.variants !== undefined || payload.variant_stock !== undefined) {
    replaceProductVariants_(
      row.record.product_id || row.record.id,
      parseVariants_(payload.variants || payload.variant_stock, patch.sizes || row.record.sizes),
    );
    updateProductStock_(row.record.product_id || row.record.id);
  }
  appendProductImageIfPresent_(row.record.product_id || row.record.id, payload);
  clearPublicCache_();
  audit_(auth.email, "product_updated", "product", payload.product_id, patch);
  return ok_(adminProductById_(payload.product_id));
}

function archiveProduct(payload) {
  requireStaff_(payload);
  validateRequired_(payload, ["product_id"]);
  var row = findRowAny_("products", ["product_id", "id"], payload.product_id);
  if (!row) throw err_("Product niet gevonden.", 404);
  updateByRow_("products", row.row, { active: false, status: "archived", updated_at: now_() });
  clearPublicCache_();
  return ok_({ product_id: payload.product_id, status: "archived" });
}

function restoreProduct(payload) {
  requireStaff_(payload);
  validateRequired_(payload, ["product_id"]);
  var row = findRowAny_("products", ["product_id", "id"], payload.product_id);
  if (!row) throw err_("Product niet gevonden.", 404);
  updateByRow_("products", row.row, { active: true, status: "active", updated_at: now_() });
  clearPublicCache_();
  return ok_({ product_id: payload.product_id, status: "active" });
}

function syncProductImages(payload) {
  requireStaff_(payload);
  validateRequired_(payload, ["product_id"]);
  var row = findRowAny_("products", ["product_id", "id"], payload.product_id);
  if (!row) throw err_("Product niet gevonden.", 404);
  var folderId = clean_(row.record.drive_folder_id);
  if (!folderId) throw err_("Product heeft geen Drive-map.", 400);
  var folder = DriveApp.getFolderById(folderId);
  try {
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    console.error(e);
  }
  var files = folder.getFiles();
  var synced = [];
  var existing = {};
  rows_("product_images").forEach(function (img) {
    if (same_(img.product_id, row.record.product_id || row.record.id) && img.drive_file_id)
      existing[clean_(img.drive_file_id)] = true;
  });
  var sort = 1;
  while (files.hasNext()) {
    var file = files.next();
    if (file.getMimeType().indexOf("image/") !== 0) continue;
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e2) {
      console.error(e2);
    }
    if (!existing[file.getId()]) {
      append_("product_images", {
        image_id: id_("IMG"),
        product_id: row.record.product_id || row.record.id,
        drive_file_id: file.getId(),
        image_url: driveImageUrl_(file.getId()),
        alt_text: row.record.name,
        sort_order: sort,
        active: true,
        created_at: now_(),
      });
    }
    synced.push({ id: file.getId(), name: file.getName(), url: driveImageUrl_(file.getId()) });
    sort++;
  }
  clearPublicCache_();
  return ok_({ product_id: payload.product_id, synced: synced, product: adminProductById_(payload.product_id) });
}

function updateProductVariants(payload) {
  requireStaff_(payload);
  validateRequired_(payload, ["product_id"]);
  var row = findRowAny_("products", ["product_id", "id"], payload.product_id);
  if (!row) throw err_("Product niet gevonden.", 404);
  var variants = parseVariants_(payload.variants || payload.variant_stock, row.record.sizes);
  replaceProductVariants_(row.record.product_id || row.record.id, variants);
  updateByRow_("products", row.row, {
    sizes: variants
      .map(function (v) {
        return v.size;
      })
      .join(","),
    updated_at: now_(),
  });
  updateProductStock_(row.record.product_id || row.record.id);
  clearPublicCache_();
  return ok_({
    product_id: row.record.product_id || row.record.id,
    variants: productVariants_(row.record.product_id || row.record.id),
  });
}

function getProofReviewsAdmin(payload) {
  requireStaff_(payload);
  return ok_(rows_("proof_reviews").sort(sortOrder_).map(publicProofReview_));
}

function createProofReview(payload) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, ["image_url"]);
  var proof = proofPatch_(payload);
  proof.proof_id = id_("PRF");
  proof.created_at = now_();
  proof.updated_at = now_();
  append_("proof_reviews", proof);
  clearPublicCache_();
  audit_(auth.email, "proof_created", "proof_review", proof.proof_id, proof);
  return ok_(publicProofReview_(proof));
}

function updateProofReview(payload) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, ["proof_id"]);
  var row = findRow_("proof_reviews", "proof_id", payload.proof_id);
  if (!row) throw err_("Proof review niet gevonden.", 404);
  var patch = proofPatch_(merge_(row.record, payload));
  patch.updated_at = now_();
  updateByRow_("proof_reviews", row.row, patch);
  clearPublicCache_();
  audit_(auth.email, "proof_updated", "proof_review", payload.proof_id, patch);
  return ok_(publicProofReview_(findRow_("proof_reviews", "proof_id", payload.proof_id).record));
}

function archiveProofReview(payload) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, ["proof_id"]);
  var row = findRow_("proof_reviews", "proof_id", payload.proof_id);
  if (!row) throw err_("Proof review niet gevonden.", 404);
  updateByRow_("proof_reviews", row.row, { active: false, archived: true, updated_at: now_() });
  clearPublicCache_();
  audit_(auth.email, "proof_archived", "proof_review", payload.proof_id, {});
  return ok_({ proof_id: payload.proof_id, active: false });
}

function bulkUpdateProofReviews(payload) {
  var auth = requireStaff_(payload);
  var ids = bulkIds_(payload, "proof_ids");
  if (!ids.length) throw err_("Geen proof-items geselecteerd.", 400);
  var patch = { updated_at: now_() };
  if (payload.active !== undefined && clean_(payload.active) !== "") patch.active = bool_(payload.active);
  if (payload.archived !== undefined && clean_(payload.archived) !== "") patch.archived = bool_(payload.archived);
  var items = [];
  var errors = [];
  ids.forEach(function (id, index) {
    try {
      var row = findRow_("proof_reviews", "proof_id", id);
      if (!row) throw err_("Proof review niet gevonden.", 404);
      var rowPatch = merge_(patch, {});
      if (bool_(payload.reset_sort_order)) rowPatch.sort_order = index + 1;
      if (rowPatch.archived) rowPatch.active = false;
      updateByRow_("proof_reviews", row.row, rowPatch);
      items.push(publicProofReview_(findRow_("proof_reviews", "proof_id", id).record));
    } catch (error) {
      errors.push({ proof_id: id, message: error.message });
    }
  });
  clearPublicCache_();
  audit_(auth.email, "proof_reviews_bulk_updated", "proof_review", "bulk", patch);
  return ok_({ updated: items.length, errors: errors, items: items });
}

function createCustomerReview(payload) {
  payload = payload || {};
  validateRequired_(payload, ["name", "email", "rating", "message"]);
  validateEmail_(payload.email);
  var rating = Math.max(1, Math.min(5, Math.floor(num_(payload.rating))));
  var review = {
    review_id: id_("REV"),
    name: clean_(payload.name),
    email: clean_(payload.email).toLowerCase(),
    rating: rating,
    message: clean_(payload.message),
    status: "pending",
    active: false,
    created_at: now_(),
    updated_at: now_(),
    approved_at: "",
    archived: false,
  };
  append_("customer_reviews", review);
  var settings = getSettingsMap_();
  var company = getCompanyMap_();
  var adminTo = clean_(settings.admin_email || company.admin_email || company.email_1 || APP.DEFAULT_SETTINGS.admin_email);
  sendSimpleEmail_(
    adminTo,
    "Nieuwe Mafash review ontvangen",
    "<p>Nieuwe review ontvangen.</p><p><strong>Naam:</strong> " +
      esc_(review.name) +
      "<br><strong>Email:</strong> " +
      esc_(review.email) +
      "<br><strong>Sterren:</strong> " +
      esc_(review.rating) +
      "/5</p><p>" +
      esc_(review.message) +
      "</p>",
    "customer_review_admin",
    review.review_id,
  );
  sendSimpleEmail_(
    review.email,
    "Bedankt voor je review",
    "<p>Hallo " +
      esc_(review.name) +
      ",</p><p>Bedankt voor je review. We controleren je bericht eerst voordat het zichtbaar wordt op de website.</p>",
    "customer_review_confirmation",
    review.review_id,
  );
  clearPublicCache_();
  return ok_({ review_id: review.review_id, status: review.status });
}

function getCustomerReviewsPublic() {
  var cached = CacheService.getScriptCache().get("public_customer_reviews_v1");
  if (cached) return ok_(JSON.parse(cached));
  var data = rows_("customer_reviews")
    .filter(function (r) {
      return clean_(r.status) === "approved" && bool_(r.active) && !bool_(r.archived);
    })
    .sort(sortCreatedDesc_)
    .map(publicCustomerReview_);
  CacheService.getScriptCache().put("public_customer_reviews_v1", JSON.stringify(jsonSafe_(data)), 120);
  return ok_(data);
}

function getCustomerReviewsAdmin(payload) {
  requireStaff_(payload);
  return ok_(rows_("customer_reviews").sort(sortCreatedDesc_).map(adminCustomerReview_));
}

function updateCustomerReviewStatus(payload) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, ["review_id", "status"]);
  var status = clean_(payload.status);
  if (["pending", "approved", "rejected", "archived"].indexOf(status) === -1)
    throw err_("Ongeldige reviewstatus.", 400);
  var row = findRow_("customer_reviews", "review_id", payload.review_id);
  if (!row) throw err_("Review niet gevonden.", 404);
  updateByRow_("customer_reviews", row.row, {
    status: status,
    active: status === "approved",
    approved_at: status === "approved" ? now_() : row.record.approved_at,
    archived: status === "archived",
    updated_at: now_(),
  });
  clearPublicCache_();
  audit_(auth.email, "customer_review_status_updated", "customer_review", payload.review_id, {
    status: status,
  });
  return ok_(adminCustomerReview_(findRow_("customer_reviews", "review_id", payload.review_id).record));
}

function archiveCustomerReview(payload) {
  payload = payload || {};
  return updateCustomerReviewStatus({ token: payload.token, review_id: payload.review_id, status: "archived" });
}

function bulkUpdateCustomerReviews(payload) {
  requireStaff_(payload);
  var ids = bulkIds_(payload, "review_ids");
  if (!ids.length) throw err_("Geen reviews geselecteerd.", 400);
  var status = clean_(payload.status || "approved");
  var items = [];
  var errors = [];
  ids.forEach(function (id) {
    try {
      var result = updateCustomerReviewStatus({ token: payload.token, review_id: id, status: status });
      if (result.success) items.push(result.data);
    } catch (error) {
      errors.push({ review_id: id, message: error.message });
    }
  });
  return ok_({ updated: items.length, errors: errors, items: items });
}

function updateProductSchedule(payload) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, ["product_id"]);
  var row = findRowAny_("products", ["product_id", "id"], payload.product_id);
  if (!row) throw err_("Product niet gevonden.", 404);
  var patch = { updated_at: now_() };
  ["visible_from", "visible_until", "launch_badge_text", "status"].forEach(function (key) {
    if (payload[key] !== undefined) patch[key] = clean_(payload[key]);
  });
  if (payload.active !== undefined) patch.active = bool_(payload.active);
  updateByRow_("products", row.row, patch);
  clearPublicCache_();
  audit_(auth.email, "product_schedule_updated", "product", payload.product_id, patch);
  return ok_(adminProductById_(payload.product_id));
}

function getCollectionsAdmin(payload) {
  requireStaff_(payload);
  return ok_(rows_("collections").sort(sortCreatedDesc_).map(collectionOut_));
}

function getCollectionsPublic() {
  return ok_(
    rows_("collections")
      .filter(function (c) {
        var state = scheduleState_(c.start_at, c.end_at, c.status);
        return bool_(c.active) && !bool_(c.archived) && (state === "live" || state === "scheduled");
      })
      .sort(sortCreatedDesc_)
      .map(collectionOut_),
  );
}

function createCollection(payload) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, ["name"]);
  var collection = collectionPatch_(payload);
  collection.collection_id = id_("COL");
  collection.created_at = now_();
  collection.updated_at = now_();
  append_("collections", collection);
  clearPublicCache_();
  audit_(auth.email, "collection_created", "collection", collection.collection_id, collection);
  return ok_(collectionOut_(collection));
}

function updateCollection(payload) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, ["collection_id"]);
  var row = findRow_("collections", "collection_id", payload.collection_id);
  if (!row) throw err_("Collectie niet gevonden.", 404);
  var patch = collectionPatch_(merge_(row.record, payload));
  patch.updated_at = now_();
  updateByRow_("collections", row.row, patch);
  clearPublicCache_();
  audit_(auth.email, "collection_updated", "collection", payload.collection_id, patch);
  return ok_(collectionOut_(findRow_("collections", "collection_id", payload.collection_id).record));
}

function archiveCollection(payload) {
  return archiveScheduleRow_(payload, "collections", "collection_id", "collection");
}

function getScheduledActionsAdmin(payload) {
  requireStaff_(payload);
  return ok_(rows_("scheduled_actions").sort(sortCreatedDesc_).map(actionOut_));
}

function getActiveScheduledActionsPublic() {
  return ok_(activeScheduledActions_().map(actionOut_));
}

function createScheduledAction(payload) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, ["name", "action_type", "starts_at", "ends_at"]);
  var action = actionPatch_(payload);
  action.action_id = id_("ACT");
  action.created_at = now_();
  action.updated_at = now_();
  append_("scheduled_actions", action);
  clearPublicCache_();
  audit_(auth.email, "scheduled_action_created", "scheduled_action", action.action_id, action);
  return ok_(actionOut_(action));
}

function updateScheduledAction(payload) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, ["action_id"]);
  var row = findRow_("scheduled_actions", "action_id", payload.action_id);
  if (!row) throw err_("Actie niet gevonden.", 404);
  var patch = actionPatch_(merge_(row.record, payload));
  patch.updated_at = now_();
  updateByRow_("scheduled_actions", row.row, patch);
  clearPublicCache_();
  audit_(auth.email, "scheduled_action_updated", "scheduled_action", payload.action_id, patch);
  return ok_(actionOut_(findRow_("scheduled_actions", "action_id", payload.action_id).record));
}

function archiveScheduledAction(payload) {
  return archiveScheduleRow_(payload, "scheduled_actions", "action_id", "scheduled_action");
}

function bulkUpdateScheduledActions(payload) {
  var auth = requireStaff_(payload);
  var ids = bulkIds_(payload, "action_ids");
  if (!ids.length) throw err_("Geen planning-items geselecteerd.", 400);
  var patch = { updated_at: now_() };
  if (payload.status !== undefined && clean_(payload.status) !== "") patch.status = clean_(payload.status);
  if (payload.active !== undefined && clean_(payload.active) !== "") patch.active = bool_(payload.active);
  if (payload.archived !== undefined && clean_(payload.archived) !== "") patch.archived = bool_(payload.archived);
  if (patch.archived) {
    patch.status = "archived";
    patch.active = false;
  }
  var items = [];
  var errors = [];
  ids.forEach(function (id) {
    try {
      var row = findRow_("scheduled_actions", "action_id", id);
      if (!row) throw err_("Planning niet gevonden.", 404);
      updateByRow_("scheduled_actions", row.row, patch);
      items.push(actionOut_(findRow_("scheduled_actions", "action_id", id).record));
    } catch (error) {
      errors.push({ action_id: id, message: error.message });
    }
  });
  clearPublicCache_();
  audit_(auth.email, "scheduled_actions_bulk_updated", "scheduled_action", "bulk", patch);
  return ok_({ updated: items.length, errors: errors, items: items });
}

function archiveScheduleRow_(payload, sheetName, idField, targetType) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, [idField]);
  var row = findRow_(sheetName, idField, payload[idField]);
  if (!row) throw err_("Planning item niet gevonden.", 404);
  updateByRow_(sheetName, row.row, {
    active: false,
    archived: true,
    status: "archived",
    updated_at: now_(),
  });
  clearPublicCache_();
  audit_(auth.email, targetType + "_archived", targetType, payload[idField], {});
  return ok_({ id: payload[idField], archived: true });
}

function getOrders(payload) {
  requireStaff_(payload);
  payload = payload || {};
  var includeArchived = bool_(payload.include_archived) || clean_(payload.status) === "archived";
  var orders = rows_("orders").filter(function (o) {
    if (!includeArchived && bool_(o.archived)) return false;
    if (payload.payment_status && !same_(o.payment_status, payload.payment_status)) return false;
    if (payload.fulfillment_status && !same_(o.fulfillment_status, payload.fulfillment_status)) return false;
    if (clean_(payload.status) === "archived") return bool_(o.archived);
    return true;
  });
  return ok_(orders.sort(sortCreatedDesc_));
}

function getNewOrders(payload) {
  requireStaff_(payload);
  return ok_(
    rows_("orders")
      .filter(function (o) {
        if (bool_(o.archived)) return false;
        return (
          ["pending", "payment_link_sent", "failed"].indexOf(clean_(o.payment_status)) !== -1 ||
          ["pending", "processing", "packed"].indexOf(clean_(o.fulfillment_status)) !== -1
        );
      })
      .sort(sortCreatedDesc_),
  );
}

function getArchivedOrders(payload) {
  requireStaff_(payload);
  return ok_(
    rows_("orders")
      .filter(function (o) {
        return bool_(o.archived);
      })
      .sort(sortCreatedDesc_),
  );
}

function getOrderDetails(payload) {
  requireStaff_(payload);
  validateRequired_(payload, ["order_id"]);
  var order = findRow_("orders", "order_id", payload.order_id);
  if (!order) throw err_("Order niet gevonden.", 404);
  var out = order.record;
  out.items = rows_("order_items").filter(function (i) {
    return same_(i.order_id, payload.order_id);
  });
  out.email_history = rows_("email_log")
    .filter(function (e) {
      return same_(e.order_id, payload.order_id);
    })
    .sort(sortCreatedDesc_);
  out.mail_status = orderMailStatus_(out.email_history);
  return ok_(out);
}

function updatePaymentStatus(payload) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, ["order_id", "payment_status"]);
  var status = clean_(payload.payment_status);
  var result = updateOrder_(payload.order_id, {
    payment_status: clean_(payload.payment_status),
    paid: status === "paid",
    payment_link: clean_(payload.payment_link),
    updated_at: now_(),
  });
  var order = getOrderRecord_(payload.order_id);
  if (clean_(payload.payment_link) && status === "payment_link_sent") {
    sendOrderMailByType_(order, "payment_link_sent");
  }
  if (status === "paid") {
    sendOrderMailByType_(order, "payment_paid");
  }
  audit_(auth.email, "payment_status_updated", "order", payload.order_id, {
    payment_status: status,
    payment_link: clean_(payload.payment_link),
  });
  return result;
}

function updateFulfillmentStatus(payload) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, ["order_id", "fulfillment_status"]);
  var status = clean_(payload.fulfillment_status);
  var result = updateOrder_(payload.order_id, {
    fulfillment_status: clean_(payload.fulfillment_status),
    track_trace: clean_(payload.track_trace),
    updated_at: now_(),
  });
  var order = getOrderRecord_(payload.order_id);
  if (status === "shipped" || clean_(payload.track_trace)) {
    sendOrderMailByType_(order, "fulfillment_shipped");
  }
  audit_(auth.email, "fulfillment_status_updated", "order", payload.order_id, {
    fulfillment_status: status,
    track_trace: clean_(payload.track_trace),
  });
  return result;
}

function updateOrder_(orderId, patch) {
  var row = findRow_("orders", "order_id", orderId);
  if (!row) throw err_("Order niet gevonden.", 404);
  updateByRow_("orders", row.row, patch);
  var updated = findRow_("orders", "order_id", orderId).record;
  updated.items = rows_("order_items").filter(function (i) {
    return same_(i.order_id, orderId);
  });
  updated.email_history = rows_("email_log")
    .filter(function (e) {
      return same_(e.order_id, orderId);
    })
    .sort(sortCreatedDesc_);
  updated.mail_status = orderMailStatus_(updated.email_history);
  return ok_(updated);
}

function getOrderRecord_(orderId) {
  var row = findRow_("orders", "order_id", orderId);
  if (!row) throw err_("Order niet gevonden.", 404);
  return row.record;
}

function resendOrderEmail(payload) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, ["order_id", "template"]);
  var order = getOrderRecord_(payload.order_id);
  sendOrderMailByType_(order, clean_(payload.template));
  audit_(auth.email, "order_email_resent", "order", payload.order_id, { template: payload.template });
  return getOrderDetails(payload);
}

function sendPaymentLinkEmail(payload) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, ["order_id"]);
  var order = getOrderRecord_(payload.order_id);
  if (payload.payment_link !== undefined) {
    var row = findRow_("orders", "order_id", payload.order_id);
    updateByRow_("orders", row.row, {
      payment_link: clean_(payload.payment_link),
      payment_status: "payment_link_sent",
      updated_at: now_(),
    });
    order = getOrderRecord_(payload.order_id);
  }
  if (!clean_(order.payment_link)) throw err_("Voeg eerst een betaallink toe.", 400);
  sendOrderMailByType_(order, "payment_link_sent");
  audit_(auth.email, "payment_link_email_sent", "order", payload.order_id, {});
  return getOrderDetails(payload);
}

function orderMailStatus_(emails) {
  var map = {
    order_created: { label: "Orderbevestiging", sent: false, at: "" },
    payment_link_sent: { label: "Betaallinkmail", sent: false, at: "" },
    payment_paid: { label: "Betaalbevestiging", sent: false, at: "" },
    fulfillment_shipped: { label: "Verzendmail", sent: false, at: "" },
  };
  (emails || []).forEach(function (email) {
    var type = clean_(email.type);
    if (map[type] && clean_(email.status) === "sent" && !map[type].sent) {
      map[type].sent = true;
      map[type].at = email.created_at;
    }
  });
  return map;
}

function archiveOrder(payload) {
  requireStaff_(payload);
  validateRequired_(payload, ["order_id"]);
  return updateOrder_(payload.order_id, { archived: true, archived_at: now_(), updated_at: now_() });
}

function restoreOrder(payload) {
  requireStaff_(payload);
  validateRequired_(payload, ["order_id"]);
  return updateOrder_(payload.order_id, { archived: false, archived_at: "", updated_at: now_() });
}

function completedOrder_(o) {
  return clean_(o.payment_status) === "paid" && ["delivered", "picked_up"].indexOf(clean_(o.fulfillment_status)) !== -1;
}

function archiveCompletedOrders(payload) {
  var auth = requireStaff_(payload);
  var archived = [];
  rows_("orders").forEach(function (o) {
    if (bool_(o.archived) || !completedOrder_(o)) return;
    var row = findRow_("orders", "order_id", o.order_id);
    if (row) {
      updateByRow_("orders", row.row, { archived: true, archived_at: now_(), updated_at: now_() });
      archived.push(o.order_id);
    }
  });
  audit_(auth.email, "completed_orders_archived", "order", "bulk", { archived: archived });
  return ok_({ archived: archived.length, order_ids: archived });
}

function bulkArchiveOrders(payload) {
  var auth = requireStaff_(payload);
  var ids = bulkIds_(payload, "order_ids");
  if (!ids.length) throw err_("Geen orders geselecteerd.", 400);
  var archived = [];
  var errors = [];
  ids.forEach(function (id) {
    try {
      var row = findRow_("orders", "order_id", id);
      if (!row) throw err_("Order niet gevonden.", 404);
      updateByRow_("orders", row.row, { archived: true, archived_at: now_(), updated_at: now_() });
      archived.push(id);
    } catch (error) {
      errors.push({ order_id: id, message: error.message });
    }
  });
  audit_(auth.email, "orders_archived_bulk", "order", "bulk", { archived: archived, errors: errors });
  return ok_({ archived: archived.length, order_ids: archived, errors: errors });
}

function ensureDatabase_(force) {
  var cache = CacheService.getScriptCache();
  if (!force && cache.get("db_ready_" + APP.VERSION) === "1") return;
  var ss = SpreadsheetApp.getActive();
  Object.keys(APP.SHEETS).forEach(function (name) {
    var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    ensureHeaders_(sheet, APP.SHEETS[name]);
  });
  var settings = getSettingsMap_();
  Object.keys(APP.DEFAULT_SETTINGS).forEach(function (k) {
    if (settings[k] === undefined) setSetting_(k, APP.DEFAULT_SETTINGS[k]);
  });
  var company = rawCompanyMap_();
  Object.keys(APP.DEFAULT_COMPANY).forEach(function (k) {
    if (company[k] === undefined) setCompany_(k, APP.DEFAULT_COMPANY[k]);
  });
  ensureOwner_();
  ensureProductIds_();
  cache.put("db_ready_" + APP.VERSION, "1", 600);
}

function ensureProductIds_() {
  var sheet = sheet_("products");
  var headers = getHeaders_(sheet);
  var productIdx = headers.indexOf("product_id");
  var idIdx = headers.indexOf("id");
  if (productIdx === -1 && idIdx === -1) return 0;
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var values = sheet.getRange(2, 1, last - 1, headers.length).getValues();
  var changed = 0;
  values.forEach(function (row, i) {
    var productId = clean_(productIdx !== -1 ? row[productIdx] : "");
    var legacyId = clean_(idIdx !== -1 ? row[idIdx] : "");
    if (productId && legacyId) return;
    var hasContent = row.some(function (cell) {
      return clean_(cell);
    });
    if (!hasContent) return;
    var generated = productId || legacyId || id_("PROD");
    if (productIdx !== -1 && !productId) sheet.getRange(i + 2, productIdx + 1).setValue(generated);
    if (idIdx !== -1 && !legacyId) sheet.getRange(i + 2, idIdx + 1).setValue(generated);
    changed++;
  });
  if (changed) clearPublicCache_();
  return changed;
}

function ensureProductIdsCached_() {
  var cache = CacheService.getScriptCache();
  if (cache.get("product_ids_checked_" + APP.VERSION) === "1") return;
  ensureProductIds_();
  cache.put("product_ids_checked_" + APP.VERSION, "1", 60);
}

function ensureHeaders_(sheet, required) {
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, required.length).setValues([required]);
  var headers = getHeaders_(sheet);
  var changed = false;
  required.forEach(function (h) {
    if (headers.indexOf(h) === -1) {
      headers.push(h);
      changed = true;
    }
  });
  if (changed) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
}

function ensureOwner_() {
  if (findRow_("staff", "email", APP.DEFAULT_ADMIN.email)) return;
  append_("staff", {
    staff_id: id_("OWN"),
    created_at: now_(),
    updated_at: now_(),
    name: APP.DEFAULT_ADMIN.name,
    email: APP.DEFAULT_ADMIN.email,
    password_hash: hashPassword_(APP.DEFAULT_ADMIN.password),
    role: "owner",
    permissions: "*",
    active: true,
    last_login: "",
  });
}

function publicProduct_(p, ctx) {
  ctx = ctx || productContext_();
  var id = productId_(p);
  var original = money_(p.retail_price || p.sell_price || p.price_inc_vat);
  var pricing = publicPrice_(p, id, ctx);
  var images = productImages_(id, p, ctx);
  var variants = productVariants_(id, p, ctx);
  var stock = productStock_(id, p, ctx);
  return {
    product_id: id,
    id: id,
    name: p.name,
    brand: p.brand || "MA Fashion",
    category: p.category,
    description: p.description,
    sizes: variants.length
      ? variants.map(function (v) {
          return v.size;
        })
      : split_(p.sizes),
    variants: variants,
    sku: p.sku,
    status: p.status,
    active: bool_(p.active),
    featured: bool_(p.featured),
    schedule_state: productScheduleState_(p),
    visible_from: p.visible_from,
    visible_until: p.visible_until,
    launch_badge_text: p.launch_badge_text,
    stock: stock,
    availability_status: stock > 0 ? "in_stock" : "on_request",
    availability_label: stock > 0 ? "Op voorraad" : "Op aanvraag",
    price: pricing.price,
    sell_price: pricing.base,
    retail_price: original,
    original_price: original,
    image_url: images.length ? images[0].url : "",
    image: images.length ? images[0].url : "",
    images: images,
    discount_type: p.discount_type || "none",
    discount_value: num_(p.discount_value),
    scheduled_action: pricing.action,
    drive_folder_id: p.drive_folder_id,
    drive_folder_url: p.drive_folder_url,
  };
}

function productContext_() {
  if (typeof APP_RUNTIME === "undefined") APP_RUNTIME = {};
  if (APP_RUNTIME.productContext) return APP_RUNTIME.productContext;
  var imagesByProduct = {};
  rows_("product_images").forEach(function (image) {
    var id = clean_(image.product_id);
    if (!id) return;
    if (!imagesByProduct[id]) imagesByProduct[id] = [];
    imagesByProduct[id].push(image);
  });
  var variantsByProduct = {};
  rows_("product_variants").forEach(function (variant) {
    var id = clean_(variant.product_id);
    if (!id) return;
    if (!variantsByProduct[id]) variantsByProduct[id] = [];
    variantsByProduct[id].push(variant);
  });
  APP_RUNTIME.productContext = {
    imagesByProduct: imagesByProduct,
    variantsByProduct: variantsByProduct,
    actions: activeScheduledActions_({ skipContext: true }),
    collections: rows_("collections"),
  };
  return APP_RUNTIME.productContext;
}

function resetRuntimeCache_() {
  if (typeof APP_RUNTIME !== "undefined") APP_RUNTIME = {};
}

function productId_(product) {
  return clean_(product && (product.product_id || product.id));
}

function productVariants_(productId, product, ctx) {
  ctx = ctx || productContext_();
  var source = ctx.variantsByProduct ? ctx.variantsByProduct[clean_(productId)] || [] : rows_("product_variants");
  var variants = source
    .filter(function (v) {
      return same_(v.product_id, productId) && (v.active === "" || bool_(v.active));
    })
    .sort(sortOrder_)
    .map(function (v) {
      return {
        variant_id: v.variant_id,
        size: clean_(v.size),
        stock: Math.max(0, Math.floor(num_(v.stock))),
        availability_status: num_(v.stock) > 0 ? "in_stock" : "on_request",
        availability_label: num_(v.stock) > 0 ? "Op voorraad" : "Op aanvraag",
        sort_order: num_(v.sort_order),
        active: true,
      };
    })
    .filter(function (v) {
      return v.size;
    });
  if (variants.length || !product) return variants;
  return split_(product.sizes).map(function (size, index) {
    return {
      variant_id: "",
      size: size,
      stock: Math.max(0, Math.floor(num_(product.stock))),
      sort_order: index + 1,
      active: true,
    };
  });
}

function findActiveVariant_(productId, size) {
  size = clean_(size);
  if (!size) return null;
  var variant = rows_("product_variants").filter(function (v) {
    return same_(v.product_id, productId) && same_(v.size, size) && (v.active === "" || bool_(v.active));
  })[0];
  return variant ? findRow_("product_variants", "variant_id", variant.variant_id) : null;
}

function parseVariants_(value, legacySizes) {
  var list = [];
  if (Array.isArray(value)) list = value;
  else if (clean_(value)) {
    try {
      list = JSON.parse(value);
    } catch (error) {
      list = clean_(value).split(",").map(function (part) {
        var bits = part.split(":");
        return { size: bits[0], stock: bits[1] };
      });
    }
  } else {
    list = split_(legacySizes).map(function (size) {
      return { size: size, stock: 0 };
    });
  }
  var seen = {};
  return list
    .map(function (v, index) {
      if (typeof v === "string") v = { size: v, stock: 0 };
      var size = clean_(v.size || v.label);
      var key = size.toLowerCase();
      if (!size || seen[key]) return null;
      seen[key] = true;
      return {
        size: size,
        stock: Math.max(0, Math.floor(num_(v.stock))),
        sort_order: index + 1,
        active: v.active === undefined ? true : bool_(v.active),
      };
    })
    .filter(Boolean);
}

function replaceProductVariants_(productId, variants) {
  variants = variants || [];
  var existing = rows_("product_variants").filter(function (v) {
    return same_(v.product_id, productId);
  });
  var kept = {};
  variants.forEach(function (variant, index) {
    var found = existing.filter(function (v) {
      return same_(v.size, variant.size);
    })[0];
    kept[clean_(variant.size).toLowerCase()] = true;
    var patch = {
      size: variant.size,
      stock: Math.max(0, Math.floor(num_(variant.stock))),
      sort_order: variant.sort_order || index + 1,
      active: variant.active === undefined ? true : bool_(variant.active),
      updated_at: now_(),
    };
    if (found) updateByRow_("product_variants", findRow_("product_variants", "variant_id", found.variant_id).row, patch);
    else
      append_("product_variants", merge_(patch, {
        variant_id: id_("VAR"),
        product_id: productId,
        created_at: now_(),
      }));
  });
  existing.forEach(function (v) {
    if (kept[clean_(v.size).toLowerCase()]) return;
    var row = findRow_("product_variants", "variant_id", v.variant_id);
    if (row) updateByRow_("product_variants", row.row, { active: false, updated_at: now_() });
  });
}

function productStock_(productId, product, ctx) {
  var variants = productVariants_(productId, product, ctx);
  if (variants.length)
    return variants.reduce(function (total, v) {
      return total + num_(v.stock);
    }, 0);
  return Math.max(0, Math.floor(num_(product && product.stock)));
}

function updateProductStock_(productId) {
  var row = findRowAny_("products", ["product_id", "id"], productId);
  if (!row) return;
  resetRuntimeCache_();
  var stock = productStock_(productId, row.record);
  updateByRow_("products", row.row, { stock: stock, updated_at: now_() });
}

function productImages_(productId, product, ctx) {
  ctx = ctx || productContext_();
  var source = ctx.imagesByProduct ? ctx.imagesByProduct[clean_(productId)] || [] : rows_("product_images");
  var images = source
    .filter(function (i) {
      return same_(i.product_id, productId) && (i.active === "" || bool_(i.active));
    })
    .sort(function (a, b) {
      return num_(a.sort_order) - num_(b.sort_order);
    })
    .map(function (i) {
      var id = clean_(i.drive_file_id);
      return {
        image_id: i.image_id,
        url: clean_(i.image_url) || (id ? driveImageUrl_(id) : ""),
        thumbnail_url: id ? driveThumbUrl_(id) : clean_(i.image_url),
        drive_file_id: id,
      };
    });
  if (product && product.image_url)
    images.unshift({
      image_id: "main",
      url: convertDriveUrl_(product.image_url),
      thumbnail_url: convertDriveThumb_(product.image_url),
      drive_file_id: extractDriveId_(product.image_url),
    });
  return images.filter(function (i) {
    return clean_(i.url);
  });
}

function productPricing_(payload) {
  var vatEnabled =
    payload.vat_enabled === undefined || clean_(payload.vat_enabled) === ""
      ? true
      : bool_(payload.vat_enabled);
  var vatRate = num_(payload.vat_percentage || getCompanyMap_().vat_percentage || 21);
  var sell = money_(
    payload.sell_price !== undefined && clean_(payload.sell_price) !== ""
      ? payload.sell_price
      : payload.price_inc_vat,
  );
  var cost = money_(payload.cost_price);
  return {
    cost_price: cost,
    sell_price: sell,
    price_ex_vat: vatEnabled ? money_(sell / (1 + vatRate / 100)) : sell,
    price_inc_vat: sell,
    vat_enabled: vatEnabled,
    vat_percentage: vatRate,
  };
}

function ensureProductFolder_(productId, productName) {
  var settings = getSettingsMap_();
  var root = null;
  try {
    if (settings.drive_products_root_folder_id)
      root = DriveApp.getFolderById(settings.drive_products_root_folder_id);
  } catch (e) {
    root = null;
  }
  if (!root) {
    var name = "Producten - MA Fashion - " + shortCode_();
    root = DriveApp.createFolder(name);
    setSetting_("drive_products_root_folder_id", root.getId());
    setSetting_("drive_products_root_folder_name", name);
  }
  try {
    root.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e2) {
    console.error(e2);
  }
  var folder = root.createFolder(clean_(productName) + " - " + productId);
  try {
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e3) {
    console.error(e3);
  }
  return { id: folder.getId(), url: folder.getUrl() };
}

function appendProductImageIfPresent_(productId, payload) {
  var value = clean_(payload.drive_file_id || payload.image_url);
  if (!value) return;
  var id = extractDriveId_(value);
  append_("product_images", {
    image_id: id_("IMG"),
    product_id: productId,
    drive_file_id: id,
    image_url: id ? driveImageUrl_(id) : value,
    alt_text: clean_(payload.name),
    sort_order: Math.floor(num_(payload.sort_order)),
    active: true,
    created_at: now_(),
  });
}

function proofPatch_(payload) {
  var imageValue = clean_(payload.drive_file_id || payload.image_url);
  var driveId = extractDriveId_(imageValue);
  return {
    image_url: driveId ? driveImageUrl_(driveId) : imageValue,
    drive_file_id: driveId,
    customer_name: clean_(payload.customer_name),
    link_url: clean_(payload.link_url),
    product_name: clean_(payload.product_name),
    badge_text: clean_(payload.badge_text || "Binnenkort"),
    quote: clean_(payload.quote),
    review_date: clean_(payload.review_date),
    sort_order: Math.floor(num_(payload.sort_order)),
    active: payload.active === undefined ? true : bool_(payload.active),
    archived: bool_(payload.archived),
  };
}

function publicProofReview_(proof) {
  var driveId = clean_(proof.drive_file_id) || extractDriveId_(proof.image_url);
  return {
    proof_id: proof.proof_id,
    image_url: clean_(proof.image_url) || (driveId ? driveImageUrl_(driveId) : ""),
    thumbnail_url: driveId ? driveThumbUrl_(driveId) : clean_(proof.image_url),
    customer_name: proof.customer_name,
    link_url: proof.link_url,
    product_name: proof.product_name,
    badge_text: proof.badge_text || "Binnenkort",
    quote: proof.quote,
    review_date: proof.review_date,
    sort_order: num_(proof.sort_order),
    active: proof.active === "" || bool_(proof.active),
    archived: bool_(proof.archived),
  };
}

function collectionPatch_(payload) {
  return {
    name: clean_(payload.name),
    description: clean_(payload.description),
    product_ids: normalizeIds_(payload.product_ids),
    start_at: clean_(payload.start_at),
    end_at: clean_(payload.end_at),
    status: clean_(payload.status || "draft"),
    badge_text: clean_(payload.badge_text),
    active: payload.active === undefined ? true : bool_(payload.active),
    archived: bool_(payload.archived),
  };
}

function collectionOut_(c) {
  var out = merge_(c, {});
  out.product_ids = splitIds_(c.product_ids);
  out.schedule_state = scheduleState_(c.start_at, c.end_at, c.status);
  out.active = c.active === "" || bool_(c.active);
  out.archived = bool_(c.archived);
  return out;
}

function actionPatch_(payload) {
  var type = clean_(payload.action_type || "discount");
  var discountType = clean_(payload.discount_type || (type === "fixed" ? "fixed" : "percent"));
  if (["discount", "percent", "fixed", "free_shipping", "custom"].indexOf(type) === -1)
    throw err_("Ongeldig actietype.", 400);
  if (["percent", "fixed", "none"].indexOf(discountType) === -1)
    throw err_("Ongeldig kortingstype.", 400);
  return {
    name: clean_(payload.name),
    action_type: type,
    discount_type: discountType,
    discount_value: money_(payload.discount_value),
    discount_code: clean_(payload.discount_code),
    target_type: clean_(payload.target_type || "all"),
    target_ids: normalizeIds_(payload.target_ids),
    starts_at: clean_(payload.starts_at),
    ends_at: clean_(payload.ends_at),
    frontend_text: clean_(payload.frontend_text),
    status: clean_(payload.status || "scheduled"),
    active: payload.active === undefined ? true : bool_(payload.active),
    archived: bool_(payload.archived),
  };
}

function actionOut_(a) {
  var out = merge_(a, {});
  out.target_ids = splitIds_(a.target_ids);
  out.schedule_state = scheduleState_(a.starts_at, a.ends_at, a.status);
  out.active = a.active === "" || bool_(a.active);
  out.archived = bool_(a.archived);
  return out;
}

function publicCustomerReview_(review) {
  return {
    review_id: review.review_id,
    name: review.name,
    rating: Math.max(1, Math.min(5, Math.floor(num_(review.rating)))),
    message: review.message,
    created_at: review.created_at,
  };
}

function adminCustomerReview_(review) {
  var out = merge_(review, {});
  out.rating = Math.max(1, Math.min(5, Math.floor(num_(review.rating))));
  out.active = bool_(review.active);
  out.archived = bool_(review.archived);
  return out;
}

function sendSimpleEmail_(to, subject, html, type, targetId) {
  var company = getCompanyMap_();
  try {
    MailApp.sendEmail({
      to: to,
      subject: subject,
      htmlBody: html,
      name: clean_(company.company_name || "MA Fashion"),
    });
    append_("email_log", {
      email_id: id_("EML"),
      created_at: now_(),
      order_id: "",
      to: to,
      subject: subject,
      type: type,
      status: "sent",
      error: "",
    });
  } catch (e) {
    append_("email_log", {
      email_id: id_("EML"),
      created_at: now_(),
      order_id: "",
      to: to,
      subject: subject,
      type: type,
      status: "failed",
      error: e.message,
    });
  }
}

function sendOrderMail_(order) {
  return sendOrderMailByType_(order, "order_created");
}

function sendOrderMailByType_(order, type) {
  var company = getCompanyMap_();
  var items = rows_("order_items").filter(function (item) {
    return same_(item.order_id, order.order_id);
  });
  var templates = {
    order_created: {
      subject: "We hebben je bestelling ontvangen - " + order.order_id,
      title: "Bedankt voor je bestelling bij Mafash",
      intro:
        "We hebben je order goed ontvangen. Je bestelling wordt nu gecontroleerd en verwerkt. Je ontvangt binnenkort een tweede e-mail met de betaallink om je bestelling af te ronden.",
      cta: "",
    },
    payment_link_sent: {
      subject: "Betaallink voor je Mafash bestelling - " + order.order_id,
      title: "Je bestelling is verwerkt",
      intro:
        "Je order is gecontroleerd. Gebruik de betaallink hieronder om je bestelling veilig af te ronden. Na betaling maken we je bestelling verder klaar.",
      cta: "Betaal je bestelling",
    },
    payment_paid: {
      subject: "Betaling ontvangen - " + order.order_id,
      title: "Betaling ontvangen",
      intro:
        "Dank je wel. We hebben je betaling ontvangen en maken je bestelling nu klaar voor verzending of afhalen.",
      cta: "",
    },
    fulfillment_shipped: {
      subject: "Je Mafash bestelling is verzonden - " + order.order_id,
      title: "Je bestelling is onderweg",
      intro:
        "Je bestelling is verzonden. Hieronder vind je de track & trace als die beschikbaar is.",
      cta: "Volg je bestelling",
    },
  };
  var tpl = templates[type] || templates.order_created;
  var rows = [
    ["Ordernummer", order.order_id],
    ["Naam", order.customer_name],
    ["E-mail", order.email],
    ["Telefoon", order.phone],
    ["Adres", [order.address, order.customer_postal_code, order.customer_city].filter(clean_).join(" ")],
    ["Totaal", "EUR " + money_(order.total_price).toFixed(2)],
    ["BTW", "EUR " + money_(order.vat_amount).toFixed(2)],
    ["Verzending", "EUR " + money_(order.shipping_cost).toFixed(2)],
    ["Betaallink", order.payment_link],
    ["Track & trace", order.track_trace],
  ];
  var detailRows = rows
    .filter(function (row) {
      return clean_(row[1]);
    })
    .map(function (row) {
      var value = /^https?:\/\//i.test(clean_(row[1]))
        ? "<a href='" + esc_(row[1]) + "'>" + esc_(row[1]) + "</a>"
        : esc_(row[1]);
      return "<tr><td style='padding:8px 0;color:#667085'>" + esc_(row[0]) + "</td><td style='padding:8px 0;text-align:right;font-weight:700'>" + value + "</td></tr>";
    })
    .join("");
  var itemRows = items
    .map(function (item) {
      var size = clean_(item.size) ? " · maat " + esc_(item.size) : "";
      return "<tr><td style='padding:8px 0'>" + esc_(item.product_name) + size + " x " + esc_(item.quantity) + "</td><td style='padding:8px 0;text-align:right'>EUR " + money_(item.line_total).toFixed(2) + "</td></tr>";
    })
    .join("");
  var ctaUrl =
    type === "payment_link_sent" ? clean_(order.payment_link) : type === "fulfillment_shipped" ? clean_(order.track_trace) : "";
  var cta =
    ctaUrl && tpl.cta
      ? "<p style='margin:22px 0'><a href='" +
        esc_(ctaUrl) +
        "' style='display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700'>" +
        esc_(tpl.cta) +
        "</a></p>"
      : "";
  var html =
    "<div style='font-family:Arial,sans-serif;background:#f7f5ef;padding:24px;color:#141414'>" +
    "<div style='max-width:680px;margin:0 auto;background:#fff;border:1px solid #e7e0d4;border-radius:12px;overflow:hidden'>" +
    "<div style='padding:22px 24px;background:#111827;color:#fff'><div style='font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.75'>Mafash</div><h1 style='margin:8px 0 0;font-size:24px'>" +
    esc_(tpl.title) +
    "</h1></div><div style='padding:24px'><p style='font-size:15px;line-height:1.6;margin-top:0'>Hallo " +
    esc_(order.customer_name) +
    ",</p><p style='font-size:15px;line-height:1.6'>" +
    esc_(tpl.intro) +
    "</p>" +
    cta +
    "<table style='width:100%;border-collapse:collapse;border-top:1px solid #eaecf0;border-bottom:1px solid #eaecf0;margin:18px 0'>" +
    detailRows +
    "</table>" +
    (itemRows
      ? "<h2 style='font-size:16px;margin:22px 0 8px'>Producten</h2><table style='width:100%;border-collapse:collapse'>" +
        itemRows +
        "</table>"
      : "") +
    "<p style='margin-top:24px;color:#667085;font-size:13px;line-height:1.5'>" +
    esc_(company.company_name || "MA Fashion") +
    "</p><p style='margin-top:18px;color:#667085;font-size:12px'>" +
    esc_(company.credit_text) +
    " - <a href='" +
    esc_(company.credit_url) +
    "'>" +
    esc_(company.credit_label) +
    "</a></p></div></div></div>";
  try {
    MailApp.sendEmail({
      to: order.email,
      subject: tpl.subject,
      htmlBody: html,
      name: clean_(company.company_name || "MA Fashion"),
    });
    append_("email_log", {
      email_id: id_("EML"),
      created_at: now_(),
      order_id: order.order_id,
      to: order.email,
      subject: tpl.subject,
      type: type,
      status: "sent",
      error: "",
    });
  } catch (e) {
    append_("email_log", {
      email_id: id_("EML"),
      created_at: now_(),
      order_id: order.order_id,
      to: order.email,
      subject: tpl.subject,
      type: type,
      status: "failed",
      error: e.message,
    });
  }
}

function rows_(sheetName) {
  var sheet = sheet_(sheetName);
  var headers = getHeaders_(sheet);
  if (sheet.getLastRow() < 2) return [];
  return sheet
    .getRange(2, 1, sheet.getLastRow() - 1, headers.length)
    .getValues()
    .map(function (row) {
      var obj = {};
      headers.forEach(function (h, i) {
        obj[h] = row[i];
      });
      return obj;
    });
}

function append_(sheetName, object) {
  var sheet = sheet_(sheetName);
  var headers = getHeaders_(sheet);
  sheet.appendRow(
    headers.map(function (h) {
      return cell_(object[h]);
    }),
  );
}

function updateByRow_(sheetName, rowNumber, patch) {
  var sheet = sheet_(sheetName);
  var headers = getHeaders_(sheet);
  Object.keys(patch).forEach(function (k) {
    var idx = headers.indexOf(k);
    if (idx !== -1) sheet.getRange(rowNumber, idx + 1).setValue(cell_(patch[k]));
  });
}

function findRow_(sheetName, field, value) {
  var sheet = sheet_(sheetName);
  var headers = getHeaders_(sheet);
  var idx = headers.indexOf(field);
  if (idx === -1 || sheet.getLastRow() < 2) return null;
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
  for (var i = 0; i < values.length; i++) {
    if (same_(values[i][idx], value)) {
      var obj = {};
      headers.forEach(function (h, j) {
        obj[h] = values[i][j];
      });
      return { row: i + 2, record: obj };
    }
  }
  return null;
}

function findRowAny_(sheetName, fields, value) {
  for (var i = 0; i < fields.length; i++) {
    var found = findRow_(sheetName, fields[i], value);
    if (found) return found;
  }
  return null;
}

function sheet_(name) {
  return (
    SpreadsheetApp.getActive().getSheetByName(name) || SpreadsheetApp.getActive().insertSheet(name)
  );
}

function getHeaders_(sheet) {
  return sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0].map(clean_);
}

function getSettingsMap_() {
  var map = {};
  rows_("settings").forEach(function (r) {
    if (r.key) map[clean_(r.key)] = clean_(r.value);
  });
  return map;
}

function rawCompanyMap_() {
  var map = {};
  rows_("bedrijf").forEach(function (r) {
    if (r.key) map[clean_(r.key)] = clean_(r.value);
  });
  return map;
}

function getCompanyMap_() {
  var map = rawCompanyMap_();
  Object.keys(APP.DEFAULT_COMPANY).forEach(function (k) {
    if (map[k] === undefined) map[k] = APP.DEFAULT_COMPANY[k];
  });
  map.credit_enabled = "true";
  map.credit_text = APP.DEFAULT_COMPANY.credit_text;
  map.credit_url = APP.DEFAULT_COMPANY.credit_url;
  map.credit_label = APP.DEFAULT_COMPANY.credit_label;
  return map;
}

function setSetting_(key, value) {
  var row = findRow_("settings", "key", key);
  if (row) updateByRow_("settings", row.row, { value: value });
  else append_("settings", { key: key, value: value });
}

function setCompany_(key, value) {
  var row = findRow_("bedrijf", "key", key);
  if (row) updateByRow_("bedrijf", row.row, { value: value });
  else append_("bedrijf", { key: key, value: value });
}

function requireStaff_(payload) {
  payload = payload || {};
  if (payload && payload._skip_auth) return { email: "system", staff: {} };
  var token = clean_(payload.token || payload.auth_token || payload.session_token);
  if (!token) throw err_("Login vereist.", 401);
  var session = findRow_("sessions", "token", token);
  if (
    !session ||
    !bool_(session.record.active) ||
    new Date(session.record.expires_at).getTime() < Date.now()
  )
    throw err_("Sessie verlopen.", 401);
  var staff = findRow_("staff", "staff_id", session.record.actor_id);
  if (!staff || !bool_(staff.record.active)) throw err_("Geen toegang.", 401);
  updateByRow_("sessions", session.row, { last_seen: now_() });
  return { email: staff.record.email, staff: staff.record };
}

function createSession_(staff) {
  staff = staff || {};
  if (!staff.staff_id || !staff.email) throw err_("Staff sessie kan niet worden aangemaakt.", 500);
  var session = {
    token_id: id_("TOK"),
    created_at: now_(),
    expires_at: new Date(Date.now() + APP.SESSION_HOURS * 3600000),
    actor_type: "staff",
    actor_id: staff.staff_id,
    email: staff.email,
    role: staff.role,
    token: token_(),
    active: true,
    last_seen: now_(),
  };
  append_("sessions", session);
  return session;
}

function safeStaff_(s) {
  s = s || {};
  return {
    staff_id: s.staff_id,
    name: s.name,
    email: s.email,
    role: s.role,
    permissions: s.permissions,
    active: bool_(s.active),
    last_login: s.last_login,
  };
}

function getValidCoupon_(code) {
  code = clean_(code).toUpperCase();
  if (!code) return null;
  var row = findRow_("coupons", "code", code);
  if (!row || !bool_(row.record.active)) throw err_("Kortingscode is ongeldig.", 400);
  if (row.record.expires_at && new Date(row.record.expires_at).getTime() < Date.now())
    throw err_("Kortingscode is verlopen.", 400);
  if (
    num_(row.record.usage_limit) > 0 &&
    num_(row.record.used_count) >= num_(row.record.usage_limit)
  )
    throw err_("Kortingscode is niet meer beschikbaar.", 400);
  return row.record;
}

function getBundlesAdmin(payload) {
  requireStaff_(payload);
  return ok_(rows_("bundles").sort(sortCreatedDesc_).map(bundleOut_));
}

function getBundlesPublic() {
  return ok_(activeBundles_().map(bundleOut_));
}

function createBundle(payload) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, ["name", "product_ids"]);
  var now = now_();
  var bundle = merge_(bundlePatch_(payload), {
    bundle_id: id_("BDL"),
    created_at: now,
    updated_at: now,
  });
  append_("bundles", bundle);
  audit_(auth.email, "bundle_created", "bundle", bundle.bundle_id, bundle);
  return ok_(bundleOut_(bundle));
}

function updateBundle(payload) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, ["bundle_id"]);
  var row = findRow_("bundles", "bundle_id", payload.bundle_id);
  if (!row) throw err_("Bundel niet gevonden.", 404);
  var patch = merge_(bundlePatch_(merge_(row.record, payload)), { updated_at: now_() });
  updateByRow_("bundles", row.row, patch);
  var updated = findRow_("bundles", "bundle_id", payload.bundle_id).record;
  audit_(auth.email, "bundle_updated", "bundle", payload.bundle_id, patch);
  return ok_(bundleOut_(updated));
}

function archiveBundle(payload) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, ["bundle_id"]);
  var row = findRow_("bundles", "bundle_id", payload.bundle_id);
  if (!row) throw err_("Bundel niet gevonden.", 404);
  updateByRow_("bundles", row.row, { active: false, archived: true, updated_at: now_() });
  audit_(auth.email, "bundle_archived", "bundle", payload.bundle_id, {});
  return ok_({ bundle_id: payload.bundle_id, archived: true });
}

function bundlePatch_(payload) {
  var discountType = clean_(payload.discount_type || "fixed");
  if (["fixed", "percent", "fixed_bundle_price", "none"].indexOf(discountType) === -1)
    throw err_("Ongeldig bundel kortingstype.", 400);
  return {
    name: clean_(payload.name),
    product_ids: normalizeIds_(payload.product_ids),
    discount_type: discountType,
    discount_value: money_(payload.discount_value),
    fixed_bundle_price: money_(payload.fixed_bundle_price),
    start_at: clean_(payload.start_at),
    end_at: clean_(payload.end_at),
    status: clean_(payload.status || "live"),
    active: payload.active === undefined ? true : bool_(payload.active),
    frontend_text: clean_(payload.frontend_text),
    archived: bool_(payload.archived),
  };
}

function bundleOut_(bundle) {
  var out = merge_(bundle, {});
  out.product_ids = splitIds_(bundle.product_ids);
  out.discount_value = money_(bundle.discount_value);
  out.fixed_bundle_price = money_(bundle.fixed_bundle_price);
  out.schedule_state = scheduleState_(bundle.start_at, bundle.end_at, bundle.status);
  out.active = bundle.active === "" || bool_(bundle.active);
  out.archived = bool_(bundle.archived);
  return out;
}

function activeBundles_() {
  return rows_("bundles").filter(function (bundle) {
    var state = scheduleState_(bundle.start_at, bundle.end_at, bundle.status);
    return (
      (bundle.active === "" || bool_(bundle.active)) &&
      !bool_(bundle.archived) &&
      state === "live"
    );
  });
}

function applyBundleDiscounts_(items, subtotal) {
  var byProduct = {};
  items.forEach(function (item) {
    var productId = clean_(item.product.product_id || item.product.id);
    if (!byProduct[productId]) byProduct[productId] = { total: 0, qty: 0 };
    byProduct[productId].total += money_(item.price * item.quantity - item.line_discount);
    byProduct[productId].qty += item.quantity;
  });
  var discount = 0;
  var names = [];
  var itemBundleIds = {};
  activeBundles_().forEach(function (bundle) {
    var ids = splitIds_(bundle.product_ids);
    if (!ids.length) return;
    var applies = ids.every(function (id) {
      return byProduct[clean_(id)] && byProduct[clean_(id)].qty > 0;
    });
    if (!applies) return;
    var bundleBase = ids.reduce(function (sum, id) {
      return sum + num_(byProduct[clean_(id)].total);
    }, 0);
    var itemDiscount = 0;
    if (num_(bundle.fixed_bundle_price) > 0) {
      itemDiscount = Math.max(0, bundleBase - money_(bundle.fixed_bundle_price));
    } else if (clean_(bundle.discount_type) === "percent") {
      itemDiscount = discountAmount_(bundleBase, "percent", bundle.discount_value);
    } else if (clean_(bundle.discount_type) === "fixed") {
      itemDiscount = Math.min(bundleBase, money_(bundle.discount_value));
    }
    if (itemDiscount <= 0) return;
    discount += itemDiscount;
    names.push(clean_(bundle.name));
    ids.forEach(function (id) {
      itemBundleIds[clean_(id)] = bundle.bundle_id;
    });
  });
  return { discount: money_(Math.min(subtotal, discount)), names: names, itemBundleIds: itemBundleIds };
}

function incrementCouponUse_(code) {
  var row = findRow_("coupons", "code", code);
  if (row)
    updateByRow_("coupons", row.row, {
      used_count: num_(row.record.used_count) + 1,
      updated_at: now_(),
    });
}

function output_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
function ok_(data) {
  return { success: true, data: jsonSafe_(data === undefined ? {} : data), error: null };
}
function fail_(message, code) {
  return { success: false, data: null, error: { message: message, code: code || 500 } };
}
function err_(message, code) {
  var e = new Error(message);
  e.code = code || 500;
  return e;
}
function parseBody_(e) {
  var raw = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
  try {
    return raw.charAt(0) === "{" ? JSON.parse(raw) : {};
  } catch (error) {
    throw err_("Ongeldige request body.", 400);
  }
}
function param_(e, key) {
  return e && e.parameter ? e.parameter[key] : "";
}
function token_() {
  return Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, "");
}
function id_(prefix) {
  return (
    prefix +
    "-" +
    Utilities.formatDate(new Date(), APP.TIMEZONE, "yyyyMMddHHmmss") +
    "-" +
    shortCode_()
  );
}
function shortCode_() {
  return token_().slice(0, 6).toUpperCase();
}
function now_() {
  return new Date();
}
function clean_(value) {
  return value === null || value === undefined ? "" : String(value).trim();
}
function same_(a, b) {
  return clean_(a).toLowerCase() === clean_(b).toLowerCase();
}
function num_(value) {
  var n = Number(clean_(value).replace(",", "."));
  return isFinite(n) ? n : 0;
}
function money_(value) {
  return Math.round(num_(value) * 100) / 100;
}
function bool_(value) {
  if (typeof value === "boolean") return value;
  return ["true", "1", "yes", "ja", "y"].indexOf(clean_(value).toLowerCase()) !== -1;
}
function cell_(value) {
  return value instanceof Date || typeof value === "number" || typeof value === "boolean"
    ? value
    : clean_(value);
}
function split_(value) {
  return clean_(value).split(",").map(clean_).filter(Boolean);
}
function merge_(a, b) {
  var out = {};
  Object.keys(a || {}).forEach(function (k) {
    out[k] = a[k];
  });
  Object.keys(b || {}).forEach(function (k) {
    out[k] = b[k];
  });
  return out;
}
function validateRequired_(payload, fields) {
  payload = payload || {};
  fields.forEach(function (f) {
    if (
      payload[f] === undefined ||
      payload[f] === null ||
      clean_(payload[f]) === "" ||
      (Array.isArray(payload[f]) && payload[f].length === 0)
    )
      throw err_("Verplicht veld ontbreekt: " + f, 400);
  });
}
function validateEmail_(email) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean_(email)))
    throw err_("Vul een geldig e-mailadres in.", 400);
}
function validateDiscount_(type, value) {
  type = clean_(type || "none");
  if (["none", "fixed", "percent"].indexOf(type) === -1) throw err_("Ongeldig kortingstype.", 400);
  if (num_(value) < 0) throw err_("Korting mag niet negatief zijn.", 400);
  if (type === "percent" && num_(value) > 100)
    throw err_("Percentagekorting mag maximaal 100 zijn.", 400);
}
function discountAmount_(base, type, value) {
  type = clean_(type || "none");
  value = num_(value);
  if (type === "percent") return money_(Math.min(base, (base * value) / 100));
  if (type === "fixed") return money_(Math.min(base, value));
  return 0;
}
function shippingFor_(subtotal, company) {
  var free = money_(company.free_shipping_above);
  return free > 0 && subtotal >= free ? 0 : money_(company.shipping_cost);
}
function publicPrice_(product, productId, ctx) {
  ctx = ctx || productContext_();
  var base = money_(product.price_inc_vat || product.sell_price || product.retail_price);
  var productDiscountActive = scheduleState_(product.discount_starts_at, product.discount_ends_at, "live") === "live";
  var best = {
    amount: productDiscountActive ? discountAmount_(base, product.discount_type, product.discount_value) : 0,
    action: null,
  };
  (ctx.actions || activeScheduledActions_()).forEach(function (action) {
    if (!scheduledActionTargetsProduct_(action, productId, ctx)) return;
    if (clean_(action.action_type) === "free_shipping" || clean_(action.action_type) === "custom")
      return;
    var type =
      clean_(action.discount_type) === "fixed" || clean_(action.action_type) === "fixed"
        ? "fixed"
        : "percent";
    var amount = discountAmount_(base, type, action.discount_value);
    if (amount > best.amount) best = { amount: amount, action: actionOut_(action) };
  });
  return { base: base, price: money_(base - best.amount), action: best.action };
}
function activeScheduledActions_(options) {
  options = options || {};
  return rows_("scheduled_actions").filter(function (a) {
    return (
      bool_(a.active) &&
      !bool_(a.archived) &&
      scheduleState_(a.starts_at, a.ends_at, a.status) === "live"
    );
  });
}
function scheduledActionTargetsProduct_(action, productId, ctx) {
  ctx = ctx || productContext_();
  var targetType = clean_(action.target_type || "all");
  var ids = splitIds_(action.target_ids);
  if (targetType === "all" || !ids.length) return true;
  if (targetType === "product" || targetType === "products")
    return ids.some(function (id) {
      return same_(id, productId);
    });
  if (targetType === "category") {
    var row = findRowAny_("products", ["product_id", "id"], productId);
    return row
      ? ids.some(function (id) {
          return same_(id, row.record.category);
        })
      : false;
  }
  if (targetType === "collection" || targetType === "collections") {
    return (ctx.collections || rows_("collections")).some(function (collection) {
      return (
        ids.some(function (id) {
          return same_(id, collection.collection_id);
        }) &&
        splitIds_(collection.product_ids).some(function (id) {
          return same_(id, productId);
        })
      );
    });
  }
  return false;
}
function hasFreeShippingAction_() {
  return activeScheduledActions_().some(function (action) {
    return clean_(action.action_type) === "free_shipping";
  });
}
function productScheduleState_(product) {
  if (!bool_(product.active) || ["hidden", "archived"].indexOf(clean_(product.status)) !== -1)
    return clean_(product.status) === "archived" ? "archived" : "hidden";
  return scheduleState_(product.visible_from, product.visible_until, product.status || "live");
}
function scheduleState_(startValue, endValue, status) {
  status = clean_(status || "live");
  if (status === "archived" || status === "hidden") return status;
  if (status === "draft") return "draft";
  var now = Date.now();
  var start = dateMs_(startValue);
  var end = dateMs_(endValue);
  if (start && now < start) return "scheduled";
  if (end && now >= end) return "expired";
  return "live";
}
function dateMs_(value) {
  var ms = new Date(clean_(value)).getTime();
  return isNaN(ms) ? 0 : ms;
}
function normalizeIds_(value) {
  return splitIds_(value).join(",");
}
function splitIds_(value) {
  if (Array.isArray(value))
    return value
      .map(clean_)
      .filter(Boolean);
  return clean_(value)
    .split(",")
    .map(clean_)
    .filter(Boolean);
}
function normalizeCategory_(category) {
  category = clean_(category);
  return APP.CATEGORIES.indexOf(category) !== -1 ? category : APP.CATEGORIES[0];
}
function extractDriveId_(value) {
  value = clean_(value);
  var m = value.match(/\/d\/([a-zA-Z0-9_-]+)/) || value.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : /^[a-zA-Z0-9_-]{20,}$/.test(value) ? value : "";
}
function driveImageUrl_(id) {
  return "https://drive.google.com/uc?export=view&id=" + id;
}
function driveThumbUrl_(id) {
  return "https://drive.google.com/thumbnail?id=" + id + "&sz=w1000";
}
function convertDriveUrl_(value) {
  var id = extractDriveId_(value);
  return id ? driveImageUrl_(id) : clean_(value);
}
function convertDriveThumb_(value) {
  var id = extractDriveId_(value);
  return id ? driveThumbUrl_(id) : clean_(value);
}
function sortCreatedDesc_(a, b) {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}
function sortOrder_(a, b) {
  var bySort = num_(a.sort_order) - num_(b.sort_order);
  return bySort || new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
}
function clearPublicCache_() {
  resetRuntimeCache_();
  CacheService.getScriptCache().removeAll([
    "public_products_v2___false_false",
    "public_products_v2___true_false",
    "public_products_v2_Tops__false_false",
    "public_products_v2_Bottoms__false_false",
    "public_products_v2_Outerwear__false_false",
    "public_products_v2_Footwear__false_false",
    "public_proof_reviews_v1",
    "public_customer_reviews_v1",
  ]);
}
function withLock_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw err_("Het is druk. Probeer opnieuw.", 429);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}
function hashPassword_(password) {
  var salt = token_().slice(0, 24);
  var hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    salt + String(password),
    Utilities.Charset.UTF_8,
  );
  return salt + "$" + Utilities.base64Encode(hash);
}
function verifyPassword_(password, stored) {
  var parts = clean_(stored).split("$");
  if (parts.length !== 2) return false;
  var hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    parts[0] + String(password),
    Utilities.Charset.UTF_8,
  );
  return Utilities.base64Encode(hash) === parts[1];
}
function audit_(email, action, targetType, targetId, details) {
  append_("audit_log", {
    log_id: id_("LOG"),
    created_at: now_(),
    actor_email: email,
    action: action,
    target_type: targetType,
    target_id: targetId,
    details: JSON.stringify(details || {}),
  });
}
function esc_(value) {
  return clean_(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function jsonSafe_(value) {
  return JSON.parse(JSON.stringify(value));
}
