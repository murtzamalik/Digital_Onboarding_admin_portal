import { useOutletContext } from 'react-router-dom'
import { type AdminSession } from './api/types'

export type AdminOutletContextValue = {
  session: AdminSession | null
  /** False until the first `/session` request finishes (success or failure). */
  sessionReady: boolean
}

export function useAdminOutletContext(): AdminOutletContextValue {
  const ctx = useOutletContext<AdminOutletContextValue | undefined>()
  return ctx ?? { session: null, sessionReady: false }
}
