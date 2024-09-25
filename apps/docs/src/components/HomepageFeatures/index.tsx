import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Rapid API Generation',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Mercury.js simplifies backend service development by generating Mongoose models, CRUD operations, GraphQL typedefs, and resolvers from a JSON model.
      </>
    ),
  },
  {
    title: 'Advanced Access Control',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        With Mercury.js, you can define field-level and operation-level permissions, ensuring robust access control for your data.
      </>
    ),
  },
  {
    title: 'Seamless Integration',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Easily integrate Mercury.js with your preferred frameworks like Next.js and Express, and start building your API backend in no time.
      </>
    ),
  },
  {
    title: 'Custom Hooks',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Implement custom logic before or after certain operations on your models using Mercury.js's powerful hook system.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
