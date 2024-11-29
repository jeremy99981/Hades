export function formatDate(dateString?: string): string {
  if (!dateString) return 'Date inconnue';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Date invalide';

  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}
