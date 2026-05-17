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
  VERSION: "3.1.0-mafash-light",
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
      "drive_folder_id",
      "drive_folder_url",
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
      "quantity",
      "line_total",
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
    shipping_cost: "12",
    free_shipping_above: "200",
    vat_percentage: "21",
    drive_products_root_folder_id: "",
    drive_products_root_folder_name: "",
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

function doGet(e) {
  if (param_(e, "action")) return output_(route_(e.parameter.action, e.parameter || {}));
  return output_(ok_({ name: "Mafash Webshop API", version: APP.VERSION }));
}

function doPost(e) {
  var body = parseBody_(e);
  return output_(route_(body.action || param_(e, "action"), body));
}

function setupDatabaseStructure() {
  ensureDatabase_(true);
  ensureOwner_();
  return ok_({ version: APP.VERSION, sheets: Object.keys(APP.SHEETS) });
}

function route_(action, payload) {
  try {
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
      products: getProducts,
      getProductDetails: getProductDetails,
      createOrder: createOrder,
      adminLogin: adminLogin,
      getStaffSession: getStaffSession,
      getProductsAdmin: getProductsAdmin,
      createProduct: createProduct,
      updateProduct: updateProduct,
      archiveProduct: archiveProduct,
      restoreProduct: restoreProduct,
      syncProductImages: syncProductImages,
      getOrders: getOrders,
      getOrderDetails: getOrderDetails,
      updatePaymentStatus: updatePaymentStatus,
      updateFulfillmentStatus: updateFulfillmentStatus,
      getCompanySettings: getCompanySettings,
      updateCompanySettings: updateCompanySettings,
    };
    if (!routes[action]) throw err_("Onbekende actie: " + action, 404);
    return routes[action](payload || {});
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
  var rows = rows_("products").filter(function (p) {
    return (
      bool_(p.active) &&
      clean_(p.status || "active") !== "archived" &&
      (payload.include_out_of_stock ? true : num_(p.stock) > 0)
    );
  });
  if (payload.category)
    rows = rows.filter(function (p) {
      return same_(p.category, payload.category);
    });
  if (payload.brand)
    rows = rows.filter(function (p) {
      return same_(p.brand, payload.brand);
    });
  if (payload.featured)
    rows = rows.filter(function (p) {
      return bool_(p.featured);
    });
  rows.sort(function (a, b) {
    return num_(a.sort_order) - num_(b.sort_order);
  });
  return ok_(rows.map(publicProduct_));
}

function getProductDetails(payload) {
  validateRequired_(payload, ["product_id"]);
  var row = findRowAny_("products", ["product_id", "id"], payload.product_id);
  if (!row || !bool_(row.record.active) || clean_(row.record.status) === "archived")
    throw err_("Product niet gevonden.", 404);
  return ok_(publicProduct_(row.record));
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
      var qty = Math.max(1, Math.floor(num_(item.quantity || item.qty || 1)));
      if (num_(product.stock) - qty < 0)
        throw err_("Onvoldoende voorraad voor " + product.name + ".", 409);
      var price = money_(product.price_inc_vat || product.sell_price);
      var lineDiscount = discountAmount_(
        price * qty,
        product.discount_type,
        product.discount_value,
      );
      subtotal += price * qty - lineDiscount;
      discountTotal += lineDiscount;
      normalized.push({
        row: found.row,
        product: product,
        quantity: qty,
        size: clean_(item.size),
        price: price,
        line_discount: lineDiscount,
      });
    });

    var coupon = getValidCoupon_(payload.coupon_code);
    if (coupon) {
      var couponDiscount = discountAmount_(subtotal, coupon.discount_type, coupon.discount_value);
      subtotal -= couponDiscount;
      discountTotal += couponDiscount;
      incrementCouponUse_(coupon.code);
    }

    normalized.forEach(function (item) {
      updateByRow_("products", item.row, {
        stock: num_(item.product.stock) - item.quantity,
        updated_at: now_(),
      });
    });

    var company = getCompanyMap_();
    var vatRate = num_(company.vat_percentage || 21);
    var shipping =
      clean_(payload.delivery_type) === "ophalen" ? 0 : shippingFor_(subtotal, company);
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
        quantity: item.quantity,
        line_total: money_(item.price * item.quantity - item.line_discount),
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
  requireStaff_(payload);
  return ok_(
    rows_("products").map(function (p) {
      p.images = productImages_(p.product_id || p.id, p);
      p.image_count = p.images.length;
      return p;
    }),
  );
}

