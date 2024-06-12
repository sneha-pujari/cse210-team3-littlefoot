import {
  getAvailableHeight,
  repositionPopover,
  repositionTooltip,
  getMaxHeight,
  getLeftInPixels,
  type Position,
} from './layout'
import type { Footnote } from '../use-cases'
import { addClass, hasClass, removeClass } from './element'

const CLASS_ACTIVE = 'is-active'
const CLASS_CHANGING = 'is-changing'
const CLASS_SCROLLABLE = 'is-scrollable'

export type FootnoteElements = Readonly<{
  id: string
  host: HTMLElement
  button: HTMLElement
  popover: HTMLElement
  content: HTMLElement
  wrapper: HTMLElement
}>

const isMounted = (popover: HTMLElement) => document.body.contains(popover)

export function footnoteActions({
  id,
  button,
  content,
  host,
  popover,
  wrapper,
}: FootnoteElements): Footnote<HTMLElement> {
  let maxHeight = 0
  let position: Position = 'above'

  return {
    id,

    activate: (onActivate) => {
      button.setAttribute('aria-expanded', 'true')
      addClass(button, CLASS_CHANGING)
      addClass(button, CLASS_ACTIVE)

      button.insertAdjacentElement('afterend', popover)

      popover.style.maxWidth = document.body.clientWidth + 'px'
      maxHeight = getMaxHeight(content)

      onActivate?.(popover, button)
    },

    dismiss: (onDismiss) => {
      button.setAttribute('aria-expanded', 'false')
      addClass(button, CLASS_CHANGING)
      removeClass(button, CLASS_ACTIVE)
      removeClass(popover, CLASS_ACTIVE)

      onDismiss?.(popover, button)
    },

    isActive: () => hasClass(button, CLASS_ACTIVE),

    isReady: () => !hasClass(button, CLASS_CHANGING),

    ready: () => {
      addClass(popover, CLASS_ACTIVE)
      removeClass(button, CLASS_CHANGING)
    },

    remove: () => {
      popover.remove()
      removeClass(button, CLASS_CHANGING)
    },

    reposition: () => {
      if (isMounted(popover)) {
        content.style.maxHeight =
          getAvailableHeight(popover, button, maxHeight) + 'px'
        position = repositionPopover(popover, button, position)

        if (popover.offsetHeight < content.scrollHeight) {
          addClass(popover, CLASS_SCROLLABLE)
          content.setAttribute('tabindex', '0')
        } else {
          removeClass(popover, CLASS_SCROLLABLE)
          content.removeAttribute('tabindex')
        }
      }
    },

    resize: () => {
      if (isMounted(popover)) {
        popover.style.left = getLeftInPixels(content, button) + 'px'
        wrapper.style.maxWidth = content.offsetWidth + 'px'
        repositionTooltip(popover, button)
      }
    },

    destroy: () => host.remove(),
  }
}
