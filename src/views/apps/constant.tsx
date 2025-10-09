import { ColumnProps } from "ant-design-vue/es/table";

export const columns: ColumnProps[] = [
  {
    title: "Mã hồ sơ YCBH",
    dataIndex: "appId",
    width: 200,
    customRender: ({ text }) => (text as string).slice(0, 5) + "******",
  },
  {
    title: "Tên khách hàng/Tên công ty",
    dataIndex: ["lead", "fullName"],
    width: 220,
    // sortDirections: ['ascend', 'descend'],
    customRender: ({ text }) => text,
  },
  {
    title: "Loại khách hàng",
    dataIndex: ["lead", "isOrganization"],
    width: 150,
    customRender: ({ value }) => {
      const isOrg = value === true;
      return isOrg ? "Tổ chức" : "Cá nhân";
    },
  },
  {
    title: "Mã số thuế/Giấy tờ tuỳ thân",
    dataIndex: ["lead", "isOrganization"],
    width: 220,
    customRender: ({ value, record }: { value: boolean; record: any }) => {
      const isOrg = value === true || record?.lead?.isOrganization === true;
      const tax = record?.lead?.taxNumber ?? "-";
      const id = record?.lead.idNumber ?? "-";
      return isOrg ? tax : id;
    },
  },
  {
    title: "Giới tính",
    dataIndex: ["lead","gender"],
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
    title: "Ngày cập nhật",
    dataIndex: "updatedAt",
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
