import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import '../App.css';
import styles from './index.module.css';
import HeroBanner from '../components/HeroBanner';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <meta name="description" content="@mercury-js/core is a rapid API generation package that simplifies backend service development by generating Mongoose models, CRUD operations, GraphQL typedefs, and resolvers from a JSON model. It also supports pre- and post-event hooks and access control via profiles, enabling field-level and operation-level permissions." />
      <div className="container">
        <HeroBanner />
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="">{siteConfig.tagline}</p>

        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro"
          >
            Mercury Js Tutorial - 10min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <body className="flex justify-center items-center w-full">
      <div className="max-w-screen-2xl justify-center w-full">
        <HeroBanner />
      </div>
    </body>
  ); 
}
// <Layout
//   title={`${siteConfig.tagline}`}
//   description="Description will go into a meta tag in <head />"
// >
//   {/* <HomepageHeader />
//   <main>
//     <HomepageFeatures />
//   </main> */}
// </Layout>
