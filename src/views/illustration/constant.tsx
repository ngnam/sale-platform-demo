import { ColumnProps } from "ant-design-vue/es/table";

export const columns: ColumnProps[] = [
  {
    title: "Mã bảng minh hoạ",
    dataIndex: "illuId",
    width: 200,
    customRender: ({ text }) => (text as string),
  },
  { 
    title: "Kỳ hạn (tháng)",
    dataIndex: "projectionMonths",
    width: 220,
    // sortDirections: ['ascend', 'descend'],
    customRender: ({ text }) => text,
  },
  {
    title: "planId",
    dataIndex: "planId",
    width: 150,
    customRender: ({ text }) => text,
  },
  {
    title: "pricingVersionId",
    dataIndex: "pricingVersionId",
    width: 150,
    customRender: ({ text }) => text,
  },
  {
    title: "Status",
    dataIndex: "status",
    width: 150,
    customRender: ({ text }) => text,
  },
  {
    title: "GeneratedAt",
    dataIndex: "generatedAt",
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
