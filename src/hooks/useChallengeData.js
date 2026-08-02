/**
 * useChallengeData — thin proxy to ChallengeDataContext.
 *
 * Every page file imports and calls this hook exactly as before.
 * No page file needs to change. The hook now just reads from the shared
 * context instead of owning its own state, which means:
 *
 *  - Data is fetched ONCE when the user logs in, not on every page mount.
 *  - Navigating between pages never triggers a re-fetch or loading flash.
 *  - Calling refresh() after a mutation still works exactly as expected.
 *
 * The actual logic lives in context/ChallengeDataContext.jsx.
 */
import { useChallengeDataContext } from '../context/ChallengeDataContext'

export function useChallengeData() {
  return useChallengeDataContext()
}
