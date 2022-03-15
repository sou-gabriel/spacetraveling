/* eslint-disable no-param-reassign */
/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';
import { getFormattedDate } from '../../helpers/format';

import styles from './post.module.scss';
import commonStyles from '../../styles/common.module.scss';

interface Post {
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
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
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
            )}
          </div>
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

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const post = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post,
    },
    revalidate: 60 * 30,
  };
};
