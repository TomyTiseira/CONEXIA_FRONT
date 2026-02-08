import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GlobalSearchBar() {
	const [query, setQuery] = useState("");
	const router = useRouter();

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && query.trim()) {
			router.push(`/search?q=${encodeURIComponent(query.trim())}`);
		}
	};

	return (
		<div className="flex items-center w-72 mx-6">
			<input
				type="text"
				className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green"
				placeholder="Buscar personas, proyectos, servicios..."
				value={query}
				onChange={e => setQuery(e.target.value)}
				onKeyDown={handleKeyDown}
			/>
		</div>
	);
}
