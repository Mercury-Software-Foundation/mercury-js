import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Button',
  argTypes: {
    children: {
      control: {
        type: 'text',
      },
    },
    role: {
      control: {
        type: 'select',
        options: ['primary', 'destructive', 'cancel', 'normal'],
      },
    },
    size: {
      control: {
        type: 'select',
        options: ['small', 'medium', 'large'],
      },
    },
    variant: {
      control: {
        type: 'select',
        options: ['filled', 'tinted', 'gray', 'plain'],
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Role: Story = {
  args: {
    children: 'Add',
    role: 'destructive',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('destructive')).toHaveStyle(
      `background-color: rgb(255, 0, 0);`
    );
  },
};

export const Size: Story = {
  args: {
    children: 'Add',
    size: 'small',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Add/gi)).toHaveStyle(`padding: 8px 10px;`);
    expect(canvas.getByText(/Add/gi)).toHaveStyle(`font-size: 14px;`);
  },
};

export const Default: Story = {
  args: {
    children: 'Add',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Add/gi)).toBeTruthy();
  },
};
