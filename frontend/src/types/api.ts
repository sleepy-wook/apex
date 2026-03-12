export interface ApiResponse<T> {
  data: T;
  cached: boolean;
}

export interface ApiError {
  detail: string;
  status_code: number;
}
