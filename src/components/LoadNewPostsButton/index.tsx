import styles from './styles.module.scss';

interface LoadNewPostsButtonProps {
  onLoadNewPosts: () => void;
}

export const LoadNewPostsButton = ({
  onLoadNewPosts,
}: LoadNewPostsButtonProps): JSX.Element => {
  return (
    <button type="button" onClick={onLoadNewPosts} className={styles.button}>
      Carregar mais posts
    </button>
  );
};
