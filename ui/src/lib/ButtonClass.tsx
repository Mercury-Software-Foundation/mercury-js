import styled from '@emotion/styled';

const BtnCom = styled.button`
  color: blue;
`;

export class Button {
  constructor(
    private body = 'Add',
    private iOnClick: null | (() => void) = null
  ) {}
  onClick(cb: () => void) {
    this.iOnClick = cb;
    return this;
  }
  content(body: string) {
    this.body = body;
    return this;
  }
  render() {
    let props = {};
    this.iOnClick && (props = { ...props, onClick: this.iOnClick });
    return <BtnCom {...props}>{this.body}</BtnCom>;
  }
}

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
    const btn = new Button();
    const { baseElement } = render(<div>{btn.render()}</div>);
    expect(baseElement).toBeTruthy();
  });

  it('should render the title', () => {
    const btn = new Button().content('Add').onClick(() => {
      console.log('clicked');
    });
    const { getByText } = render(<div>{btn.render()}</div>);
    expect(getByText('Add')).toBeTruthy();
  });
}
