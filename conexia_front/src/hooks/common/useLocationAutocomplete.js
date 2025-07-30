import { useEffect, useState } from 'react';

export default function useLocationAutocomplete(query) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.length < 2) return;
    const controller = new AbortController();

    fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
      query
    )}&apiKey=TU_API_KEY`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setResults(data.features.map((f) => ({
          label: f.properties.formatted,
          value: f.properties.formatted,
        })));
      })
      .catch(() => {});

    return () => controller.abort();
  }, [query]);

  return results;
}