export const POST_TYPE = {
    DEFAULT: 0,
    TYPE_1: 1,
    TYPE_2: 2,
    TYPE_3: 3,
} as const;

export const POST_SORT = {
    DEFAULT: 0,
    HOT: 1,
    NEW: 2,
} as const;

export type PostTypeValue = typeof POST_TYPE[keyof typeof POST_TYPE];
export type PostSortValue = typeof POST_SORT[keyof typeof POST_SORT];
