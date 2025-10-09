import { ColumnProps } from "ant-design-vue/es/table";
import { h } from "vue";
import type { PlanVersionDto } from "@/apis/types/planVersion";

export const columns: ColumnProps<PlanVersionDto>[] = [
  {
    title: "No",
    dataIndex: "index",
    key: "index",
    width: 80,
  },
  {
    title: "Pricing Version Id",
    dataIndex: "pricingVersionId",
    key: "pricingVersionId",
    width: 240,
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
  {
    title: "Rounding Premium",
    dataIndex: "roundingPremium",
    key: "roundingPremium",
    width: 180,
    customRender: ({ text }) => h("span", text ?? "-"),
  },
  {
    title: "Rounding Cash Val",
    dataIndex: "roundingCashVal",
    key: "roundingCashVal",
    width: 180,
    customRender: ({ text }) => h("span", text ?? "-"),
  },
  {
    title: "Action",
    key: "action",
    fixed: "right",
    width: 160,
  },
];
