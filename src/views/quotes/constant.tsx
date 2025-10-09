import { ColumnProps } from "ant-design-vue/es/table";

export const columns: ColumnProps[] = [
  {
    title: "Mã báo giá",
    dataIndex: "quoteId",
    width: 100,
    customRender: ({ text }) => (text as string),
  },
  {
    title: "Mã sản phẩm",
    dataIndex: "planId",
    width: 150,
    // sortDirections: ['ascend', 'descend'],
    customRender: ({ text }) => (text as string),
  },
  {
    title: "Phiên bản định phí",
    dataIndex: "pricingVersionId",
    width: 150,
    customRender: ({ text }) => text,
  },
  {
    title: "Hình thức thanh toán",
    dataIndex: "mode",
    width: 220,
    customRender: ({ text }) => text,
  },
  {
    title: "Kỳ hạn (tháng)",
    dataIndex: "termMonths",
    width: 180,
    customRender: ({ text }) => text,
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    width: 150,
    customRender: ({ text }) => text,
  },
  {
    title: "Ngày tạo",
    dataIndex: "createdAt",
    key: "toDateTime",
    width: 150,
  },
  {
    title: "Hành động",
    key: "action",
    width: 120,
    fixed: "right",
    // slots: { customRender: 'action' },
  },
];
