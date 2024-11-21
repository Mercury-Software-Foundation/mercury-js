import styled from '@emotion/styled';

const StyledUi = styled.div`
  color: pink;
`;

export function Ui() {
  return (
    <StyledUi>
      <h1>Welcome to UI</h1>
    </StyledUi>
  );
}

export default Ui;

if (import.meta.vitest) {
  // add tests related to your file here
  // For more information please visit the Vitest docs site here: https://vitest.dev/guide/in-source.html

  const { it, expect, beforeEach } = import.meta.vitest;
  let render: typeof import('@testing-library/react').render;

  beforeEach(async () => {
    render = (await import('@testing-library/react')).render;
  });

  it('should render successfully', () => {
    const { baseElement } = render(<Ui />);
    expect(baseElement).toBeTruthy();
  });

  it('should render the title', () => {
    const { getByText } = render(<Ui />);
    expect(getByText('Welcome to UI')).toBeTruthy();
  });
}
