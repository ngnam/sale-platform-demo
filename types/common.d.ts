interface ObjTy {
  [propName: string]: any;
}

type IOptions<T = number> = Array<{
  label: string;
  value: T;
}>;
