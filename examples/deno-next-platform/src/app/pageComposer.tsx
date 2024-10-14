import component from './component';

type TPage = {
  index: number;
  component: string;
  props: Record<string, unknown>;
};

export default function ({ page }: { page: TPage[] }) {
  return page.map((item) => {
    const { component: componentName, props } = item;
    const Component = component[componentName];
    return <Component key={item.index} {...props} />;
  });
}
