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

export const getFormattedDate = (date: string, formatting: string): string => {
  return format(new Date(date), formatting, { locale: ptBR });
};
