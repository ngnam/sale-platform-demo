// src/views/productBenefit/constants.tsx
import type { ColumnProps } from "ant-design-vue/es/table";
import type { ProductBenefitListDto } from "@/apis/types/productBenefit";

/**
 * Columns for Product Benefit list view.
 * This is a simple column definition without custom action rendering.
 */
export const productBenefitColumns: ColumnProps<ProductBenefitListDto>[] = [
  { title: "No", dataIndex: "index", key: "index", width: 80 },
  {
    title: "Benefit Id",
    dataIndex: "benefitId",
    key: "benefitId",
    width: 220,
    sorter: true,
  },
  {
    title: "Benefit Code",
    dataIndex: "benefitCode",
    key: "benefitCode",
    width: 180,
  },
  {
    title: "Benefit Name",
    dataIndex: "benefitName",
    key: "benefitName",
    width: 320,
  },
  {
    title: "Benefit Type",
    dataIndex: "benefitType",
    key: "benefitType",
    width: 160,
  },
  { title: "Plan Id", dataIndex: "planId", key: "planId", width: 180 },
  // action placeholder column (we handle rendering in component via bodyCell slot)
  { title: "Action", key: "action", fixed: "right", width: 180 },
];
