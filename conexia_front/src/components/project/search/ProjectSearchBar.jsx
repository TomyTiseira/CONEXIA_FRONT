import { Search } from 'lucide-react';

export default function ProjectSearchBar({ filters, onSearch }) {
  return (
    <form
      className="flex items-center w-full bg-white rounded-full shadow px-4 py-2 gap-2 border border-conexia-green/20 focus-within:border-conexia-green transition"
      onSubmit={e => {
        e.preventDefault();
        onSearch(filters);
      }}
    >
      <Search className="text-conexia-green/70 mr-1" size={22} />
      <input
        type="text"
        placeholder="Buscar proyecto, habilidades requeridas, y más ..."
        value={filters.title}
        onChange={e => onSearch({ ...filters, title: e.target.value })}
        className="flex-1 bg-transparent outline-none text-conexia-green placeholder:text-conexia-green/40 text-base px-2"
      />
      <button
        className="bg-conexia-green text-white font-semibold rounded-full px-5 py-2 ml-2 hover:bg-conexia-green/90 transition text-base shadow"
        type="submit"
      >
        Buscar
      </button>
    </form>
  );
}
