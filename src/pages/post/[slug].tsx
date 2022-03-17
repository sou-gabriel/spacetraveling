/* eslint-disable no-param-reassign */
/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useCallback } from 'react';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../../services/prismic';
import { getFormattedDate } from '../../helpers/format';
import { Comments } from '../../components/Comments';

import styles from './post.module.scss';
import commonStyles from '../../styles/common.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  preview: boolean;
  post: Post;
  beforePost: Post | null;
  afterPost: Post | null;
}

export default function Post({
  beforePost,
  afterPost,
  preview,
  post,
}: PostProps): JSX.Element {
  const router = useRouter();

  const formattedLastEditDate = getFormattedDate(
    post.last_publication_date,
    'dd MMM yyy, kk:MM'
  ).replace(', ', ', às ');

  const getTotalWords = useCallback((): number => {
    const totalWords = post.data.content.reduce((acc, item) => {
      const headingWordsAmount = item.heading.split(/\s+/).length;
      const bodyWordsAmount = RichText.asText(item.body).split(/\s+/).length;

      acc += headingWordsAmount + bodyWordsAmount;
      return acc;
    }, 0);

    return totalWords;
  }, [post]);

  const getReadingTime = useCallback((): number => {
    const amountWordsReadPerMinute = 200;
    const totalWords = getTotalWords();

    return Math.ceil(totalWords / amountWordsReadPerMinute);
  }, [getTotalWords]);

  return (
    <>
      <div className={styles.container}>
        <main>
          <div>
            {router.isFallback ? (
              <p>Carregando...</p>
            ) : (
              <>
                <article className={styles.post}>
                  <img src={post.data.banner.url} alt="Banner" />
                  <div className={commonStyles.container}>
                    <header>
                      <h1>{post.data.title}</h1>
                      <div className={commonStyles.info}>
                        <span>
                          <FiCalendar />
                          <time>
                            {getFormattedDate(
                              post.first_publication_date,
                              'dd MMM yyy'
                            )}
                          </time>
                        </span>
                        <span>
                          <FiUser />
                          <span>{post.data.author}</span>
                        </span>
                        <span>
                          <FiClock />
                          <time>{getReadingTime()} min</time>
                        </span>
                      </div>
                      <p className={styles.editedAt}>
                        * editado em {formattedLastEditDate}
                      </p>{' '}
                    </header>

                    {post.data.content.map(item => (
                      <div key={item.heading} className={styles.content}>
                        <h2>{item.heading}</h2>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: RichText.asHtml(item.body),
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </article>
                <hr className={commonStyles.container} />
                <div
                  className={`${commonStyles.container} ${styles.navigationBetweenPosts}`}
                >
                  {beforePost && (
                    <div className={styles.beforePost}>
                      <p>{beforePost.data.title}</p>
                      <Link href={`/post/${beforePost.uid}`}>
                        Post anterior
                      </Link>
                    </div>
                  )}
                  {afterPost && (
                    <div className={styles.afterPost}>
                      <p>{afterPost.data.title}</p>
                      <Link href={`/post/${afterPost.uid}`}>Próximo post</Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <Comments />

          {preview && (
            <aside>
              <Link href="/api/exit-preview">
                <a className={commonStyles.preview}>Sair do modo preview</a>
              </Link>
            </aside>
          )}
        </main>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query('');

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const post = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const timestamp = new Date(post.first_publication_date).getTime();

  const beforePost = await prismic.query([
    Prismic.predicates.dateBefore('document.first_publication_date', timestamp),
  ]);

  const afterPost = await prismic.query([
    Prismic.predicates.dateAfter('document.first_publication_date', timestamp),
  ]);

  return {
    props: {
      preview,
      post,
      beforePost: beforePost.results[0] || null,
      afterPost: afterPost.results[0] || null,
    },
    revalidate: 60 * 30,
  };
};
