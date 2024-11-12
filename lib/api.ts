import { toast } from "sonner";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return { data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    toast.error(message);
    return { error: message };
  }
}