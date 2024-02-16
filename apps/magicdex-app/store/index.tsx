import { create } from 'zustand'


interface CollectionStore {
  stagingAreaCard: object
  selectedRowCard: object

  setStagingAreaCard: (card: object) => void
  setSelectedRowCard: (card: object) => void
  clearStagingArea: () => void
  clearSelectedRow: () => void
}

export const useCollectionStore = create<CollectionStore>(set => ({
  stagingAreaCard: {},
  selectedRowCard: {},

  setStagingAreaCard: card => set({ stagingAreaCard: card ?? {} }),
  setSelectedRowCard: card => set({ selectedRowCard: card ?? {} }),
  clearSelectedRow: () => set({ selectedRowCard: {} }),
  clearStagingArea: () => set({ stagingAreaCard: {} }),
}))