function createProduct(payload) {
  var auth = requireStaff_(payload);
  validateRequired_(payload, ["name", "sell_price", "stock", "category"]);
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
    sizes: clean_(payload.sizes || "One Size"),
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
    drive_folder_id: folder.id,
    drive_folder_url: folder.url,
  };
  validateDiscount_(product.discount_type, product.discount_value);
  append_("products", product);
  appendProductImageIfPresent_(id, payload);
  audit_(auth.email, "product_created", "product", id, product);
  return ok_(product);
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
  if (payload.retail_price !== undefined) patch.retail_price = money_(payload.retail_price);
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
  appendProductImageIfPresent_(row.record.product_id || row.record.id, payload);
  audit_(auth.email, "product_updated", "product", payload.product_id, patch);
  return ok_(findRowAny_("products", ["product_id", "id"], payload.product_id).record);
}

function archiveProduct(payload) {
  requireStaff_(payload);
  validateRequired_(payload, ["product_id"]);
  var row = findRowAny_("products", ["product_id", "id"], payload.product_id);
  if (!row) throw err_("Product niet gevonden.", 404);
  updateByRow_("products", row.row, { active: false, status: "archived", updated_at: now_() });
  return ok_({ product_id: payload.product_id, status: "archived" });
}

function restoreProduct(payload) {
  requireStaff_(payload);
  validateRequired_(payload, ["product_id"]);
  var row = findRowAny_("products", ["product_id", "id"], payload.product_id);
  if (!row) throw err_("Product niet gevonden.", 404);
  updateByRow_("products", row.row, { active: true, status: "active", updated_at: now_() });
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
  return ok_({ product_id: payload.product_id, synced: synced });
}

function getOrders(payload) {
  requireStaff_(payload);
  return ok_(rows_("orders").sort(sortCreatedDesc_));
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
  return ok_(out);
}

function updatePaymentStatus(payload) {
  requireStaff_(payload);
  validateRequired_(payload, ["order_id", "payment_status"]);
  return updateOrder_(payload.order_id, {
    payment_status: clean_(payload.payment_status),
    paid: clean_(payload.payment_status) === "paid",
    payment_link: clean_(payload.payment_link),
    updated_at: now_(),
  });
}

function updateFulfillmentStatus(payload) {
  requireStaff_(payload);
  validateRequired_(payload, ["order_id", "fulfillment_status"]);
  return updateOrder_(payload.order_id, {
    fulfillment_status: clean_(payload.fulfillment_status),
    track_trace: clean_(payload.track_trace),
    updated_at: now_(),
  });
}

function updateOrder_(orderId, patch) {
  var row = findRow_("orders", "order_id", orderId);
  if (!row) throw err_("Order niet gevonden.", 404);
  updateByRow_("orders", row.row, patch);
  return getOrderDetails({ token: "", order_id: orderId, _skip_auth: true });
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
  cache.put("db_ready_" + APP.VERSION, "1", 600);
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

function publicProduct_(p) {
  var id = p.product_id || p.id;
  var original = money_(p.retail_price || p.sell_price || p.price_inc_vat);
  var base = money_(p.price_inc_vat || p.sell_price || original);
  var discount = discountAmount_(base, p.discount_type, p.discount_value);
  var images = productImages_(id, p);
  return {
    product_id: id,
    id: id,
    name: p.name,
    brand: p.brand || "MA Fashion",
    category: p.category,
    description: p.description,
    sizes: split_(p.sizes),
    sku: p.sku,
    status: p.status,
    active: bool_(p.active),
    featured: bool_(p.featured),
    stock: num_(p.stock),
    price: money_(base - discount),
    sell_price: base,
    retail_price: original,
    original_price: original,
    image_url: images.length ? images[0].url : "",
    image: images.length ? images[0].url : "",
    images: images,
    discount_type: p.discount_type || "none",
    discount_value: num_(p.discount_value),
    drive_folder_id: p.drive_folder_id,
    drive_folder_url: p.drive_folder_url,
  };
}

function productImages_(productId, product) {
  var images = rows_("product_images")
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

function sendOrderMail_(order) {
  var company = getCompanyMap_();
  var subject = "We hebben je bestelling ontvangen - " + order.order_id;
  var html =
    "<p>Hallo " +
    esc_(order.customer_name) +
    ",</p><p>We hebben je bestelling ontvangen.</p><p><strong>Order:</strong> " +
    esc_(order.order_id) +
    "<br><strong>Totaal:</strong> EUR " +
    money_(order.total_price).toFixed(2) +
    "</p><p>" +
    esc_(company.credit_text) +
    " - <a href='" +
    esc_(company.credit_url) +
    "'>" +
    esc_(company.credit_label) +
    "</a></p>";
  try {
    MailApp.sendEmail({
      to: order.email,
      subject: subject,
      htmlBody: html,
      name: clean_(company.company_name || "MA Fashion"),
    });
    append_("email_log", {
      email_id: id_("EML"),
      created_at: now_(),
      order_id: order.order_id,
      to: order.email,
      subject: subject,
      type: "order_created",
      status: "sent",
      error: "",
    });
  } catch (e) {
    append_("email_log", {
      email_id: id_("EML"),
      created_at: now_(),
      order_id: order.order_id,
      to: order.email,
      subject: subject,
      type: "order_created",
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
