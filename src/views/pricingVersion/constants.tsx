import { h } from "vue";
import { PricingVersionDto } from "@/apis/types/pricingVersion";
import { ColumnProps } from "ant-design-vue/es/table";
import { formatToDate, toIsoIfDateLike } from "@/utils/dateUtil";

export const columns: ColumnProps<PricingVersionDto>[] = [
  { title: "No", dataIndex: "index", key: "index", width: 80 },
  {
    title: "Pricing Version Id",
    dataIndex: "pricingVersionId",
    key: "pricingVersionId",
    width: 240,
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
  {
    title: "Effective From",
    dataIndex: "effectiveFrom",
    key: "effectiveFrom",
    width: 180,
    customRender: ({ text }) =>
      h("span", text ? formatToDate(toIsoIfDateLike(text)) : "-"),
  },
  {
    title: "Effective To",
    dataIndex: "effectiveTo",
    key: "effectiveTo",
    width: 180,
    customRender: ({ text }) =>
      h("span", text ? formatToDate(toIsoIfDateLike(text)) : "-"),
  },
  { title: "Status", dataIndex: "status", key: "status", width: 120 },
  {
    title: "Action",
    key: "action",
    fixed: "right",
    width: 80,
  },
];
