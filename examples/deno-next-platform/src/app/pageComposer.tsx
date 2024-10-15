import components from './component';

type TPage = {
  index: number;
  component: string;
  props: Record<string, unknown>;
};

export default async function ({ page }: { page: TPage[] }) {
  const componentsList = await components();
  return page.map((item) => {
    const { component: componentName, props } = item;
    const Component = componentsList[componentName];
    return <Component key={item.index} {...props} />;
  });
}
