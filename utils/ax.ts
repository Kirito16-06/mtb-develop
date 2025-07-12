import axios from "axios";

export function getAxiosErrorMessage(
  error: unknown,
  defaultMessage = "An unknown error occurred."
): string {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with a status code outside 2xx
      const { data } = error.response;
      if (data && typeof data === "object") {
        return (
          data.message || // Common API error field
          data.error || // Some APIs use 'error' instead of 'message'
          JSON.stringify(data) // Fallback: Stringify full response if unknown structure
        );
      }
      return `HTTP ${error.response.status}: ${error.response.statusText}`;
    }
    if (error.request) {
      // Request was made but no response received
      return "Network error: No response received from server.";
    }
    // Other Axios-related errors (e.g., request setup issues)
    return `Axios error: ${error.message}`;
  }

  // Handle non-Axios errors
  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
}
