import { ColumnProps } from "ant-design-vue/es/table";

export const columns: ColumnProps[] = [
  {
    title: "Mã khách hàng",
    dataIndex: "leadId",
    width: 200,
    customRender: ({ text }) => (text as string).slice(0, 5) + "******",
  },
  {
    title: "Tên khách hàng/Tên công ty",
    dataIndex: "fullName",
    width: 220,
    // sortDirections: ['ascend', 'descend'],
    customRender: ({ text }) => text,
  },
  {
    title: "Loại khách hàng",
    dataIndex: "isOrganization",
    width: 150,
    customRender: ({ value }) => {
      const isOrg = value === true;
      return isOrg ? "Tổ chức" : "Cá nhân";
    },
  },
  {
    title: "Mã số thuế/Giấy tờ tuỳ thân",
    dataIndex: "isOrganization",
    width: 220,
    customRender: ({ value, record }: { value: boolean; record: any }) => {
      const isOrg = value === true || record?.isOrganization === true;
      const tax = record?.taxNumber ?? "-";
      const id = record?.idNumber ?? "-";
      return isOrg ? tax : id;
    },
  },
  {
    title: "Số điện thoại",
    dataIndex: "isOrganization",
    width: 180,
    customRender: ({ value, record }: { value: boolean; record: any }) => {
      const isOrg = value === true || record?.isOrganization === true;
      const organizationPhone = record?.organizationPhone ?? "";
      const mobilePhone = record?.mobilePhone ?? "";
      return isOrg ? organizationPhone : mobilePhone;
    },
  },
  {
    title: "Ngày tháng năm sinh",
    dataIndex: "dob",
    key: "toDate",
    width: 220,
    customRender: ({ record }: { value: boolean; record: any }) => {
      const isOrg = record?.isOrganization === true;
      const dob = record?.dob ?? "-";
      return isOrg ? "-" : dob;
    },
  },
  {
    title: "Người đại diện",
    dataIndex: "isOrganization",
    width: 150,
    customRender: ({ value, record }: { value: boolean; record: any }) => {
      const isOrg = value === true || record?.isOrganization === true;
      const representativeFullName = record?.representativeFullName ?? "-";
      return isOrg ? representativeFullName : "-";
    },
  },
  {
    title: "Ngày cập nhật",
    dataIndex: "updatedAt",
    key: "toDateTime",
    width: 150,
    customRender: ({ text }) => text,
  },
  {
    title: "Hành động",
    key: "action",
    width: 120,
    fixed: "right",
    // slots: { customRender: 'action' },
  },
];
