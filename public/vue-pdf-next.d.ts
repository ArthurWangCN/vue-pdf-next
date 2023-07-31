import { ComputedOptions, DefineComponent, MethodOptions } from 'vue';

export interface VuePdfNextProps {
  url: string;
}

export interface VuePdfNextData {
  document: object | null;
  pageCount: number | null;
  pageNums: number[];
}

export interface VuePdfNextMethods extends MethodOptions {
  print: (dpi?: number, filename?: string, allPages?: boolean) => Promise<void>;
  render: () => Promise<void>;
}


declare const VuePdfNext: DefineComponent<
  VuePdfNextProps,
  {},
  VuePdfNextData,
  ComputedOptions,
  VuePdfNextMethods
>;

export default VuePdfNext;