import components, { IComponents } from './component';
import { FC } from 'react';

type TPage = {
  index: number;
  component: string;
  props: Record<string, unknown>;
};

export default function ({ page }: { page: TPage[] }) {
  return page.map((item) => {
    const { component: componentName, props } = item;
    const Component = components[componentName as keyof IComponents] as FC<any>;
    return <Component key={item.index} components={components} {...props} />;
  });
}
