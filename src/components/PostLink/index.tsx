import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getFormattedDate } from '../../helpers/format';
import styles from './styles.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostLinkProps {
  post: Post;
}

export const PostLink = ({ post }: PostLinkProps): JSX.Element => {
  return (
    <Link href={`/post/${post.uid}`}>
      <a className={styles.anchor}>
        <h1>{post.data.title}</h1>
        <h2>{post.data.subtitle}</h2>
        <div className={styles.info}>
          <span>
            <FiCalendar />
            <time>
              {getFormattedDate(post.first_publication_date, 'dd MMM yyy')}
            </time>
          </span>
          <span>
            <FiUser />
            <span>{post.data.author}</span>
          </span>
        </div>
      </a>
    </Link>
  );
};
