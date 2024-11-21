import { Theme } from '@emotion/react';
import styled from '@emotion/styled';

type ButtonProps = {
  role?: 'normal' | 'primary' | 'cancel' | 'destructive';
  variant?: 'filled' | 'tinted' | 'gray' | 'plain';
  size?: 'small' | 'medium' | 'large';
};

const mapRoleToBgColor = (
  role: ButtonProps['role'],
  variant: ButtonProps['variant']
) => {
  switch (role) {
    case 'primary':
      switch (variant) {
        case 'filled':
          return 'blue';
        case 'tinted':
          return 'lightblue';
        case 'gray':
          return 'darkgray';
        case 'plain':
          return 'transparent';
        default:
          return 'blue';
      }
    case 'cancel':
      switch (variant) {
        case 'filled':
          return 'gray';
        case 'tinted':
          return 'lightgray';
        case 'gray':
          return 'darkgray';
        case 'plain':
          return 'transparent';
        default:
          return 'gray';
      }
    case 'destructive':
      switch (variant) {
        case 'filled':
          return 'red';
        case 'tinted':
          return '#FFCCCB';
        case 'gray':
          return 'lightgray';
        case 'plain':
          return 'transparent';
        default:
          return 'red';
      }
    case 'normal':
      switch (variant) {
        case 'filled':
          return 'black';
        case 'tinted':
          return 'lightgray';
        case 'gray':
          return 'darkgray';
        case 'plain':
          return 'transparent';
        default:
          return 'transparent';
      }
    default:
      return 'transparent';
  }
};

const mapRoleToColor = (
  role: ButtonProps['role'],
  variant: ButtonProps['variant']
) => {
  switch (role) {
    case 'primary':
      switch (variant) {
        case 'filled':
          return 'white';
        case 'tinted':
          return 'blue';
        case 'gray':
          return 'blue';
        case 'plain':
          return 'blue';
        default:
          return 'white';
      }
    case 'cancel':
      switch (variant) {
        case 'filled':
          return 'white';
        case 'tinted':
          return 'black';
        case 'gray':
          return 'black';
        case 'plain':
          return 'darkslategray';
        default:
          return 'white';
      }
    case 'destructive':
      switch (variant) {
        case 'filled':
          return 'white';
        case 'tinted':
          return 'red';
        case 'gray':
          return 'red';
        case 'plain':
          return 'red';
        default:
          return 'white';
      }
    case 'normal':
      switch (variant) {
        case 'filled':
          return 'white';
        case 'tinted':
          return 'black';
        case 'gray':
          return 'black';
        case 'plain':
          return 'black';
        default:
          return 'black';
      }
    default:
      return 'black';
  }
};
const mapBrSize = (size: ButtonProps['size']) => {
  switch (size) {
    case 'small':
      return '50px';
    case 'medium':
      return '80px';
    case 'large':
      return '14px';
    default:
      return '50px';
  }
};

const mapFontSize = (size: ButtonProps['size']) => {
  switch (size) {
    case 'small':
      return '14px';
    case 'medium':
      return '18px';
    case 'large':
      return '20px';
    default:
      return '14px';
  }
};
const mapPaddingSize = (size: ButtonProps['size']) => {
  switch (size) {
    case 'small':
      return '8px 10px';
    case 'medium':
      return '8px 12px';
    case 'large':
      return '14px 20px';
    default:
      return '8px 10px';
  }
};

const Button = styled.button<ButtonProps>`
  color: pink;
  border-radius: ${(props) => mapBrSize(props.size)};
  border: none;
  padding: ${(props) => mapPaddingSize(props.size)};
  font-size: ${(props) => mapFontSize(props.size)};
  background-color: ${(props) => mapRoleToBgColor(props.role, props.variant)};
  color: ${(props) => mapRoleToColor(props.role, props.variant)};
`;

export default Button;

if (import.meta.vitest) {
  // add tests related to your file here
  // For more information please visit the Vitest docs site here: https://vitest.dev/guide/in-source.html

  const { it, expect, beforeEach } = import.meta.vitest;
  let render: typeof import('@testing-library/react').render;

  beforeEach(async () => {
    render = (await import('@testing-library/react')).render;
  });

  it('should render successfully', () => {
    const { baseElement } = render(<Button>Add</Button>);
    expect(baseElement).toBeTruthy();
  });

  it('should render the title', () => {
    const { getByText } = render(<Button>Pink Button</Button>);
    expect(getByText('Pink Button')).toBeTruthy();
  });
}
