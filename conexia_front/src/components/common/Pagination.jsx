import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, hasNextPage, hasPreviousPage, onPageChange }) {
  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
      className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-conexia-green text-conexia-green hover:bg-conexia-green hover:text-white transition-colors disabled:opacity-50"
      disabled={!hasPreviousPage}
      onClick={() => onPageChange(page - 1)}
    >
         <ChevronLeft className="w-5 h-5 stroke-[3]" />
      </button>

      <span className="bg-conexia-green text-white rounded-full w-8 h-8 flex items-center justify-center font-medium">
        {page}
      </span>

      <button
        className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-conexia-green text-conexia-green hover:bg-conexia-green hover:text-white transition-colors disabled:opacity-50"
        disabled={!hasNextPage}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="w-5 h-5 stroke-[3]" />
      </button>
    </div>
  );
}
