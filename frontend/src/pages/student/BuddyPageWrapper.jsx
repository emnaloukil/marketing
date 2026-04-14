import BuddyPage from './BuddyPage'
import { StudentProvider } from '../../context/Studentcontext'

export default function BuddyPageWrapper() {
  return (
    <StudentProvider>
      <BuddyPage />
    </StudentProvider>
  )
}
