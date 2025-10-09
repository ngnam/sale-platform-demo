import { ColumnProps } from 'ant-design-vue/es/table';
import { h } from 'vue';

export const columns: ColumnProps[] = [
  {
    title: 'No',
    dataIndex: 'index',
    key: 'index',
    width: 80,
  },
  {
    title: 'Plan Id',
    dataIndex: 'planId',
    key: 'planId',
    width: 240,
    sorter: false,
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: 'Product Type',
    dataIndex: 'productType',
    key: 'productType',
    width: 160,
    sorter: false,
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 320,
    sorter: false,
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: 'Currency',
    dataIndex: 'currency',
    key: 'currency',
    width: 120,
    sorter: false,
    sortDirections: ['ascend', 'descend'],
    customRender: ({ text }) => h('span', text ?? 'VND'),
  },
  {
    title: 'Action',
    key: 'action',
    fixed: 'right',
    width: 160,
  }
];
