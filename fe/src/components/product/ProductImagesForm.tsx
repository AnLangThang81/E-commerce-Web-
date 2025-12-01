import React, { useEffect, useState } from "react";
import { Form, Input, Row, Col, Alert } from "antd";
import type { FormInstance } from "antd/es/form";
import ImageUploader from "../upload/ImageUploader";

type Props = { form?: FormInstance };

const ProductImagesForm: React.FC<Props> = ({ form }) => {
  // Sử dụng Form.useWatch để tự động sync với form field values
  // Note: Form.useWatch có thể được gọi mà không cần form nếu component nằm trong Form
  const imagesValue = Form.useWatch("images", form);
  const thumbnailValue = Form.useWatch("thumbnail", form);

  const [localUrls, setLocalUrls] = useState<string[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");

  // Sync form values khi component mount hoặc form field values thay đổi
  useEffect(() => {
    if (imagesValue !== undefined) {
      const parsedUrls = (imagesValue || "")
        .split("\n")
        .filter((u) => u.trim() !== "");
      setLocalUrls(parsedUrls);
    } else if (form) {
      // Fallback: lấy từ form nếu useWatch không hoạt động
      const images: string = form.getFieldValue("images") || "";
      const parsedUrls = images.split("\n").filter((u) => u.trim() !== "");
      setLocalUrls(parsedUrls);
    }
  }, [imagesValue, form]);

  useEffect(() => {
    if (thumbnailValue !== undefined) {
      setThumbnailUrl(thumbnailValue || "");
    } else if (form) {
      // Fallback: lấy từ form nếu useWatch không hoạt động
      const thumb: string = form.getFieldValue("thumbnail") || "";
      setThumbnailUrl(thumb);
    }
  }, [thumbnailValue, form]);

  // Khi ImageUploader trả về danh sách URL mới
  const handleUrlsChange = (urls: string[]) => {
    if (!form) {
      // Nếu không có form, chỉ update state
      setLocalUrls((prev) => {
        const merged = Array.from(new Set([...prev, ...urls]));
        return merged;
      });
      return;
    }

    // Lấy danh sách URL hiện tại từ form
    const current: string = form.getFieldValue("images") || "";
    const currentUrls = current
      ? current.split("\n").filter((u) => u.trim() !== "")
      : [];

    // Merge và loại bỏ duplicate
    const merged = Array.from(new Set([...currentUrls, ...urls]));
    const mergedString = merged.join("\n");

    // Cập nhật state NGAY LẬP TỨC (không đợi useEffect) để hiển thị ngay
    setLocalUrls(merged);

    // Tự động set ảnh đầu tiên làm thumbnail nếu thumbnail đang trống
    const currentThumbnail = form.getFieldValue("thumbnail") || "";
    if (!currentThumbnail && urls.length > 0) {
      const firstUrl = urls[0];
      setThumbnailUrl(firstUrl);
      form.setFieldsValue({ thumbnail: firstUrl });
    }

    // Cập nhật form field - điều này sẽ trigger Form.useWatch và re-render
    form.setFieldsValue({ images: mergedString });

    // Đảm bảo form biết về thay đổi này
    form.validateFields(["images"]).catch(() => {});
  };

  // Khi thumbnail thay đổi
  const handleThumbnailChange = (url: string) => {
    setThumbnailUrl(url);
    form?.setFieldsValue({ thumbnail: url });
  };

  return (
    <Row gutter={[24, 16]}>
      <Col span={24}>
        <Form.Item label="Tải ảnh" tooltip="Tối đa 10 ảnh, 10MB mỗi ảnh">
          <ImageUploader
            productId={form?.getFieldValue("id")}
            onUrlsChange={handleUrlsChange}
            onThumbnailChange={handleThumbnailChange} // nếu uploader có thumbnail
          />
        </Form.Item>

        <Form.Item name="images" label="Hoặc dán URL (mỗi dòng một URL)">
          <Input.TextArea
            rows={6}
            value={localUrls.join("\n")}
            onChange={(e) => {
              const lines = e.target.value.split("\n");
              setLocalUrls(lines);
              form?.setFieldsValue({ images: lines.join("\n") });
            }}
          />
        </Form.Item>
      </Col>

      <Col span={24}>
        <Form.Item name="thumbnail" label="Ảnh đại diện">
          <Input
            placeholder="Nhập URL ảnh đại diện"
            value={thumbnailUrl}
            onChange={(e) => handleThumbnailChange(e.target.value)}
          />
        </Form.Item>
      </Col>

      <Col span={24}>
        <Alert
          message="Hướng dẫn hình ảnh"
          description={
            <div>
              <p>
                <strong>📝 Cách nhập:</strong> Mỗi URL hình ảnh trên một dòng
                riêng biệt
              </p>
              <p>
                <strong>🖼️ Yêu cầu:</strong> Tỷ lệ 1:1 hoặc 4:3, tối thiểu
                400x400px
              </p>
              <p>
                <strong>📁 Định dạng:</strong> JPG, PNG, WebP
              </p>
              <p>
                <strong>🎯 Ảnh đại diện:</strong> Hiển thị trong danh sách sản
                phẩm
              </p>
              <p>
                <strong>🔗 Backend:</strong> Sử dụng
                http://localhost:5000/uploads cho local images (KHÔNG dùng
                /api/uploads)
              </p>
            </div>
          }
          type="info"
          showIcon
        />
      </Col>
    </Row>
  );
};

export default ProductImagesForm;
