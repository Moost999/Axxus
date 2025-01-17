// utils/api.ts
export async function sendToFastAPI<T>(
    endpoint: string,
    method: "POST" | "PUT" | "DELETE" | "PATCH",
    body: T
  ): Promise<any> {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  
    try {
      const response = await fetch(`${apiBaseUrl}/${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "An error occurred.");
      }
  
      return await response.json();
    } catch (error) {
      console.error("Error in sendToFastAPI:", error);
      throw error;
    }
  }
  