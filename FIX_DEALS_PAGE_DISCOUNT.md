# Sửa lỗi hiển thị giá giảm 0 đ ở trang /deals

## 📋 Mô tả vấn đề

Khi thêm sản phẩm mới có khuyến mãi, trang `/deals` hiển thị giá tiền giảm là **0 đ** thay vì giá giảm thực tế.

## 🔍 Nguyên nhân

Trong hàm `getDeals` tại file `be/src/controllers/product.controller.js`, có các vấn đề sau:

1. **Không xử lý sản phẩm có variants**: 
   - Code chỉ sử dụng `product.price` và `product.compareAtPrice` từ bảng Product chính
   - Không xét đến trường hợp sản phẩm có variants (nhiều biến thể với giá khác nhau)
   - Khi sản phẩm có variants, giá thực tế nằm trong bảng `ProductVariant`, không phải trong `Product.price`

2. **Không kiểm tra điều kiện hợp lệ**:
   - Không đảm bảo `compareAtPrice > price` trước khi tính discount
   - Không kiểm tra giá trị hợp lệ (> 0) trước khi tính toán
   - Dẫn đến trường hợp `compareAtPrice = price` hoặc giá trị không hợp lệ vẫn được tính discount = 0%

3. **Không include variants khi query**:
   - Query ban đầu không include association `variants`
   - Không thể lấy được giá từ variants để tính toán chính xác

## ✅ Giải pháp đã áp dụng

### File: `be/src/controllers/product.controller.js`
### Hàm: `getDeals` (dòng 1649-1733)

### Các thay đổi chính:

#### 1. Thêm include variants vào query
```javascript
include: [
  {
    association: "categories",
    through: { attributes: [] },
  },
  {
    association: "reviews",
    attributes: ["rating"],
  },
  {
    association: "variants",  // ✅ THÊM MỚI
    required: false,
  },
],
```

#### 2. Xử lý logic tính giá cho sản phẩm có variants
```javascript
// Xử lý giá cho sản phẩm có variants
let displayPrice = parseFloat(productJson.price) || 0;
let compareAtPrice = parseFloat(productJson.compareAtPrice) || null;

// Nếu có variants, lấy giá thấp nhất từ variants
if (productJson.variants && productJson.variants.length > 0) {
  const sortedVariants = productJson.variants
    .filter(v => v.price && parseFloat(v.price) > 0)
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  
  if (sortedVariants.length > 0) {
    displayPrice = parseFloat(sortedVariants[0].price);
    // Nếu variant có compareAtPrice, dùng giá đó, nếu không dùng compareAtPrice của product
    if (sortedVariants[0].compareAtPrice && parseFloat(sortedVariants[0].compareAtPrice) > 0) {
      compareAtPrice = parseFloat(sortedVariants[0].compareAtPrice);
    }
  }
}
```

#### 3. Kiểm tra điều kiện hợp lệ trước khi tính discount
```javascript
// Chỉ tính discount nếu compareAtPrice > price và cả hai đều hợp lệ
let discountPercentage = 0;
if (compareAtPrice && compareAtPrice > 0 && displayPrice > 0 && compareAtPrice > displayPrice) {
  discountPercentage = ((compareAtPrice - displayPrice) / compareAtPrice) * 100;
}
```

#### 4. Cập nhật giá trong response
```javascript
return {
  ...productJson,
  price: displayPrice,           // ✅ Cập nhật giá đã xử lý
  compareAtPrice: compareAtPrice, // ✅ Cập nhật compareAtPrice đã xử lý
  discountPercentage,
  ratings,
};
```

#### 5. Lọc chính xác sản phẩm có discount hợp lệ
```javascript
.filter(
  (product) => 
    product.compareAtPrice && 
    product.compareAtPrice > product.price &&
    product.discountPercentage >= parseFloat(minDiscount)
)
```

## 🎯 Kết quả

Sau khi sửa:
- ✅ Sản phẩm có variants sẽ hiển thị đúng giá giảm dựa trên giá variant thấp nhất
- ✅ Chỉ tính discount khi `compareAtPrice > price` và giá trị hợp lệ
- ✅ Trang `/deals` hiển thị đúng giá tiền giảm (không còn 0 đ)
- ✅ Lọc chính xác các sản phẩm có discount thực sự

## 📝 Lưu ý

- Khi tạo sản phẩm mới có khuyến mãi, cần đảm bảo:
  - `compareAtPrice` > `price` (hoặc `variant.compareAtPrice` > `variant.price`)
  - Giá trị phải là số dương hợp lệ
- Đối với sản phẩm có variants, giá giảm sẽ được tính dựa trên variant có giá thấp nhất

## 📅 Ngày sửa

2024-12-19

