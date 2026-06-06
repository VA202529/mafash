# Mafash Webshop + Admin

Mafash is a lightweight webshop that uses Google Sheets as database and Google Apps Script as API. The customer website is a Vite frontend. `Admin.html` is one portable file with its own HTML, CSS and JavaScript.

## Main Files

- `Code.gs`: Google Apps Script API and Sheet structure.
- `Admin.html`: owner admin for products, orders, proof cards and planning.
- `src/lib/api.ts`: storefront API client.
- `src/components/customer-proof.tsx`: public proof cards.
- `src/components/customer-reviews.tsx`: public review form and approved reviews.

## Setup

1. Open the Google Sheet that should store the webshop data.
2. Open Apps Script from that Sheet.
3. Paste `Code.gs` into Apps Script.
4. Run `setupDatabaseStructure()` once.
5. Deploy as Web App and allow access for the storefront.
6. Put the Web App URL in `src/lib/api.ts`.
7. Open `Admin.html` and save the same Web App URL in the login screen.

Run `setupDatabaseStructure()` again after backend updates that add Sheet columns or new Sheet tabs.

## Sheets

`products` stores public product data. Important planning columns are:

```text
product_id, name, brand, category, status, active, featured,
sell_price, retail_price, discount_type, discount_value,
visible_from, visible_until, launch_badge_text,
drive_folder_id, drive_folder_url
```

`product_variants` stores size stock:

```text
variant_id, product_id, size, stock, sort_order, active, created_at, updated_at
```

`proof_reviews` stores frontend proof cards:

```text
proof_id, image_url, drive_file_id, customer_name, link_url,
product_name, badge_text, quote, review_date, sort_order,
active, created_at, updated_at, archived
```

`customer_reviews` stores submitted website reviews. Reviews are pending by default and only approved reviews are public:

```text
review_id, name, email, rating, message, status, active,
created_at, updated_at, approved_at, archived
```

`collections` stores drops or groups of products:

```text
collection_id, name, description, product_ids, start_at, end_at,
status, badge_text, active, created_at, updated_at, archived
```

`scheduled_actions` stores time-based actions:

```text
action_id, name, action_type, discount_type, discount_value,
target_type, target_ids, starts_at, ends_at, frontend_text,
status, active, created_at, updated_at, archived
```

The backend also creates `product_images`, `orders`, `order_items`, `coupons`, `settings`, `bedrijf`, `staff`, `sessions`, `email_log` and `audit_log`.

## Proof Cards

Proof is intentionally simple. A public proof item is an image card with a small label that hangs over the lower edge of the card.

The label shows:

- `product_name`
- `badge_text`, for example `Binnenkort`, `Coming soon` or `Proof item`

The admin can create, update, sort, activate and archive proof cards. Images may be normal URLs or Google Drive file URLs.

## Admin Performance

`Admin.html` keeps a local product state:

```text
products, productById, pageSize, filters, loading
```

The product dashboard loads products in batches of 10 and supports search, status, category, featured, missing Drive-map and missing image filters. After product create, update, image sync or Drive-map create, the admin updates only the affected card. Loaded products no longer disappear and reappear after every save.

Products without Drive folders can be repaired from the admin with `Mappen controleren`. This uses the backend bulk action and avoids blocking products that already have image URLs.

The admin menu is split into focused work areas:

```text
Producten | Nieuw product | Nieuwe proof | Proof | Reviews | Orders | Nieuwe orders | Nieuwe planning | Planning | Instellingen
```

Bulk product actions support checking selected products, creating Drive folders, syncing images, applying percentage or fixed discounts, toggling featured, changing status and archiving. Bulk updates return changed records so the admin can update cards in place.

## Customer Reviews

Website visitors can submit a review with name, email, message and 1-5 stars. New reviews are saved as `pending`.

Flow:

1. Customer submits the review form.
2. Google Apps Script saves the review in `customer_reviews`.
3. Admin receives an email.
4. Customer receives a confirmation email.
5. Admin approves or rejects the review in `Admin.html`.
6. Only `approved`, `active` and non-archived reviews appear publicly.

