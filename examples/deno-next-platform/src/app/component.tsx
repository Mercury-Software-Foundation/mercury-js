import Typography from '@mui/joy/Typography';

const components = async (): Promise<{ [x: string]: React.FC }> => {
  const Button = await import('@mui/joy/Button');

  return {
    Button: Button.default,
    Text: Typography,
  };
};

export default components;
