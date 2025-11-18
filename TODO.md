# Fix Product Price Display Issue

## Problem

- When updating products, price shows correctly in admin UI
- But in frontend UI for "Sản phẩm bán chạy" (best sellers) and "Sản phẩm mới về" (new arrivals), price shows as 0đ
- Database returns 0 for these endpoints

## Root Cause

- `getNewArrivals` and `getBestSellers` functions don't include variant price logic
- Products with variants should display the lowest variant price, but these functions don't process variants

## Tasks

- [x] Update `getNewArrivals` function to include variants and process prices
- [x] Update `getBestSellers` function to include variants and process prices
- [x] Test the changes to ensure prices display correctly

## Files to Edit

- `be/src/controllers/product.controller.js`

## -# WishListCard Price Formatting Fixes

## -## Issues to Fix:

-- [ ] Remove "$" prefix from price display and use proper VND formatting
-- [ ] Fix compareAtPrice formatting (same issue)
-- [ ] Format discount badge to show proper savings amount with currency
-- [ ] Remove extra space in discount badge className
-- [ ] Ensure proper conditional rendering when no discount exists
-- [ ] Test formatting for both discounted and non-discounted items

- -## Implementation Steps:
- -1. Update price display: `${item.price.toLocaleString("vi-VN")}đ` → `{item.price.toLocaleString("vi-VN")}đ`
  -2. Update compareAtPrice display: Same formatting fix
  -3. Update discount badge: Show formatted savings amount
  -4. Remove leading space in badge className
  -5. Verify conditional rendering logic
  +# Fix Product Price Display Issue

* +## Problem
  +- When updating products, price shows correctly in admin UI
  +- But in frontend UI for "Sản phẩm bán chạy" (best sellers) and "Sản phẩm mới về" (new arrivals), price shows as 0đ
  +- Database returns 0 for these endpoints
* +## Root Cause
  +- `getNewArrivals` and `getBestSellers` functions don't include variant price logic
  +- Products with variants should display the lowest variant price, but these functions don't process variants
* +## Tasks
  +- [ ] Update `getNewArrivals` function to include variants and process prices
  +- [ ] Update `getBestSellers` function to include variants and process prices
  +- [ ] Test the changes to ensure prices display correctly
* +## Files to Edit
  +- `be/src/controllers/product.controller.js`
  \ No newline at end of file

blackbox wants to edit this file:
Rollback
@@ -1117,14 +1117,18 @@
{
association: "reviews",
attributes: ["rating"],
},

-        {
-          association: "variants",
-          required: false,
-        },
       ],
       limit: parseInt(limit),
       order: [["createdAt", "DESC"]],
  });

* // Process products to add ratings

- // Process products to add ratings and handle variant prices
  const products = productsRaw.map((product) => {
  const productJson = product.toJSON();

         // Calculate average rating

  @@ -1143,13 +1147,27 @@
  );
  ratings.count = productJson.reviews.length;
  }

-      // Use variant price if available, otherwise use product price
-      let displayPrice = parseFloat(productJson.price) || 0;
-      let compareAtPrice = parseFloat(productJson.compareAtPrice) || null;
-
-      if (productJson.variants && productJson.variants.length > 0) {
-        // Sort variants by price (ascending) to get the lowest price first
-        const sortedVariants = productJson.variants.sort(
-          (a, b) => parseFloat(a.price) - parseFloat(b.price)
-        );
-        displayPrice = parseFloat(sortedVariants[0].price) || displayPrice;
-      }
-       // Add ratings and remove reviews from response
        delete productJson.reviews;

        return {
          ...productJson,

-        price: displayPrice,
-        compareAtPrice,
         ratings,
       };
  });

blackbox wants to edit this file:
Rollback
@@ -1205,15 +1205,15 @@

     // Get best selling products based on order items
     const bestSellers = await sequelize.query(
       `

-      SELECT
-        p.id,
-        p.name,
-        p.slug,
-        p.price,
-        p.compare_at_price,
-        p.thumbnail,

*      SELECT
*        p.id,
*        p.name,
*        p.slug,
*        p.price,
*        p.compare_at_price,
*        p.thumbnail,
           p.in_stock,
           p.stock_quantity,
           p.featured,
           COUNT(oi.product_id) as sales_count,
  @@ -1241,15 +1241,23 @@
  // Get product IDs
  const productIds = bestSellers.map((product) => product.id);
       // Get full product details

- const products = await Product.findAll({

* const productsRaw = await Product.findAll({
  where: { id: { [Op.in]: productIds } },
  include: [
  {
  association: "categories",
  through: { attributes: [] },
  },
*        {
*          association: "reviews",
*          attributes: ["rating"],
*        },
*        {
*          association: "variants",
*          required: false,
*        },
         ],
         order: [
           [
             sequelize.literal(

  @@ -1260,8 +1268,52 @@
  ],
  ],
  });

* // Process products to add ratings and handle variant prices
* const products = productsRaw.map((product) => {
*      const productJson = product.toJSON();
*
*      // Calculate average rating
*      const ratings = {
*        average: 0,
*        count: 0,
*      };
*
*      if (productJson.reviews && productJson.reviews.length > 0) {
*        const totalRating = productJson.reviews.reduce(
*          (sum, review) => sum + review.rating,
*          0
*        );
*        ratings.average = parseFloat(
*          (totalRating / productJson.reviews.length).toFixed(1)
*        );
*        ratings.count = productJson.reviews.length;
*      }
*
*      // Use variant price if available, otherwise use product price
*      let displayPrice = parseFloat(productJson.price) || 0;
*      let compareAtPrice = parseFloat(productJson.compareAtPrice) || null;
*
*      if (productJson.variants && productJson.variants.length > 0) {
*        // Sort variants by price (ascending) to get the lowest price first
*        const sortedVariants = productJson.variants.sort(
*          (a, b) => parseFloat(a.price) - parseFloat(b.price)
*        );
*        displayPrice = parseFloat(sortedVariants[0].price) || displayPrice;
*      }
*
*      // Add ratings and remove reviews from response
*      delete productJson.reviews;
*
*      return {
*        ...productJson,
*        price: displayPrice,
*        compareAtPrice,
*        ratings,
*      };
* });
*     res.status(200).json({
        status: "success",
        data: products,
      });

blackbox has a question:
No testing has been performed yet on the updated getBestSellers function in the product controller.

The critical aspects that must be verified include:

The getBestSellers endpoint returns products with correct ratings calculation (average and count from reviews).
Variant price handling works properly (lowest price from variants is used if available).
The endpoint still functions for different periods (week, month, year) and limits.
Fallback to getNewArrivals when no best sellers are found.
No regressions in other product endpoints.
Remaining areas requiring coverage:

Testing the getBestSellers API endpoint with various query parameters (limit, period).
Verifying ratings and price calculations in the response.
Checking edge cases like products with no reviews, no variants, or cancelled orders.
Ensuring the endpoint integrates correctly with the dat