## Planning

All time checks happen in `Code.gs` using the current time.

Product planning:

- `visible_from`: product becomes public at or after this time.
- `visible_until`: product stops being public at or after this time.
- `status`: use `draft`, `scheduled`, `live`, `hidden` or `archived`.

Collection planning:

- A collection groups `product_ids`.
- Scheduled collections can be fetched by the frontend for countdown or coming-soon UI.
- Live collections can be used as targets for actions.

Scheduled actions:

- Discount actions can be percentage or fixed amount.
- Free shipping actions set checkout shipping to zero while live.
- Targets can be all products, product IDs or collection IDs.
- Only active actions inside `starts_at` and `ends_at` affect public pricing.

When an action expires, normal product pricing returns automatically. The admin still sees scheduled, live and expired states.

## API Actions

Public:

```text
company
getProducts / getProductsPublic
getProductDetails
getProofReviews / getProofReviewsPublic
createCustomerReview
getCustomerReviewsPublic
getCollectionsPublic
getActiveScheduledActionsPublic
createOrder
```

Admin:

```text
adminLogin
getStaffSession
getProductsAdmin
createProduct
updateProduct
createProductDriveFolder
repairMissingProductDriveFolders
bulkCheckProducts
bulkCreateProductDriveFolders
bulkUpdateProducts
bulkApplyDiscountToProducts
bulkArchiveProducts
bulkSyncProductImages
updateProductVariants
updateProductSchedule
archiveProduct
syncProductImages
getProofReviewsAdmin
createProofReview
updateProofReview
archiveProofReview
bulkUpdateProofReviews
getCustomerReviewsAdmin
updateCustomerReviewStatus
archiveCustomerReview
bulkUpdateCustomerReviews
getCollectionsAdmin
createCollection
updateCollection
archiveCollection
getScheduledActionsAdmin
createScheduledAction
updateScheduledAction
archiveScheduledAction
bulkUpdateScheduledActions
getOrders
getNewOrders
getArchivedOrders
getOrderDetails
archiveOrder
restoreOrder
archiveCompletedOrders
bulkArchiveOrders
updatePaymentStatus
updateFulfillmentStatus
getCompanySettings
updateCompanySettings
```

## Adding Content

Products:

1. Create the product in `Admin.html`.
2. Add sizes and stock per size.
3. Upload product images to its Drive folder and sync images.
4. Put a product in Planning if it should open later.

If a product row is added manually in Google Sheets without `product_id` or `id`, the backend repairs it automatically and writes a generated `PROD-...` value into both columns. Product loading is optimized by reading variants, images, actions and collections in bulk per request instead of reading those Sheets once per product.

Drops:

1. Open the Planning tab.
2. Create a collection with product IDs.
3. Set start, end, badge and status.

Actions:

1. Open the Planning tab.
2. Create a timed action.
3. Choose all products, product IDs or collection IDs.
4. Add public text if the homepage should show a live message.

## Known Limits

- Google Sheets is not a high-volume commerce database.
- Planning is evaluated when API requests happen; there is no background cron job.
- Product and action caches are short-lived, so a change can take up to about one minute to appear publicly.
- Payment provider checkout is still outside this lightweight layer.

## Later Extensions

- Public collection detail pages and countdown modules.
- Drag-and-drop sorting for proof cards.
- A richer product picker instead of entering target IDs.
- Per-action coupon codes and customer segments.

## Developer Prompt

Continue this project as a lightweight Google Sheets and Google Apps Script webshop. Keep `Code.gs` readable, keep `Admin.html` as one portable HTML/CSS/JS file, and avoid heavy libraries. Preserve product variant stock, public time visibility, proof cards with product/badge labels, collections and scheduled actions. Public pricing must only use live active actions. Products outside their visibility window must not be purchasable. Keep status feedback in admin forms and update this README when new Sheets, columns or API actions are introduced.
