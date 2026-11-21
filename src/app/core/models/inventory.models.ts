export type ItemCategory = 'ALL' | 'CONSUMIBLES' | 'COMIDA' | 'COSMETICOS' | 'MUEBLES' | 'MISC' | 'FOOD' | 'CHIP_STATS';

export interface InventoryItem {
  id: string;              // ID de la fila en user_inventory
  itemId: string;
  name: string;
  category: ItemCategory;
  description: string;
  iconUrl: string;
  quantity: number;        // (> 0)
  isStackable: boolean;
  maxStack: number;
  hungerRestore: number;
  friendshipGain: number;
  obtentionDate?: string;
  assignedDigimonId?: string | null;
}

export interface UseItemResponse {
  status: string;
  message: string;
  data: {
    digimonId: string;
    consumedItemId: string;
    remainingQuantity: number;
    updatedHunger: number;
    updatedFriendship: number;
  };
}