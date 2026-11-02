import { redirect } from 'next/navigation'

// Server-side legacy redirect to canonical monastery directions route
export default function LegacyMonterDirections({ params }: { params: { id: string } }) {
  redirect(`/monastery/${params.id}/directions`)
}
