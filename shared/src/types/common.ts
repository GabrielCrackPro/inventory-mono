/**
 * Generic ID type
 */
export type ID = number | string;

/**
 * Timestamp type
 */
export type Timestamp = Date | string;

/**
 * Generic callback type
 */
export type Callback<T = void> = () => T;

/**
 * Generic callback with parameter
 */
export type CallbackWithParam<P, T = void> = (param: P) => T;

/**
 * Generic event handler
 */
export type EventHandler<T = any> = (event: T) => void;

/**
 * Generic async function
 */
export type AsyncFunction<T = any> = () => Promise<T>;

/**
 * Generic async function with parameter
 */
export type AsyncFunctionWithParam<P, T = any> = (param: P) => Promise<T>;

/**
 * Optional fields utility type
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Required fields utility type
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Deep partial utility type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Non-nullable utility type
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Array element type
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Function parameters type
 */
export type Parameters<T> = T extends (...args: infer P) => any ? P : never;

/**
 * Function return type
 */
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

/**
 * Storage type
 */
export type StorageType = "local" | "session";

/**
 * Sort order
 */
export type SortOrder = "asc" | "desc";

/**
 * Generic key-value pair
 */
export interface KeyValuePair<K = string, V = any> {
  key: K;
  value: V;
}

/**
 * Generic option for select components
 */
export interface SelectOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
  group?: string;
}

/**
 * Generic form field error
 */
export interface FormFieldError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Generic validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: FormFieldError[];
}
