import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useCallback } from 'react';
import Prismic from '@prismicio/client';

import { PostList } from '../components/PostLinkList';
import { LoadNewPostsButton } from '../components/LoadNewPostsButton';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  preview: boolean;
  postsPagination: PostPagination;
}

export const getFormattedPrismicPosts = (posts: Post[]): Post[] => {
  return posts.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title || '',
      subtitle: post.data.subtitle || '',
      author: post.data.author || 'Desconhecido',
    },
  }));
};

export default function Home({
  preview,
  postsPagination,
}: HomeProps): JSX.Element {
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(
    postsPagination.next_page
  );
  const [availablePosts, setAvailablePosts] = useState(postsPagination.results);

  const handleLoadNewPosts = useCallback((): void => {
    fetch(nextPageUrl)
      .then(response => response.json())
      .then(data => {
        const formattedPrismicPosts = getFormattedPrismicPosts(data.results);

        setNextPageUrl(data.next_page);
        setAvailablePosts(prevState => [
          ...prevState,
          ...formattedPrismicPosts,
        ]);
      });
  }, [nextPageUrl, setNextPageUrl, setAvailablePosts]);

  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>

      <div className={commonStyles.container}>
        <PostList posts={availablePosts} />
        {nextPageUrl && (
          <LoadNewPostsButton onLoadNewPosts={handleLoadNewPosts} />
        )}
      </div>
      {preview && (
        <Link href="/api/exit-preview">
          <a className={commonStyles.preview}>Sair do modo preview</a>
        </Link>
      )}
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    { pageSize: 1 }
  );

  const posts = getFormattedPrismicPosts(postsResponse.results);

  return {
    props: {
      preview,
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
  };
};
