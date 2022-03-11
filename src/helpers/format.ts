import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

export const getFormattedDate = (date: string): string => {
  return format(new Date(date), 'dd MMM yyy', { locale: ptBR });
};
