import { redirect } from 'next/navigation'

export default function TVPage({ params }: { params: { id: string } }) {
  redirect(`/series/${params.id}`)
}
