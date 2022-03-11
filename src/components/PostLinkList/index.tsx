import { PostLink } from '../PostLink';

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

interface PostListProps {
  posts: Post[];
}

export const PostList = ({ posts }: PostListProps): JSX.Element => {
  return (
    <ul className={styles.list}>
      {posts.map(post => (
        <li key={post.uid}>
          <PostLink post={post} />
        </li>
      ))}
    </ul>
  );
};
