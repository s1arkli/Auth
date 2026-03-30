/** 负责提供帖子模块使用的内联 SVG（可缩放矢量图形）图标组件。 */
/**
 * @description 渲染帖子搜索框使用的放大镜图标。
 * @returns 搜索图标组件。
 */
export function SearchIcon() {
  return (
    <svg aria-hidden="true" className="forum-icon forum-icon--muted" viewBox="0 0 24 24">
      <path
        d="M10.5 18a7.5 7.5 0 1 1 5.303-2.197L21 21"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

/**
 * @description 渲染发帖按钮使用的加号图标。
 * @returns 加号图标组件。
 */
export function PlusIcon() {
  return (
    <svg aria-hidden="true" className="forum-icon forum-icon--brand" viewBox="0 0 24 24">
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

/**
 * @description 渲染用户菜单展开态使用的箭头图标。
 * @returns 向下箭头图标组件。
 */
export function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" className="forum-icon forum-icon--soft" viewBox="0 0 24 24">
      <path
        d="m6 9 6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

/**
 * @description 根据统计项类型渲染帖子卡片和详情页共用的小图标。
 * @param params {{ type: 'like' | 'comment' | 'view' | 'favorite' }}，要渲染的统计项类型。
 * @returns 对应统计项的图标组件。
 */
export function StatIcon({ type }: { type: 'like' | 'comment' | 'view' | 'favorite' }) {
  if (type === 'like') {
    return (
      <svg aria-hidden="true" className="forum-icon forum-icon--tiny" viewBox="0 0 24 24">
        <path
          d="M7 10v10M7 20H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3m0 9V10m0 10h8.68a2 2 0 0 0 1.98-1.75l.97-7A2 2 0 0 0 16.65 9H13V5.5A2.5 2.5 0 0 0 10.5 3L7 10Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </svg>
    )
  }

  if (type === 'comment') {
    return (
      <svg aria-hidden="true" className="forum-icon forum-icon--tiny" viewBox="0 0 24 24">
        <path
          d="M7 18.5c-2.2 0-4-1.57-4-3.5v-6c0-1.93 1.8-3.5 4-3.5h10c2.2 0 4 1.57 4 3.5v6c0 1.93-1.8 3.5-4 3.5H9l-4 3v-3H7Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </svg>
    )
  }

  if (type === 'view') {
    return (
      <svg aria-hidden="true" className="forum-icon forum-icon--tiny" viewBox="0 0 24 24">
        <path
          d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
        <circle cx="12" cy="12" fill="none" r="2.8" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" className="forum-icon forum-icon--tiny" viewBox="0 0 24 24">
      <path
        d="m12 3 2.76 5.6 6.18.9-4.47 4.36 1.06 6.14L12 17.1 6.47 20l1.06-6.14L3.06 9.5l6.18-.9L12 3Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  )
}
