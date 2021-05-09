import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { Fragment } from 'react';

import Head from 'next/head';
import React from 'react';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface Post {
  first_publication_date: string | null;
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

export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter();
  const formatted_first_publication_date = format(parseISO(post.first_publication_date), 'dd MMM yyyy', { locale: ptBR } )

  if(isFallback) {
    return (
      <p>Carregando...</p>
    )
  }
  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>

      <Header />

      <header className={styles.header}>
        <img src="/images/Banner.png" alt="banner" />
      </header>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>Como utilizar Hooks</h1>

          <div className={styles.info}>
            <div>
              <img src="/images/calendar.svg" alt="Calendario"/>
              <span>{formatted_first_publication_date}</span>
            </div>

            <div>
              <img src="/images/user.svg" alt="Usuário"/>
              <span>{post.data.author}</span>
            </div>

            <div>
              <img src="/images/clock.svg" alt="Relógio"/>
              <span>4 min</span>
            </div>
          </div>

          <div className={styles.postContent}>
            {post.data.content.map(({heading, body}) => (
              <Fragment key={heading}>
                <h1>{heading}</h1>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(body),
                  }}
                />
              </Fragment>
            ))}
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ]);

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    }
  }))

  return {
    paths,
    fallback: 'blocking'
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  return {
    props: {
      post: response
    }
  }
};
