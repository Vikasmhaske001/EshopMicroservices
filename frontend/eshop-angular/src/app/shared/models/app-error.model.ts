export interface AppError {
  status: number;
  title: string;
  detail?: string;
  errors?: Record<string, string[]>;
}
