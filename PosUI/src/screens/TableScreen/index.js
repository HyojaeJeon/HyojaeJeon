'use client';

import { useGetTablesQuery, useSelectTableMutation } from '@store/api/index';
import { useDispatch, useSelector } from 'react-redux';
import { setProcessing } from '@store/slices/uiSlice';
import TableCard from './components/TableCard';

export default function TableScreen() {
  const dispatch = useDispatch();
  const isProcessing = useSelector((s) => s.ui.isProcessing);
  const { data, isLoading, error, refetch } = useGetTablesQuery();
  const [selectTable] = useSelectTableMutation();

  const handleSelect = async (tableId) => {
    if (isProcessing) return;
    dispatch(setProcessing({ active: true, action: 'TABLE:SELECT' }));
    try {
      await selectTable({ id: tableId }).unwrap();
    } catch (err) {
      console.error('[TableScreen] selectTable failed:', err);
    } finally {
      dispatch(setProcessing({ active: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-lg text-muted-gray-700">테이블 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        <div className="text-soft-red-500 text-lg">테이블 로드 실패</div>
        <button
          onClick={refetch}
          className="px-6 py-3 bg-blue-600 text-white rounded-[var(--radius-pos-btn)]"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const tables = data?.tables || [];

  return (
    <div className="flex flex-col w-full h-full bg-pos-surface">
      {/* Header */}
      <header className="h-12 flex items-center justify-between px-4 bg-white border-b border-gray-200 shrink-0">
        <h1 className="text-lg font-bold text-pos-text">테이블</h1>
        <div className="flex items-center gap-2 text-sm text-muted-gray-700">
          <span>{tables.length}개 테이블</span>
          <button
            onClick={refetch}
            className="px-3 py-1 rounded-[var(--radius-pos-btn)] bg-muted-gray-500 hover:bg-muted-gray-300 text-pos-text text-xs"
          >
            새로고침
          </button>
        </div>
      </header>

      {/* Table Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-4 gap-4 max-w-[800px] mx-auto">
          {tables.map((table) => (
            <TableCard key={table.id} table={table} onSelect={handleSelect} />
          ))}
        </div>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-[var(--radius-pos-card)] px-8 py-6 shadow-lg text-center">
            <div className="text-lg font-bold text-pos-text">처리중...</div>
            <div className="text-sm text-muted-gray-700 mt-1">잠시 기다려주세요</div>
          </div>
        </div>
      )}
    </div>
  );
}
