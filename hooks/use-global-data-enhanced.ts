import useSWR from "swr"

// Custom fetcher with cache-busting
const fetcher = async (url: string) => {
  const response = await fetch(`${url}?t=${Date.now()}`)
  if (!response.ok) {
    throw new Error("Failed to fetch data")
  }
  return response.json()
}

export function useGlobalDataEnhanced<T>(key: string, initialData: T) {
  // Use SWR for data fetching with auto-revalidation
  const { data, error, mutate } = useSWR<T>(`/api/global-data/${key}`, fetcher, {
    fallbackData: initialData,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 30000, // Refresh every 30 seconds
    dedupingInterval: 5000, // Dedupe requests within 5 seconds
  })

  // Save data function with optimistic updates
  const saveData = async (newData: T): Promise<boolean> => {
    try {
      // Optimistically update the local data
      mutate(newData, false)

      // Send the update to the server
      const response = await fetch(`/api/global-data/${key}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      })

      if (!response.ok) {
        // If the server request fails, revert the optimistic update
        mutate()
        return false
      }

      // Trigger a revalidation to ensure we have the latest data
      mutate()
      return true
    } catch (error) {
      console.error(`Error saving ${key} data:`, error)
      // Revert the optimistic update
      mutate()
      return false
    }
  }

  return {
    data: data || initialData,
    isLoading: !error && !data,
    isError: !!error,
    saveData,
    mutate,
  }
}
