import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Link from "next/link";

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const { results, next_page } = postsPagination;

  const [posts, setPosts] = useState(results);
  const [nextPage, setNextPage] = useState(next_page);

  const formattedPosts = posts.map(post => {
    return {
      ...post,
      first_publication_date: format(parseISO(post.first_publication_date), 'dd MMM yyyy', { locale: ptBR } )
    }
  })

  async function loadMorePosts() {
    fetch(nextPage).then(response => response.json())
      .then(data => {
        setPosts(data.results)
        setNextPage(data.next_page)
      })
  }


  return (
    <>
      <header className={styles.header}>
        <img src="/images/logo.svg" alt="logo"/>
      </header>

      <main className={styles.container}>
        {formattedPosts.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a className={styles.post} >
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>

              <div className={styles.footer}>
                <div>
                  <img src="/images/calendar.svg" alt="Calendario"/>
                  <span>{post.first_publication_date}</span>
                </div>

                <div>
                  <img src="/images/user.svg" alt="Usuário"/>
                  <span>{post.data.author}</span>
                </div>
              </div>
            </a>
          </Link>
        ))}

        {next_page && (
          <button type="button" onClick={loadMorePosts}>Carregar mais posts</button>
        )}
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 5,
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results,
  }

  return {
    props: {
      postsPagination
    }
  }
};
