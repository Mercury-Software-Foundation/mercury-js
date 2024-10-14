import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import Counter from '@/components/counter';
import Box from '@mui/joy/Box';

export interface IComponents {
  Button: Button;
  Text: Typography;
  Counter: Counter;
  Box: Box;
}

const components: IComponents = {
  Button: Button,
  Text: Typography,
  Counter: Counter,
  Box: Box,
};

export default components;
