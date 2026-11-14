import {
  deleteDesign as deleteDesignAction,
  getUserDesigns as getUserDesignsAction,
  saveDesign as saveDesignAction,
  type Design,
} from "@/app/actions/designs-action";

export type { Design };

export async function saveDesign(...args: Parameters<typeof saveDesignAction>) {
  return saveDesignAction(...args);
}

export async function getUserDesigns() {
  return getUserDesignsAction();
}

export async function deleteDesign(
  ...args: Parameters<typeof deleteDesignAction>
) {
  return deleteDesignAction(...args);
}
