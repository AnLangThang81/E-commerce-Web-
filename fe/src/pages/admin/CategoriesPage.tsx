import React, { useState } from 'react';
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Space,
  message,
  Popconfirm,
  Tag,
  Image,
  Card,
  Typography,
  Collapse,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '@/services/categoryApi';
import type { Category } from '@/types/category.types';

const { Title } = Typography;
const { TextArea } = Input;

interface CategoryFormData {
  name: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  isActive: boolean;
  sortOrder: number;
}

const CategoriesPage: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  // API hooks
  const {
    data: categoriesData,
    isLoading,
    refetch,
  } = useGetAllCategoriesQuery();

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  const categories = Array.isArray(categoriesData?.data)
    ? categoriesData.data
    : categoriesData?.data
      ? [categoriesData.data]
      : [];

  // Build parent category options
  const getParentOptions = (excludeId?: string) => {
    return categories
      .filter((cat) => cat.id !== excludeId && !cat.parentId) // Only root categories
      .map((cat) => ({
        value: cat.id,
        label: cat.name,
      }));
  };

  // Handle create/edit category
  const handleSubmit = async (values: CategoryFormData) => {
    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory.id,
          ...values,
        }).unwrap();
        message.success('Cập nhật danh mục thành công!');
      } else {
        await createCategory(values).unwrap();
        message.success('Tạo danh mục thành công!');
      }

      setIsModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  // Handle delete category
  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id).unwrap();
      message.success('Xóa danh mục thành công!');
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || 'Không thể xóa danh mục!');
    }
  };

  // Open create modal
  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalVisible(true);
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
      sortOrder: 0,
    });
  };

  // Open edit modal
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalVisible(true);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      image: category.image,
      parentId: category.parentId,
      isActive: category.isActive,
      sortOrder: category.sortOrder || 0,
    });
  };

  // Build hierarchical categories
  const buildCategoryTree = (categories: Category[]): (Category & { children: Category[] })[] => {
    const categoryMap = new Map<string, Category & { children: Category[] }>();
    const rootCategories: (Category & { children: Category[] })[] = [];

    // Initialize map
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Build tree
    categories.forEach(cat => {
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(categoryMap.get(cat.id)!);
        }
      } else {
        rootCategories.push(categoryMap.get(cat.id)!);
      }
    });

    return rootCategories;
  };

  const categoryTree = buildCategoryTree(categories);

  // Render category item
  const renderCategoryItem = (category: Category & { children: Category[] }) => (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              width={40}
              height={40}
              style={{ objectFit: 'cover', borderRadius: 4 }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
              <FolderOutlined className="text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900 dark:text-white">{category.name}</div>
          <div className="text-sm text-gray-500">{category.slug}</div>
          {category.description && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-md truncate" title={category.description}>
              {category.description}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Tag color={category.isActive ? 'success' : 'error'}>
            {category.isActive ? 'Hoạt động' : 'Ẩn'}
          </Tag>
          <span className="text-sm text-gray-500">Thứ tự: {category.sortOrder || 0}</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(category)}
          size="small"
        />
        <Popconfirm
          title="Xóa danh mục"
          description="Bạn có chắc chắn muốn xóa danh mục này?"
          onConfirm={() => handleDelete(category.id)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Button type="link" icon={<DeleteOutlined />} danger size="small" />
        </Popconfirm>
      </div>
    </div>
  );

  // Render child category item
  const renderChildCategoryItem = (category: Category) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-2 ml-8 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              width={32}
              height={32}
              style={{ objectFit: 'cover', borderRadius: 4 }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
              <FolderOutlined className="text-gray-400 text-sm" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900 dark:text-white">{category.name}</div>
          <div className="text-sm text-gray-500">{category.slug}</div>
          {category.description && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-md truncate" title={category.description}>
              {category.description}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Tag color={category.isActive ? 'success' : 'error'}>
            {category.isActive ? 'Hoạt động' : 'Ẩn'}
          </Tag>
          <span className="text-sm text-gray-500">Thứ tự: {category.sortOrder || 0}</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(category)}
          size="small"
        />
        <Popconfirm
          title="Xóa danh mục"
          description="Bạn có chắc chắn muốn xóa danh mục này?"
          onConfirm={() => handleDelete(category.id)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Button type="link" icon={<DeleteOutlined />} danger size="small" />
        </Popconfirm>
      </div>
    </div>
  );

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <Card className="dark:bg-neutral-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <Title
              level={2}
              className="!mb-1 text-xl md:text-2xl dark:text-white"
            >
              Quản lý danh mục
            </Title>
            <p className="text-neutral-600 dark:text-neutral-400">
              Quản lý danh mục sản phẩm của cửa hàng
            </p>
          </div>
          <Space className="flex-wrap">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isLoading}
              className="dark:text-neutral-300"
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Thêm danh mục
            </Button>
          </Space>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : categoryTree.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Không có danh mục nào</div>
          ) : (
            categoryTree.map((category) => (
              <div key={category.id}>
                {renderCategoryItem(category)}
                {category.children.map((child) => (
                  <div key={child.id}>
                    {renderChildCategoryItem(child)}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        <Modal
          title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingCategory(null);
            form.resetFields();
          }}
          footer={null}
          width={600}
          className="dark:ant-modal-dark"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              isActive: true,
              sortOrder: 0,
            }}
            className="dark:text-neutral-300"
          >
            <Form.Item
              name="name"
              label={
                <span className="dark:text-neutral-300">Tên danh mục</span>
              }
              rules={[
                { required: true, message: 'Vui lòng nhập tên danh mục!' },
                { min: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự!' },
              ]}
            >
              <Input placeholder="Nhập tên danh mục" />
            </Form.Item>

            <Form.Item
              name="description"
              label={<span className="dark:text-neutral-300">Mô tả</span>}
            >
              <TextArea
                rows={3}
                placeholder="Nhập mô tả cho danh mục (không bắt buộc)"
              />
            </Form.Item>

            <Form.Item
              name="image"
              label={<span className="dark:text-neutral-300">Hình ảnh</span>}
            >
              <Input placeholder="Nhập URL hình ảnh (không bắt buộc)" />
            </Form.Item>

            <Form.Item
              name="parentId"
              label={
                <span className="dark:text-neutral-300">Danh mục cha</span>
              }
            >
              <Select
                placeholder="Chọn danh mục cha (để trống nếu là danh mục gốc)"
                allowClear
                options={getParentOptions(editingCategory?.id)}
              />
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                name="sortOrder"
                label={
                  <span className="dark:text-neutral-300">Thứ tự sắp xếp</span>
                }
              >
                <InputNumber min={0} placeholder="0" className="w-full" />
              </Form.Item>

              <Form.Item
                name="isActive"
                label={
                  <span className="dark:text-neutral-300">Trạng thái</span>
                }
                valuePropName="checked"
              >
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Ẩn" />
              </Form.Item>
            </div>

            <div className="flex flex-wrap justify-end gap-2 mt-6">
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingCategory(null);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isCreating || isUpdating}
              >
                {editingCategory ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default CategoriesPage;
